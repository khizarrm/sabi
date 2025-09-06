import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendBulkFCMNotifications, isValidFCMToken } from '@/lib/fcm';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Using service role key for admin operations
);

interface AcceptApplicationPayload {
  taskId: string;
  applicationId: string;
  customerId: string;
}

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body: AcceptApplicationPayload = await request.json();
    
    // Validate required fields
    const { taskId, applicationId, customerId } = body;
    
    if (!taskId || !applicationId || !customerId) {
      return NextResponse.json(
        { error: 'Missing required fields: taskId, applicationId, customerId' },
        { status: 400 }
      );
    }

    // Start a transaction to ensure data consistency
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select('id, status, customer_id, title, task_address, agreed_price')
      .eq('id', taskId)
      .eq('customer_id', customerId)
      .eq('status', 'posted')
      .single();

    if (taskError || !task) {
      return NextResponse.json(
        { error: 'Task not found, not yours, or already assigned' },
        { status: 404 }
      );
    }

    // Get the application being accepted
    const { data: acceptedApplication, error: appError } = await supabase
      .from('task_applications')
      .select('id, task_id, tasker_id, proposed_price, status')
      .eq('id', applicationId)
      .eq('task_id', taskId)
      .eq('status', 'pending')
      .single();

    if (appError || !acceptedApplication) {
      return NextResponse.json(
        { error: 'Application not found or already processed' },
        { status: 404 }
      );
    }

    // Get all pending applications for this task (to reject the others)
    const { data: allApplications, error: allAppsError } = await supabase
      .from('task_applications')
      .select('id, tasker_id, status')
      .eq('task_id', taskId)
      .eq('status', 'pending');

    if (allAppsError) {
      console.error('Error fetching applications:', allAppsError);
      return NextResponse.json(
        { error: 'Failed to fetch applications' },
        { status: 500 }
      );
    }

    // Update the task with the accepted tasker and agreed price
    const { error: taskUpdateError } = await supabase
      .from('tasks')
      .update({
        tasker_id: acceptedApplication.tasker_id,
        agreed_price: acceptedApplication.proposed_price,
        status: 'assigned',
        updated_at: new Date().toISOString()
      })
      .eq('id', taskId);

    if (taskUpdateError) {
      console.error('Error updating task:', taskUpdateError);
      return NextResponse.json(
        { error: 'Failed to update task' },
        { status: 500 }
      );
    }

    // Accept the chosen application
    const { error: acceptError } = await supabase
      .from('task_applications')
      .update({
        status: 'accepted',
        responded_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', applicationId);

    if (acceptError) {
      console.error('Error accepting application:', acceptError);
      return NextResponse.json(
        { error: 'Failed to accept application' },
        { status: 500 }
      );
    }

    // Reject all other pending applications
    const otherApplicationIds = allApplications
      ?.filter(app => app.id !== applicationId && app.status === 'pending')
      .map(app => app.id) || [];

    if (otherApplicationIds.length > 0) {
      const { error: rejectError } = await supabase
        .from('task_applications')
        .update({
          status: 'rejected',
          responded_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .in('id', otherApplicationIds);

      if (rejectError) {
        console.error('Error rejecting other applications:', rejectError);
        // Continue even if rejecting others fails
      }
    }

    // Get user information for notifications
    const taskerIds = allApplications?.map(app => app.tasker_id) || [];
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, first_name, push_token, device_type, push_enabled')
      .in('id', taskerIds)
      .eq('push_enabled', true)
      .not('push_token', 'is', null);

    if (usersError) {
      console.error('Error fetching users for notifications:', usersError);
      // Continue without notifications rather than failing the acceptance
    }

    // Send notifications
    const notifications: any[] = [];
    
    if (users && users.length > 0) {
      // Find the accepted tasker
      const acceptedTasker = users.find(user => user.id === acceptedApplication.tasker_id);
      const rejectedTaskers = users.filter(user => user.id !== acceptedApplication.tasker_id);

      // Notification for accepted tasker
      if (acceptedTasker && isValidFCMToken(acceptedTasker.push_token)) {
        notifications.push({
          to: acceptedTasker.push_token,
          title: 'Application Accepted! 🎉',
          body: `Your application for "${task.title}" has been accepted. You can start the task now.`,
          data: {
            taskId,
            type: 'application_accepted',
            applicationId,
            agreedPrice: acceptedApplication.proposed_price.toString()
          },
          sound: 'default',
          badge: 1,
          priority: 'normal' as const
        });
      }

      // Notifications for rejected taskers
      rejectedTaskers.forEach(tasker => {
        if (isValidFCMToken(tasker.push_token)) {
          notifications.push({
            to: tasker.push_token,
            title: 'Application Update',
            body: `The task "${task.title}" has been assigned to another tasker. Keep looking for more opportunities!`,
            data: {
              taskId,
              type: 'application_rejected',
              applicationId: ''
            },
            sound: 'default',
            badge: 1,
            priority: 'normal' as const
          });
        }
      });
    }

    // Send push notifications
    let notificationResults = { successful: 0, failed: 0 };
    if (notifications.length > 0) {
      try {
        notificationResults = await sendBulkFCMNotifications(notifications);
        console.log(`Sent ${notificationResults.successful}/${notifications.length} acceptance notifications`);
      } catch (error) {
        console.error('Error sending notifications:', error);
        // Don't fail the acceptance if notifications fail
      }
    }

    // Create in-app notifications
    const inAppNotifications: any[] = [];
    
    if (users && users.length > 0) {
      // For accepted tasker
      const acceptedTasker = users.find(user => user.id === acceptedApplication.tasker_id);
      if (acceptedTasker) {
        inAppNotifications.push({
          user_id: acceptedTasker.id,
          title: 'Application Accepted! 🎉',
          message: `Your application for "${task.title}" has been accepted. You can start the task now.`,
          notification_type: 'task_update',
          related_task_id: taskId,
          is_read: false
        });
      }

      // For rejected taskers
      const rejectedTaskers = users.filter(user => user.id !== acceptedApplication.tasker_id);
      rejectedTaskers.forEach(tasker => {
        inAppNotifications.push({
          user_id: tasker.id,
          title: 'Application Update',
          message: `The task "${task.title}" has been assigned to another tasker.`,
          notification_type: 'task_update',
          related_task_id: taskId,
          is_read: false
        });
      });
    }

    if (inAppNotifications.length > 0) {
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert(inAppNotifications);

      if (notificationError) {
        console.error('Error creating in-app notifications:', notificationError);
      }
    }

    console.log(`Task ${taskId}: Application ${applicationId} accepted, ${otherApplicationIds.length} others rejected`);

    return NextResponse.json({
      message: 'Application accepted successfully',
      task_id: taskId,
      application_id: applicationId,
      tasker_id: acceptedApplication.tasker_id,
      agreed_price: acceptedApplication.proposed_price,
      notifications_sent: notificationResults.successful,
      total_applications_processed: allApplications?.length || 0
    });

  } catch (error) {
    console.error('Error in accept-application route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Optional: Add GET method for testing
export async function GET() {
  return NextResponse.json({
    message: 'POST /api/tasks/accept-application - Accept a tasker application for a task',
    required_fields: ['taskId', 'applicationId', 'customerId']
  });
}
