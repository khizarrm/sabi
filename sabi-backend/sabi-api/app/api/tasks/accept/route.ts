import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendBulkFCMNotifications, isValidFCMToken } from '@/lib/fcm';
import { createPaymentIntent } from '@/lib/stripe';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Using service role key for admin operations
);

interface AcceptTaskPayload {
  taskId: string;
  taskerId: string;
}

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body: AcceptTaskPayload = await request.json();
    
    // Validate required fields
    const { taskId, taskerId } = body;
    
    if (!taskId || !taskerId) {
      return NextResponse.json(
        { error: 'Missing required fields: taskId, taskerId' },
        { status: 400 }
      );
    }

    // Validate tasker exists and is available
    const { data: tasker, error: taskerError } = await supabase
      .from('users')
      .select('id, first_name, last_name, is_available, is_active')
      .eq('id', taskerId)
      .eq('is_active', true)
      .single();

    if (taskerError || !tasker) {
      return NextResponse.json(
        { error: 'Tasker not found or inactive' },
        { status: 404 }
      );
    }

    if (!tasker.is_available) {
      return NextResponse.json(
        { error: 'Tasker is not currently available' },
        { status: 400 }
      );
    }

    // CRITICAL: Atomic operation to claim the task (first-come-first-served)
    // This prevents race conditions when multiple taskers try to accept simultaneously
    const { data: updatedTask, error: taskUpdateError } = await supabase
      .from('tasks')
      .update({
        tasker_id: taskerId,
        status: 'assigned',
        updated_at: new Date().toISOString()
      })
      .eq('id', taskId)
      .eq('status', 'posted') // Only update if still posted (not already assigned)
      .is('tasker_id', null)   // Only update if no tasker assigned yet
      .select('id, title, description, task_address, budget_min, customer_id, created_at')
      .single();

    if (taskUpdateError || !updatedTask) {
      // Task was already assigned by someone else or doesn't exist
      return NextResponse.json(
        { error: 'Task is no longer available or already assigned' },
        { status: 409 } // Conflict status code
      );
    }

    console.log(`Task ${taskId} accepted by tasker ${taskerId}`);

    // AUTHORIZE PAYMENT (like Uber holding your card)
    // This doesn't charge the customer yet, just authorizes the amount
    const paymentAmount = updatedTask.budget_min; // This is our fixed price
    
    try {
      // Create Stripe Payment Intent with manual capture
      const stripeResult = await createPaymentIntent({
        amount: paymentAmount,
        customerId: updatedTask.customer_id,
        taskId: taskId,
        taskerId: taskerId,
        description: `Payment for task: ${updatedTask.title}`
      });

      if (stripeResult.success) {
        // Create payment authorization record with Stripe payment intent ID
        const { error: paymentAuthError } = await supabase
          .from('task_payments')
          .insert({
            task_id: taskId,
            amount_held: paymentAmount,
            status: 'authorized', // Payment is authorized but not captured
            stripe_payment_intent_id: stripeResult.paymentIntentId,
            created_at: new Date().toISOString()
          });

        if (paymentAuthError) {
          console.error('Error creating payment authorization record:', paymentAuthError);
          // Continue even if database record fails
        } else {
          console.log(`Stripe payment intent created and authorized: ${stripeResult.paymentIntentId}`);
        }
      } else {
        console.error('Stripe payment intent creation failed:', stripeResult.error);
        // For hackathon, continue even if Stripe fails
        // In production, you might want to rollback the task assignment
        
        // Create payment record without Stripe ID for fallback
        await supabase
          .from('task_payments')
          .insert({
            task_id: taskId,
            amount_held: paymentAmount,
            status: 'authorized',
            created_at: new Date().toISOString()
          });
      }
      
    } catch (paymentError) {
      console.error('Payment authorization failed:', paymentError);
      // Continue with task acceptance even if payment fails for demo purposes
    }

    // Get customer and other available users for notifications
    const { data: users } = await supabase
      .from('users')
      .select('id, first_name, push_token, device_type, push_enabled')
      .in('id', [updatedTask.customer_id])
      .eq('push_enabled', true)
      .not('push_token', 'is', null);

    // Get other available taskers who should be notified that the task is no longer available
    const { data: otherTaskers } = await supabase
      .from('users')
      .select('id, first_name, push_token, device_type, push_enabled')
      .eq('is_available', true)
      .eq('is_active', true)
      .eq('push_enabled', true)
      .neq('id', taskerId) // Exclude the tasker who just accepted
      .neq('id', updatedTask.customer_id) // Exclude the customer
      .not('push_token', 'is', null);

    const notifications: any[] = [];
    const inAppNotifications: any[] = [];

    // Notification for customer (their task was accepted)
    if (users && users.length > 0) {
      const customer = users[0];
      if (isValidFCMToken(customer.push_token)) {
        notifications.push({
          to: customer.push_token,
          title: 'Task Accepted! 🎉',
          body: `${tasker.first_name} has accepted your task "${updatedTask.title}". They will start working on it soon.`,
          data: {
            taskId,
            type: 'task_accepted',
            taskerId,
            taskerName: `${tasker.first_name} ${tasker.last_name}`
          },
          sound: 'default',
          badge: 1,
          priority: 'normal' as const
        });
      }

      // In-app notification for customer
      inAppNotifications.push({
        user_id: customer.id,
        title: 'Task Accepted! 🎉',
        message: `${tasker.first_name} has accepted your task "${updatedTask.title}".`,
        notification_type: 'task_update',
        related_task_id: taskId,
        is_read: false
      });
    }

    // Notifications for other available taskers (task no longer available)
    if (otherTaskers && otherTaskers.length > 0) {
      otherTaskers.forEach(otherTasker => {
        if (isValidFCMToken(otherTasker.push_token)) {
          notifications.push({
            to: otherTasker.push_token,
            title: 'Task No Longer Available',
            body: `The task "${updatedTask.title}" has been accepted by another tasker. Keep looking for new opportunities!`,
            data: {
              taskId,
              type: 'task_no_longer_available'
            },
            sound: 'default',
            badge: 1,
            priority: 'normal' as const
          });
        }

        // In-app notification for other taskers
        inAppNotifications.push({
          user_id: otherTasker.id,
          title: 'Task No Longer Available',
          message: `The task "${updatedTask.title}" has been accepted by another tasker.`,
          notification_type: 'task_update',
          related_task_id: taskId,
          is_read: false
        });
      });
    }

    // Send push notifications
    let notificationResults = { successful: 0, failed: 0 };
    if (notifications.length > 0) {
      try {
        notificationResults = await sendBulkFCMNotifications(notifications);
        console.log(`Sent ${notificationResults.successful}/${notifications.length} task acceptance notifications`);
      } catch (error) {
        console.error('Error sending push notifications:', error);
        // Don't fail the acceptance if notifications fail
      }
    }

    // Create in-app notifications
    if (inAppNotifications.length > 0) {
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert(inAppNotifications);

      if (notificationError) {
        console.error('Error creating in-app notifications:', notificationError);
      }
    }

    // Optionally set tasker as unavailable (like Uber drivers become unavailable during ride)
    // Uncomment if you want this behavior:
    /*
    await supabase
      .from('users')
      .update({ is_available: false })
      .eq('id', taskerId);
    */

    return NextResponse.json({
      message: 'Task accepted successfully',
      task: {
        id: updatedTask.id,
        title: updatedTask.title,
        description: updatedTask.description,
        task_address: updatedTask.task_address,
        agreed_price: updatedTask.budget_min, // Using budget_min as agreed price
        status: 'assigned',
        tasker_id: taskerId,
        customer_id: updatedTask.customer_id
      },
      tasker: {
        id: tasker.id,
        name: `${tasker.first_name} ${tasker.last_name}`
      },
      notifications: {
        sent: notificationResults.successful,
        failed: notificationResults.failed,
        customer_notified: (users?.length || 0) > 0,
        other_taskers_notified: otherTaskers?.length || 0
      }
    });

  } catch (error) {
    console.error('Error in accept task route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Optional: Add GET method for testing
export async function GET() {
  return NextResponse.json({
    message: 'POST /api/tasks/accept - Accept a task directly (Uber-style, first-come-first-served)',
    required_fields: ['taskId', 'taskerId'],
    example: {
      taskId: 'uuid-here',
      taskerId: 'uuid-here'
    },
    flow: [
      '1. Tasker sees notification and taps Accept',
      '2. First tasker to accept gets the task (atomic operation)',
      '3. Customer gets notified their task was accepted',
      '4. Other taskers get notified task is no longer available',
      '5. Task status changes to "assigned"'
    ]
  });
}
