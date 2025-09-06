import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendBulkFCMNotifications, isValidFCMToken } from '@/lib/fcm';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface CancelTaskPayload {
  taskId: string;
  userId: string; // Can be customer or tasker
  reason: string;
  cancelledBy: 'customer' | 'tasker';
}

export async function POST(request: NextRequest) {
  try {
    const body: CancelTaskPayload = await request.json();
    const { taskId, userId, reason, cancelledBy } = body;
    
    if (!taskId || !userId || !reason || !cancelledBy) {
      return NextResponse.json(
        { error: 'Missing required fields: taskId, userId, reason, cancelledBy' },
        { status: 400 }
      );
    }

    // Verify task exists and user has permission to cancel
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select('id, title, customer_id, tasker_id, status, agreed_price, budget_min')
      .eq('id', taskId)
      .single();

    if (taskError || !task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    // Check authorization
    const isCustomer = task.customer_id === userId;
    const isTasker = task.tasker_id === userId;
    
    if (!isCustomer && !isTasker) {
      return NextResponse.json(
        { error: 'Unauthorized: You are not associated with this task' },
        { status: 403 }
      );
    }

    // Verify the cancelledBy field matches the user
    if ((cancelledBy === 'customer' && !isCustomer) || (cancelledBy === 'tasker' && !isTasker)) {
      return NextResponse.json(
        { error: 'Mismatch between user and cancelledBy field' },
        { status: 400 }
      );
    }

    // Check if task can be cancelled (not already completed)
    if (task.status === 'completed') {
      return NextResponse.json(
        { error: 'Cannot cancel a completed task' },
        { status: 400 }
      );
    }

    if (task.status === 'cancelled') {
      return NextResponse.json(
        { error: 'Task is already cancelled' },
        { status: 400 }
      );
    }

    // Update task status to cancelled
    const { error: updateError } = await supabase
      .from('tasks')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString(),
        // Store cancellation info in description or add new fields if needed
        description: `${task.title}\n\nCancelled by: ${cancelledBy}\nReason: ${reason}`
      })
      .eq('id', taskId);

    if (updateError) {
      console.error('Error cancelling task:', updateError);
      return NextResponse.json(
        { error: 'Failed to cancel task' },
        { status: 500 }
      );
    }

    // Get user info for notifications
    const userIds = [task.customer_id, task.tasker_id].filter(id => id && id !== userId);
    const { data: users } = await supabase
      .from('users')
      .select('id, first_name, last_name, push_token, device_type, push_enabled')
      .in('id', userIds);

    const { data: cancellingUser } = await supabase
      .from('users')
      .select('first_name, last_name')
      .eq('id', userId)
      .single();

    const notifications: any[] = [];
    const inAppNotifications: any[] = [];

    // Notify the other party about cancellation
    if (users && users.length > 0) {
      users.forEach(user => {
        if (user.push_enabled && isValidFCMToken(user.push_token)) {
          const cancellerName = `${cancellingUser?.first_name || 'The'} ${cancellingUser?.last_name || cancelledBy}`;
          
          notifications.push({
            to: user.push_token,
            title: 'Task Cancelled ❌',
            body: `${cancellerName} has cancelled the task "${task.title}". Reason: ${reason}`,
            data: {
              taskId,
              type: 'task_cancelled',
              cancelledBy,
              reason
            },
            sound: 'default',
            badge: 1,
            priority: 'normal' as const
          });

          inAppNotifications.push({
            user_id: user.id,
            title: 'Task Cancelled ❌',
            message: `${cancellerName} has cancelled the task "${task.title}". Reason: ${reason}`,
            notification_type: 'task_update',
            related_task_id: taskId,
            is_read: false
          });
        }
      });
    }

    // Send notifications
    let notificationResults = { successful: 0, failed: 0 };
    if (notifications.length > 0) {
      try {
        notificationResults = await sendBulkFCMNotifications(notifications);
        console.log(`Sent task cancellation notifications for task ${taskId}`);
      } catch (error) {
        console.error('Error sending cancellation notifications:', error);
      }
    }

    // Create in-app notifications
    if (inAppNotifications.length > 0) {
      await supabase.from('notifications').insert(inAppNotifications);
    }

    // If task was assigned and tasker cancelled, make tasker available again
    if (cancelledBy === 'tasker' && task.tasker_id) {
      await supabase
        .from('users')
        .update({ is_available: true })
        .eq('id', task.tasker_id);
    }

    // VOID PAYMENT AUTHORIZATION (like Uber releasing the hold on your card)
    // Since no money was actually charged, we just void the authorization
    if (task.status === 'in_progress' || task.status === 'assigned') {
      const { data: paymentRecord, error: voidError } = await supabase
        .from('task_payments')
        .update({
          status: 'voided', // Authorization is voided, no money moves
          released_at: new Date().toISOString(),
          release_reason: `Task cancelled by ${cancelledBy}: ${reason}`
        })
        .eq('task_id', taskId)
        .eq('status', 'authorized') // Only void if it was authorized (not captured)
        .select()
        .single();

      if (voidError || !paymentRecord) {
        console.error('Error voiding payment authorization:', voidError);
        // Continue with cancellation even if payment void fails
      } else {
        console.log(`Payment authorization voided for cancelled task ${taskId}`);
        
        // TODO: Integrate with Stripe to cancel the payment intent
        // await stripe.paymentIntents.cancel(paymentRecord.stripe_payment_intent_id);
      }
    }

    console.log(`Task ${taskId} cancelled by ${cancelledBy}: ${reason}`);

    return NextResponse.json({
      message: 'Task cancelled successfully',
      task_id: taskId,
      status: 'cancelled',
      cancelled_by: cancelledBy,
      cancelled_at: new Date().toISOString(),
      reason: reason,
      notifications_sent: notificationResults.successful,
      payment_authorization_voided: task.status === 'in_progress' || task.status === 'assigned'
    });

  } catch (error) {
    console.error('Error in cancel task route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'POST /api/tasks/cancel - Cancel a task (by customer or tasker)',
    required_fields: ['taskId', 'userId', 'reason', 'cancelledBy'],
    cancelledBy_options: ['customer', 'tasker'],
    common_reasons: [
      'Change of plans',
      'Found another solution', 
      'Emergency came up',
      'Tasker unavailable',
      'Customer not responding',
      'Safety concerns',
      'Other'
    ]
  });
}
