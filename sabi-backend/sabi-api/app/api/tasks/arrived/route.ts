import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendBulkFCMNotifications, isValidFCMToken } from '@/lib/fcm';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface ArrivedPayload {
  taskId: string;
  taskerId: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ArrivedPayload = await request.json();
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
        { error: 'Task not found or not assigned to you' },
        { status: 404 }
      );
    }

    // Update task status to 'arrived' (we might need to add this status to your schema)
    // For now, we'll add a custom field or keep it as assigned but track arrival time
    const { error: updateError } = await supabase
      .from('tasks')
      .update({
        actual_start_time: new Date().toISOString(), // Use this to mark arrival
        updated_at: new Date().toISOString()
      })
      .eq('id', taskId);

    if (updateError) {
      console.error('Error updating task arrival:', updateError);
      return NextResponse.json(
        { error: 'Failed to update arrival status' },
        { status: 500 }
      );
    }

    // Get customer info for notification
    const { data: customer } = await supabase
      .from('users')
      .select('id, first_name, push_token, device_type, push_enabled')
      .eq('id', task.customer_id)
      .single();

    // Get tasker info for notification content
    const { data: tasker } = await supabase
      .from('users')
      .select('first_name, last_name')
      .eq('id', taskerId)
      .single();

    const notifications: any[] = [];
    const inAppNotifications: any[] = [];

    // Notify customer that tasker has arrived
    if (customer && customer.push_enabled && isValidFCMToken(customer.push_token)) {
      notifications.push({
        to: customer.push_token,
        title: 'Tasker Has Arrived! 📍',
        body: `${tasker?.first_name || 'Your tasker'} has arrived at your location and is ready to start "${task.title}".`,
        data: {
          taskId,
          type: 'tasker_arrived',
          taskerId
        },
        sound: 'default',
        badge: 1,
        priority: 'normal' as const
      });

      inAppNotifications.push({
        user_id: customer.id,
        title: 'Tasker Has Arrived! 📍',
        message: `${tasker?.first_name || 'Your tasker'} has arrived and is ready to start "${task.title}".`,
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
        console.log(`Sent arrival notification for task ${taskId}`);
      } catch (error) {
        console.error('Error sending arrival notifications:', error);
      }
    }

    // Create in-app notifications
    if (inAppNotifications.length > 0) {
      await supabase.from('notifications').insert(inAppNotifications);
    }

    console.log(`Tasker ${taskerId} arrived for task ${taskId}`);

    return NextResponse.json({
      message: 'Arrival status updated successfully',
      task_id: taskId,
      status: 'arrived',
      arrived_at: new Date().toISOString(),
      notifications_sent: notificationResults.successful
    });

  } catch (error) {
    console.error('Error in arrived route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'POST /api/tasks/arrived - Mark that tasker has arrived at task location',
    required_fields: ['taskId', 'taskerId']
  });
}
