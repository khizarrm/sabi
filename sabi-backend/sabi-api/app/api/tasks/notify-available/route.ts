import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendBulkFCMNotifications, isValidFCMToken } from '@/lib/fcm';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Using service role key for admin operations
);

interface NotificationPayload {
  taskId: string;
  title: string;
  description: string;
  fixedPrice: number;
  taskAddress: string;
  customerId: string;
}


export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body: NotificationPayload = await request.json();
    
    // Validate required fields
    const { taskId, title, description, fixedPrice, taskAddress, customerId } = body;
    
    if (!taskId || !title || !customerId || fixedPrice == null) {
      return NextResponse.json(
        { error: 'Missing required fields: taskId, title, customerId, fixedPrice' },
        { status: 400 }
      );
    }

    if (fixedPrice <= 0) {
      return NextResponse.json(
        { error: 'Fixed price must be greater than 0' },
        { status: 400 }
      );
    }

    // Verify the task exists and is in 'posted' status
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select('id, status, customer_id')
      .eq('id', taskId)
      .eq('status', 'posted')
      .single();

    if (taskError || !task) {
      return NextResponse.json(
        { error: 'Task not found or not in posted status' },
        { status: 404 }
      );
    }

    if (task.customer_id !== customerId) {
      return NextResponse.json(
        { error: 'Unauthorized: Task does not belong to this customer' },
        { status: 403 }
      );
    }

    // Get all available users (excluding the customer who posted the task)
    const { data: availableUsers, error: usersError } = await supabase
      .from('users')
      .select('id, push_token, device_type, first_name, current_latitude, current_longitude, push_enabled')
      .eq('is_available', true)
      .eq('is_active', true)
      .eq('push_enabled', true)
      .neq('id', customerId)
      .not('push_token', 'is', null);

    if (usersError) {
      console.error('Error fetching available users:', usersError);
      return NextResponse.json(
        { error: 'Failed to fetch available users' },
        { status: 500 }
      );
    }

    if (!availableUsers || availableUsers.length === 0) {
      return NextResponse.json(
        { message: 'No available users to notify', notified_count: 0 },
        { status: 200 }
      );
    }

    // Prepare notification data
    const notificationTitle = `New Task: ${title}`;
    const notificationMessage = `${description.substring(0, 100)}${description.length > 100 ? '...' : ''}\nPays: $${fixedPrice}\nLocation: ${taskAddress}`;
    
    // Create in-app notifications for all available users
    const notificationInserts = availableUsers.map(user => ({
      user_id: user.id,
      title: notificationTitle,
      message: notificationMessage,
      notification_type: 'task_update' as const,
      related_task_id: taskId,
      is_read: false
    }));

    const { error: notificationError } = await supabase
      .from('notifications')
      .insert(notificationInserts);

    if (notificationError) {
      console.error('Error creating notifications:', notificationError);
      // Continue with push notifications even if in-app notifications fail
    }

    // Filter users with valid FCM tokens
    const usersWithValidTokens = availableUsers.filter(user => 
      user.push_token && isValidFCMToken(user.push_token)
    );

    if (usersWithValidTokens.length === 0) {
      return NextResponse.json({
        message: 'No users with valid push tokens to notify',
        notified_count: 0
      });
    }

    // Prepare push notification payload
    const pushNotifications = usersWithValidTokens.map(user => ({
      to: user.push_token,
      title: notificationTitle,
      body: notificationMessage,
      data: {
        taskId,
        type: 'new_task',
        fixedPrice: fixedPrice.toString(),
        customerId,
        taskAddress: taskAddress || ''
      },
      sound: 'default',
      badge: 1,
      priority: 'normal' as const
    }));

    // Send push notifications using Firebase Cloud Messaging
    console.log(`Sending FCM notifications to ${pushNotifications.length} users...`);
    
    const fcmResults = await sendBulkFCMNotifications(pushNotifications);
    
    // Collect failed tokens for cleanup (optional: mark invalid tokens in database)
    const failedTokens = fcmResults.results
      .map((result, index) => result.success ? null : pushNotifications[index].to)
      .filter(token => token !== null) as string[];

    if (failedTokens.length > 0) {
      console.log(`Failed to send to ${failedTokens.length} tokens:`, failedTokens);
      
      // Optional: Mark failed tokens as invalid in database
      // This helps clean up stale tokens over time
      try {
        await supabase
          .from('users')
          .update({ push_enabled: false })
          .in('push_token', failedTokens);
      } catch (error) {
        console.error('Failed to update invalid tokens:', error);
      }
    }

    // Log the notification event
    console.log(`Task ${taskId}: Sent ${fcmResults.successful}/${usersWithValidTokens.length} FCM notifications`);

    return NextResponse.json({
      message: 'Task notifications sent successfully',
      task_id: taskId,
      total_available_users: availableUsers.length,
      users_with_valid_tokens: usersWithValidTokens.length,
      fcm_notifications_sent: fcmResults.successful,
      fcm_notifications_failed: fcmResults.failed,
      failed_tokens: failedTokens
    });

  } catch (error) {
    console.error('Error in notify-available route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Optional: Add GET method for testing
export async function GET() {
  return NextResponse.json({
    message: 'POST /api/tasks/notify-available - Notify all available users about a new task',
    required_fields: ['taskId', 'title', 'customerId', 'fixedPrice'],
    optional_fields: ['description', 'taskAddress']
  });
}
