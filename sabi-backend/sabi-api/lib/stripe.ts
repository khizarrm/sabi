import Stripe from 'stripe';

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export interface CreatePaymentIntentData {
  amount: number; // in dollars (will be converted to cents)
  customerId: string;
  taskId: string;
  taskerId: string;
  description: string;
}

export interface PaymentIntentResult {
  success: boolean;
  paymentIntentId?: string;
  clientSecret?: string;
  error?: string;
}

/**
 * Create a Stripe Payment Intent with manual capture (Uber-style)
 */
export async function createPaymentIntent(data: CreatePaymentIntentData): Promise<PaymentIntentResult> {
  try {
    const { amount, customerId, taskId, taskerId, description } = data;

    // Convert dollars to cents (Stripe uses cents)
    const amountInCents = Math.round(amount * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      capture_method: 'manual', // KEY: This enables Uber-style auth → capture flow
      payment_method_types: ['card'],
      description: description,
      metadata: {
        taskId,
        customerId,
        taskerId,
        originalAmount: amount.toString()
      }
    });

    return {
      success: true,
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret || undefined
    };

  } catch (error: any) {
    console.error('Stripe payment intent creation error:', error);
    
    return {
      success: false,
      error: error.message || 'Failed to create payment intent'
    };
  }
}

/**
 * Capture an authorized payment (when customer approves task completion)
 */
export async function capturePaymentIntent(paymentIntentId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await stripe.paymentIntents.capture(paymentIntentId);
    
    console.log(`Payment captured successfully: ${paymentIntentId}`);
    return { success: true };

  } catch (error: any) {
    console.error('Stripe payment capture error:', error);
    
    return {
      success: false,
      error: error.message || 'Failed to capture payment'
    };
  }
}

/**
 * Cancel an authorized payment (when task is cancelled)
 */
export async function cancelPaymentIntent(paymentIntentId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await stripe.paymentIntents.cancel(paymentIntentId);
    
    console.log(`Payment cancelled successfully: ${paymentIntentId}`);
    return { success: true };

  } catch (error: any) {
    console.error('Stripe payment cancellation error:', error);
    
    return {
      success: false,
      error: error.message || 'Failed to cancel payment'
    };
  }
}

/**
 * Get payment intent details
 */
export async function getPaymentIntent(paymentIntentId: string) {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return { success: true, paymentIntent };
  } catch (error: any) {
    console.error('Error retrieving payment intent:', error);
    return { success: false, error: error.message };
  }
}

export default stripe;
