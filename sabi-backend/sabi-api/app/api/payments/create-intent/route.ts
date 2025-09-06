import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createPaymentIntent } from '@/lib/stripe';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface CreatePaymentIntentPayload {
  taskId: string;
  customerId: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: CreatePaymentIntentPayload = await request.json();
    const { taskId, customerId } = body;
    
    if (!taskId || !customerId) {
      return NextResponse.json(
        { error: 'Missing required fields: taskId, customerId' },
        { status: 400 }
      );
    }

    // Get task details
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select('id, title, customer_id, tasker_id, agreed_price, budget_min, status')
      .eq('id', taskId)
      .eq('customer_id', customerId)
      .single();

    if (taskError || !task) {
      return NextResponse.json(
        { error: 'Task not found or not yours' },
        { status: 404 }
      );
    }

    // Only create payment intent for assigned tasks
    if (task.status !== 'assigned') {
      return NextResponse.json(
        { error: 'Task must be assigned to create payment intent' },
        { status: 400 }
      );
    }

    const amount = task.agreed_price || task.budget_min;
    
    // Create Stripe Payment Intent
    const stripeResult = await createPaymentIntent({
      amount: amount,
      customerId: customerId,
      taskId: taskId,
      taskerId: task.tasker_id,
      description: `Payment for task: ${task.title}`
    });

    if (!stripeResult.success) {
      return NextResponse.json(
        { error: `Stripe error: ${stripeResult.error}` },
        { status: 500 }
      );
    }

    // Update task payment record with Stripe payment intent ID
    const { error: paymentUpdateError } = await supabase
      .from('task_payments')
      .update({
        stripe_payment_intent_id: stripeResult.paymentIntentId
      })
      .eq('task_id', taskId)
      .eq('status', 'authorized');

    if (paymentUpdateError) {
      console.error('Error updating payment record:', paymentUpdateError);
      // Continue even if update fails
    }

    console.log(`Payment intent created for task ${taskId}: ${stripeResult.paymentIntentId}`);

    return NextResponse.json({
      message: 'Payment intent created successfully',
      payment_intent_id: stripeResult.paymentIntentId,
      client_secret: stripeResult.clientSecret,
      amount: amount,
      currency: 'usd',
      task_id: taskId
    });

  } catch (error) {
    console.error('Error in create payment intent route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'POST /api/payments/create-intent - Create Stripe payment intent for a task',
    required_fields: ['taskId', 'customerId'],
    description: 'Creates a Stripe payment intent with manual capture for Uber-style payments'
  });
}
