import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendBulkFCMNotifications, isValidFCMToken } from '@/lib/fcm';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface StartTaskPayload {
  taskId: string;
  taskerId: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: StartTaskPayload = await request.json();
    const { taskId, taskerId } = body;
    
    if (!taskId || !taskerId) {
      return NextResponse.json(
        { error: 'Missing required fields: taskId, taskerId' },
        { status: 400 }
      );
    }

    // Verify task is assigned to this tasker
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select('id, title, customer_id, status, tasker_id')
      .eq('id', taskId)
      .eq('tasker_id', taskerId)
      .eq('status', 'assigned')
      .single();

    if (taskError || !task) {
      return NextResponse.json(
        { error: 'Task not found, not assigned to you, or already started' },
        { status: 404 }
      );
    }

    // Update task status to 'in_progress'
    const { error: updateError } = await supabase
      .from('tasks')
      .update({
        status: 'in_progress',
        actual_start_time: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', taskId);

    if (updateError) {
      console.error('Error starting task:', updateError);
      return NextResponse.json(
        { error: 'Failed to start task' },
        { status: 500 }
      );
    }

    // Get customer and tasker info for notifications
    const { data: users } = await supabase
      .from('users')
      .select('id, first_name, last_name, push_token, device_type, push_enabled')
      .in('id', [task.customer_id, taskerId]);

    const customer = users?.find(user => user.id === task.customer_id);
    const tasker = users?.find(user => user.id === taskerId);

    const notifications: any[] = [];
    const inAppNotifications: any[] = [];

    // Notify customer that work has started
    if (customer && customer.push_enabled && isValidFCMToken(customer.push_token)) {
      notifications.push({
        to: customer.push_token,
        title: 'Work Started! 🔨',
        body: `${tasker?.first_name || 'Your tasker'} has started working on "${task.title}". You'll be notified when it's complete.`,
        data: {
          taskId,
          type: 'task_started',
          taskerId
        },
        sound: 'default',
        badge: 1,
        priority: 'normal' as const
      });

      inAppNotifications.push({
        user_id: customer.id,
        title: 'Work Started! 🔨',
        message: `${tasker?.first_name || 'Your tasker'} has started working on "${task.title}".`,
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
        console.log(`Sent task start notification for task ${taskId}`);
      } catch (error) {
        console.error('Error sending start notifications:', error);
      }
    }

    // Create in-app notifications
    if (inAppNotifications.length > 0) {
      await supabase.from('notifications').insert(inAppNotifications);
    }

    console.log(`Task ${taskId} started by tasker ${taskerId}`);

    return NextResponse.json({
      message: 'Task started successfully',
      task_id: taskId,
      status: 'in_progress',
      started_at: new Date().toISOString(),
      notifications_sent: notificationResults.successful
    });

  } catch (error) {
    console.error('Error in start task route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'POST /api/tasks/start - Start working on an assigned task',
    required_fields: ['taskId', 'taskerId']
  });
}
