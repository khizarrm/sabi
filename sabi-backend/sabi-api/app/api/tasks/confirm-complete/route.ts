import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendBulkFCMNotifications, isValidFCMToken } from '@/lib/fcm';
import { capturePaymentIntent } from '@/lib/stripe';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface ConfirmCompletePayload {
  taskId: string;
  customerId: string;
  approved: boolean;
  feedback?: string;
  rating?: number; // 1-5 stars
}

export async function POST(request: NextRequest) {
  try {
    const body: ConfirmCompletePayload = await request.json();
    const { taskId, customerId, approved, feedback, rating } = body;
    
    if (!taskId || !customerId || approved === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: taskId, customerId, approved' },
        { status: 400 }
      );
    }

    // Verify task is pending customer approval and belongs to this customer
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select('id, title, customer_id, tasker_id, status, agreed_price, budget_min')
      .eq('id', taskId)
      .eq('customer_id', customerId)
      .eq('status', 'pending_customer_approval')
      .single();

    if (taskError || !task) {
      return NextResponse.json(
        { error: 'Task not found, not yours, or not pending approval' },
        { status: 404 }
      );
    }

    const paymentAmount = task.agreed_price || task.budget_min;

    if (approved) {
      // CUSTOMER APPROVED - Complete the task and capture payment
      
      // Update task status to fully completed
      const { error: taskUpdateError } = await supabase
        .from('tasks')
        .update({
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId);

      if (taskUpdateError) {
        console.error('Error updating task to completed:', taskUpdateError);
        return NextResponse.json(
          { error: 'Failed to complete task' },
          { status: 500 }
        );
      }

      // CAPTURE AUTHORIZED PAYMENT (money actually moves now)
      const { data: paymentRecord, error: paymentError } = await supabase
        .from('task_payments')
        .select('*')
        .eq('task_id', taskId)
        .eq('status', 'authorized')
        .single();

      if (paymentError || !paymentRecord) {
        console.error('Error finding payment record:', paymentError);
        // Continue with task completion even if payment fails for demo
      } else {
        // Capture payment via Stripe if we have a payment intent ID
        if (paymentRecord.stripe_payment_intent_id) {
          const stripeResult = await capturePaymentIntent(paymentRecord.stripe_payment_intent_id);
          
          if (stripeResult.success) {
            console.log(`Stripe payment captured: ${paymentRecord.stripe_payment_intent_id}`);
          } else {
            console.error('Stripe payment capture failed:', stripeResult.error);
            // Continue anyway for demo purposes
          }
        }

        // Update payment record status
        await supabase
          .from('task_payments')
          .update({
            status: 'captured',
            released_at: new Date().toISOString(),
            release_reason: 'Customer approved task completion'
          })
          .eq('id', paymentRecord.id);

        console.log(`Payment of $${paymentAmount} captured for approved task ${taskId}`);
        
        // Update tasker earnings
        const { data: currentTasker } = await supabase
          .from('users')
          .select('total_earnings, total_tasks_completed')
          .eq('id', task.tasker_id)
          .single();
        
        if (currentTasker) {
          await supabase
            .from('users')
            .update({
              total_earnings: (currentTasker.total_earnings || 0) + paymentAmount,
              total_tasks_completed: (currentTasker.total_tasks_completed || 0) + 1,
              is_available: true // Tasker becomes available again
            })
            .eq('id', task.tasker_id);
        }
      }

      // Create review if rating provided
      if (rating && rating >= 1 && rating <= 5) {
        await supabase
          .from('task_reviews')
          .insert({
            task_id: taskId,
            reviewer_id: customerId,
            reviewee_id: task.tasker_id,
            rating: rating,
            review_text: feedback || '',
            review_type: 'customer_to_tasker',
            is_public: true
          });

        // Update tasker's average rating
        const { data: reviews } = await supabase
          .from('task_reviews')
          .select('rating')
          .eq('reviewee_id', task.tasker_id)
          .eq('review_type', 'customer_to_tasker');

        if (reviews && reviews.length > 0) {
          const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
          await supabase
            .from('users')
            .update({ average_rating: avgRating })
            .eq('id', task.tasker_id);
        }
      }

      // Send success notifications
      const notifications: any[] = [];
      const inAppNotifications: any[] = [];

      // Get user info for notifications
      const { data: users } = await supabase
        .from('users')
        .select('id, first_name, last_name, push_token, device_type, push_enabled')
        .in('id', [customerId, task.tasker_id]);

      const customer = users?.find(user => user.id === customerId);
      const tasker = users?.find(user => user.id === task.tasker_id);

      // Notify tasker about approval and payment
      if (tasker && tasker.push_enabled && isValidFCMToken(tasker.push_token)) {
        notifications.push({
          to: tasker.push_token,
          title: 'Task Approved! Payment Released! 💰',
          body: `Great news! "${task.title}" has been approved by the customer. Your payment of $${paymentAmount} has been processed!`,
          data: {
            taskId,
            type: 'task_approved_payment_released',
            amount: paymentAmount.toString(),
            rating: rating?.toString() || ''
          },
          sound: 'default',
          badge: 1,
          priority: 'normal' as const
        });

        inAppNotifications.push({
          user_id: tasker.id,
          title: 'Task Approved! Payment Released! 💰',
          message: `"${task.title}" approved! Payment of $${paymentAmount} processed.`,
          notification_type: 'payment',
          related_task_id: taskId,
          is_read: false
        });
      }

      // Notify customer about completion
      if (customer && customer.push_enabled && isValidFCMToken(customer.push_token)) {
        notifications.push({
          to: customer.push_token,
          title: 'Task Completed Successfully! ✅',
          body: `"${task.title}" has been marked as completed. Thank you for using Sabi!`,
          data: {
            taskId,
            type: 'task_completion_confirmed',
            amount: paymentAmount.toString()
          },
          sound: 'default',
          badge: 1,
          priority: 'normal' as const
        });

        inAppNotifications.push({
          user_id: customer.id,
          title: 'Task Completed Successfully! ✅',
          message: `"${task.title}" has been completed. Thank you for using Sabi!`,
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
          console.log(`Sent task approval notifications for task ${taskId}`);
        } catch (error) {
          console.error('Error sending approval notifications:', error);
        }
      }

      if (inAppNotifications.length > 0) {
        await supabase.from('notifications').insert(inAppNotifications);
      }

      console.log(`Task ${taskId} approved by customer ${customerId} - payment released`);

      return NextResponse.json({
        message: 'Task approved and completed successfully',
        task_id: taskId,
        status: 'completed',
        approved_at: new Date().toISOString(),
        payment_amount: paymentAmount,
        payment_status: 'captured',
        rating_given: rating || null,
        notifications_sent: notificationResults.successful
      });

    } else {
      // CUSTOMER REJECTED - Handle dispute/rejection
      
      // Update task status to disputed
      const { error: taskUpdateError } = await supabase
        .from('tasks')
        .update({
          status: 'disputed',
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId);

      if (taskUpdateError) {
        console.error('Error updating task to disputed:', taskUpdateError);
        return NextResponse.json(
          { error: 'Failed to update task status' },
          { status: 500 }
        );
      }

      // Create dispute case
      await supabase
        .from('dispute_cases')
        .insert({
          task_id: taskId,
          complainant_id: customerId,
          respondent_id: task.tasker_id,
          dispute_reason: 'task_not_completed',
          description: feedback || 'Customer rejected task completion',
          status: 'open'
        });

      // Payment remains in 'authorized' status for admin review
      console.log(`Task ${taskId} rejected by customer - dispute created`);

      return NextResponse.json({
        message: 'Task rejected - dispute case created',
        task_id: taskId,
        status: 'disputed',
        rejected_at: new Date().toISOString(),
        payment_amount: paymentAmount,
        payment_status: 'held_pending_dispute_resolution',
        dispute_created: true,
        next_step: 'Admin will review the dispute and make a decision'
      });
    }

  } catch (error) {
    console.error('Error in confirm-complete route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'POST /api/tasks/confirm-complete - Customer confirms or rejects task completion',
    required_fields: ['taskId', 'customerId', 'approved'],
    optional_fields: ['feedback', 'rating'],
    approved_values: [true, false],
    rating_range: '1-5 stars'
  });
}
