import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendBulkFCMNotifications, isValidFCMToken } from '@/lib/fcm';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface CompleteTaskPayload {
  taskId: string;
  taskerId: string;
  completionNotes?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: CompleteTaskPayload = await request.json();
    const { taskId, taskerId, completionNotes } = body;
    
    if (!taskId || !taskerId) {
      return NextResponse.json(
        { error: 'Missing required fields: taskId, taskerId' },
        { status: 400 }
      );
    }

    // Verify task is assigned to this tasker and in progress
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select('id, title, customer_id, status, tasker_id, agreed_price, budget_min')
      .eq('id', taskId)
      .eq('tasker_id', taskerId)
      .eq('status', 'in_progress')
      .single();

    if (taskError || !task) {
      return NextResponse.json(
        { error: 'Task not found, not assigned to you, or not in progress' },
        { status: 404 }
      );
    }

    // Update task status to 'pending_customer_approval' (not fully completed yet)
    const { error: updateError } = await supabase
      .from('tasks')
      .update({
        status: 'pending_customer_approval',
        actual_end_time: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...(completionNotes && { description: `${task.title}\n\nCompletion Notes: ${completionNotes}` })
      })
      .eq('id', taskId);

    if (updateError) {
      console.error('Error completing task:', updateError);
      return NextResponse.json(
        { error: 'Failed to complete task' },
        { status: 500 }
      );
    }

    // DO NOT CAPTURE PAYMENT YET - wait for customer confirmation
    // Payment remains in 'authorized' status until customer approves
    const paymentAmount = task.agreed_price || task.budget_min;
    
    console.log(`Task ${taskId} marked for completion by tasker - awaiting customer confirmation`);
    
    // Note: Payment will be captured in the confirm-complete route
    // This prevents money from moving until the customer approves the work

    // Get customer and tasker info for notifications
    const { data: users } = await supabase
      .from('users')
      .select('id, first_name, last_name, push_token, device_type, push_enabled')
      .in('id', [task.customer_id, taskerId]);

    const customer = users?.find(user => user.id === task.customer_id);
    const tasker = users?.find(user => user.id === taskerId);

    const notifications: any[] = [];
    const inAppNotifications: any[] = [];

    // Notify customer that task is pending their approval
    if (customer && customer.push_enabled && isValidFCMToken(customer.push_token)) {
      notifications.push({
        to: customer.push_token,
        title: 'Task Ready for Review! 👀',
        body: `${tasker?.first_name || 'Your tasker'} has completed "${task.title}". Please review the work and confirm completion to release payment of $${paymentAmount}.`,
        data: {
          taskId,
          type: 'task_pending_approval',
          taskerId,
          amount: paymentAmount.toString()
        },
        sound: 'default',
        badge: 1,
        priority: 'normal' as const
      });

      inAppNotifications.push({
        user_id: customer.id,
        title: 'Task Ready for Review! 👀',
        message: `${tasker?.first_name || 'Your tasker'} has completed "${task.title}". Please review and confirm completion.`,
        notification_type: 'task_update',
        related_task_id: taskId,
        is_read: false
      });
    }

    // Notify tasker that task is awaiting customer approval
    if (tasker && tasker.push_enabled && isValidFCMToken(tasker.push_token)) {
      notifications.push({
        to: tasker.push_token,
        title: 'Awaiting Customer Approval ⏳',
        body: `You've marked "${task.title}" as complete. Waiting for customer to review and approve. Payment of $${paymentAmount} will be released upon approval.`,
        data: {
          taskId,
          type: 'task_awaiting_approval',
          amount: paymentAmount.toString()
        },
        sound: 'default',
        badge: 1,
        priority: 'normal' as const
      });

      inAppNotifications.push({
        user_id: tasker.id,
        title: 'Awaiting Customer Approval ⏳',
        message: `You've marked "${task.title}" as complete. Waiting for customer approval.`,
        notification_type: 'task_update',
        related_task_id: taskId,
        is_read: false
      });
    }

    // Send notifications
    let notificationResults = { successful: 0, failed: 0 };
    if (notifications.length > 0) {
      try {
        notificationResults = await sendBulkFCMNotifications(notifications);
        console.log(`Sent task completion notifications for task ${taskId}`);
      } catch (error) {
        console.error('Error sending completion notifications:', error);
      }
    }

    // Create in-app notifications
    if (inAppNotifications.length > 0) {
      await supabase.from('notifications').insert(inAppNotifications);
    }

    // DO NOT set tasker as available yet - wait for customer confirmation
    // This prevents the tasker from taking new jobs while this one is pending approval
    console.log(`Tasker ${taskerId} remains unavailable until customer confirms completion`);

    console.log(`Task ${taskId} completed by tasker ${taskerId}`);

    return NextResponse.json({
      message: 'Task marked for completion - awaiting customer approval',
      task_id: taskId,
      status: 'pending_customer_approval',
      marked_complete_at: new Date().toISOString(),
      payment_amount: paymentAmount,
      payment_status: 'authorized_awaiting_approval',
      notifications_sent: notificationResults.successful,
      next_step: 'Customer must review and confirm completion to release payment'
    });

  } catch (error) {
    console.error('Error in complete task route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'POST /api/tasks/complete - Mark task as completed and initiate payment process',
    required_fields: ['taskId', 'taskerId'],
    optional_fields: ['completionNotes']
  });
}
