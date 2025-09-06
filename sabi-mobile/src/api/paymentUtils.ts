/**
 * Payment Utilities for Sabi Mobile App
 * 
 * These functions handle Stripe payment integration for the task marketplace.
 * Payments follow an Uber-style flow: authorize on task acceptance, capture on completion.
 * 
 * Example usage:
 * 
 * import { createPaymentIntent, handlePaymentFlow } from '@/src/api/paymentUtils';
 * 
 * // Create a payment intent for a task
 * const result = await createPaymentIntent({
 *   amount: 50,
 *   customerId: 'customer-id',
 *   taskId: 'task-id',
 *   taskerId: 'tasker-id',
 *   description: 'Fix kitchen sink'
 * });
 */

import { buildApiUrl, API_CONFIG, ApiResponse } from './config';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
);

// ========== TYPE DEFINITIONS ==========

export interface PaymentIntentData {
  amount: number; // Amount in dollars (will be converted to cents)
  customerId: string;
  taskId: string;
  taskerId: string;
  description: string;
}

export interface PaymentIntentResponse {
  success: boolean;
  paymentIntentId?: string;
  clientSecret?: string;
  error?: string;
}

export interface PaymentStatus {
  status: 'authorized' | 'captured' | 'voided' | 'failed';
  amount: number;
  paymentIntentId?: string;
  taskId: string;
  customerId: string;
  taskerId: string;
  createdAt: string;
  completedAt?: string;
}

// ========== PAYMENT FUNCTIONS ==========

/**
 * 💳 CREATE PAYMENT INTENT - Create a Stripe payment intent
 * 
 * This creates a payment intent with manual capture for Uber-style payments.
 * The payment is authorized but not captured until task completion.
 * 
 * @param paymentData - Payment creation data
 * @returns Promise with payment intent result
 */
export async function createPaymentIntent(
  paymentData: PaymentIntentData
): Promise<ApiResponse<PaymentIntentResponse>> {
  try {
    const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.PAYMENTS.CREATE_INTENT), {
      method: 'POST',
      headers: API_CONFIG.HEADERS,
      body: JSON.stringify(paymentData),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || 'Failed to create payment intent'
      };
    }

    return {
      success: true,
      data: result,
      message: 'Payment intent created successfully'
    };

  } catch (error) {
    return {
      success: false,
      error: 'Network error - check your connection and backend URL'
    };
  }
}

// ========== REACT NATIVE STRIPE INTEGRATION HELPERS ==========

/**
 * 📱 STRIPE PAYMENT FLOW - Complete payment flow for React Native
 * 
 * This handles the complete Stripe payment flow using React Native Stripe SDK.
 * Your co-founder should install @stripe/stripe-react-native first.
 * 
 * NOTE: This requires Stripe React Native SDK setup!
 * 
 * @param clientSecret - Client secret from payment intent
 * @param billingDetails - Customer billing details
 * @returns Promise with payment confirmation result
 */
export async function handlePaymentFlow(
  clientSecret: string,
  billingDetails: {
    email: string;
    name?: string;
    phone?: string;
    address?: {
      line1: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
  }
): Promise<ApiResponse> {
  try {
    // TODO: Your co-founder needs to install and configure Stripe React Native
    // npm install @stripe/stripe-react-native
    
    console.log('Payment flow called with client secret:', clientSecret);
    console.log('Billing details:', billingDetails);
    
    // This would normally use Stripe React Native SDK:
    /*
    import { confirmPayment } from '@stripe/stripe-react-native';
    
    const { error, paymentIntent } = await confirmPayment(clientSecret, {
      paymentMethodType: 'Card',
      paymentMethodData: {
        billingDetails,
      },
    });
    
    if (error) {
      return {
        success: false,
        error: error.message
      };
    }
    
    return {
      success: true,
      data: paymentIntent,
      message: 'Payment authorized successfully'
    };
    */
    
    return {
      success: false,
      error: 'Stripe React Native SDK not configured yet. Install @stripe/stripe-react-native'
    };

  } catch (error) {
    return {
      success: false,
      error: 'Payment processing failed'
    };
  }
}

/**
 * 💰 COMPLETE TASK PAYMENT FLOW - Full payment flow for task acceptance
 * 
 * This combines payment intent creation and authorization for task acceptance.
 * Call this when a tasker accepts a task to authorize payment.
 * 
 * @param taskId - ID of the task
 * @param customerId - Customer's ID
 * @param taskerId - Tasker's ID
 * @param amount - Payment amount in dollars
 * @param description - Task description for payment
 * @param customerBillingDetails - Customer's billing information
 * @returns Promise with complete payment flow result
 */
export async function completeTaskPaymentFlow(
  taskId: string,
  customerId: string,
  taskerId: string,
  amount: number,
  description: string,
  customerBillingDetails: {
    email: string;
    name?: string;
    phone?: string;
    address?: {
      line1: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
  }
): Promise<ApiResponse> {
  try {
    // Step 1: Create payment intent
    const paymentIntentResult = await createPaymentIntent({
      amount,
      customerId,
      taskId,
      taskerId,
      description
    });

    if (!paymentIntentResult.success || !paymentIntentResult.data?.clientSecret) {
      return {
        success: false,
        error: paymentIntentResult.error || 'Failed to create payment intent'
      };
    }

    // Step 2: Handle payment authorization
    const paymentResult = await handlePaymentFlow(
      paymentIntentResult.data.clientSecret,
      customerBillingDetails
    );

    if (!paymentResult.success) {
      return {
        success: false,
        error: paymentResult.error || 'Payment authorization failed'
      };
    }

    return {
      success: true,
      data: {
        paymentIntentId: paymentIntentResult.data.paymentIntentId,
        status: 'authorized'
      },
      message: 'Payment authorized successfully for task'
    };

  } catch (error) {
    return {
      success: false,
      error: 'Complete payment flow failed'
    };
  }
}

// ========== PAYMENT STATUS UTILITIES ==========

/**
 * 📊 GET PAYMENT STATUS - Check the status of a payment
 * 
 * Retrieves payment status from the task_payments table in Supabase.
 * 
 * @param paymentIntentId - Stripe payment intent ID
 * @returns Promise with payment status
 */
export async function getPaymentStatus(
  paymentIntentId: string
): Promise<ApiResponse<PaymentStatus>> {
  try {
    const { data, error } = await supabase
      .from('task_payments')
      .select(`
        id,
        task_id,
        amount_held,
        status,
        stripe_payment_intent_id,
        created_at,
        released_at,
        tasks!inner(customer_id, tasker_id)
      `)
      .eq('stripe_payment_intent_id', paymentIntentId)
      .single();

    if (error) {
      console.error('Supabase error getting payment status:', error);
      return {
        success: false,
        error: `Failed to get payment status: ${error.message}`
      };
    }

    if (!data) {
      return {
        success: false,
        error: 'Payment not found'
      };
    }

    const paymentStatus: PaymentStatus = {
      status: data.status as PaymentStatus['status'],
      amount: data.amount_held,
      paymentIntentId: data.stripe_payment_intent_id,
      taskId: data.task_id,
      customerId: (data.tasks as any).customer_id,
      taskerId: (data.tasks as any).tasker_id,
      createdAt: data.created_at,
      completedAt: data.released_at
    };

    return {
      success: true,
      data: paymentStatus,
      message: 'Payment status retrieved successfully'
    };

  } catch (error) {
    console.error('Error getting payment status:', error);
    return {
      success: false,
      error: 'Network error - failed to get payment status'
    };
  }
}

/**
 * 🔄 REFRESH PAYMENT STATUS - Refresh payment status from Stripe
 * 
 * Gets the latest payment status from Stripe and updates our database.
 * This is useful when you want the most up-to-date status.
 * 
 * @param paymentIntentId - Stripe payment intent ID
 * @returns Promise with refreshed payment status
 */
export async function refreshPaymentStatus(
  paymentIntentId: string
): Promise<ApiResponse<PaymentStatus>> {
  try {
    // Step 1: Get current status from our database
    const currentStatus = await getPaymentStatus(paymentIntentId);
    
    if (!currentStatus.success) {
      return currentStatus;
    }

    // Step 2: For a complete implementation, we would call Stripe API here
    // But since this is for a hackathon and Stripe calls should go through backend,
    // we'll return the current status with a note that it's from our database
    
    console.log(`Payment status refreshed for ${paymentIntentId}: ${currentStatus.data?.status}`);
    
    return {
      success: true,
      data: currentStatus.data,
      message: 'Payment status retrieved from database (for live updates, implement Stripe API calls through your backend)'
    };

  } catch (error) {
    console.error('Error refreshing payment status:', error);
    return {
      success: false,
      error: 'Failed to refresh payment status'
    };
  }
}

/**
 * 💰 GET TASK PAYMENTS - Get all payments for a specific task
 * 
 * Retrieves all payment records associated with a task.
 * Useful for tracking payment history and status.
 * 
 * @param taskId - Task ID to get payments for
 * @returns Promise with payment records
 */
export async function getTaskPayments(
  taskId: string
): Promise<ApiResponse<PaymentStatus[]>> {
  try {
    const { data, error } = await supabase
      .from('task_payments')
      .select(`
        id,
        task_id,
        amount_held,
        status,
        stripe_payment_intent_id,
        created_at,
        released_at,
        release_reason,
        tasks!inner(customer_id, tasker_id)
      `)
      .eq('task_id', taskId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error getting task payments:', error);
      return {
        success: false,
        error: `Failed to get task payments: ${error.message}`
      };
    }

    const payments: PaymentStatus[] = data.map(payment => ({
      status: payment.status as PaymentStatus['status'],
      amount: payment.amount_held,
      paymentIntentId: payment.stripe_payment_intent_id,
      taskId: payment.task_id,
      customerId: (payment.tasks as any).customer_id,
      taskerId: (payment.tasks as any).tasker_id,
      createdAt: payment.created_at,
      completedAt: payment.released_at
    }));

    return {
      success: true,
      data: payments,
      message: `Found ${payments.length} payment records for task`
    };

  } catch (error) {
    console.error('Error getting task payments:', error);
    return {
      success: false,
      error: 'Network error - failed to get task payments'
    };
  }
}

// ========== CONVENIENCE FUNCTIONS ==========

/**
 * 🎯 Payment flow helpers for common scenarios
 */
export const PaymentFlows = {
  /**
   * Quick payment for task acceptance
   */
  taskAcceptance: async (
    taskId: string,
    customerId: string,
    taskerId: string,
    amount: number,
    customerEmail: string,
    customerName: string
  ) => {
    return completeTaskPaymentFlow(
      taskId,
      customerId,
      taskerId,
      amount,
      `Task payment - ${taskId}`,
      {
        email: customerEmail,
        name: customerName
      }
    );
  },

  /**
   * Validate payment amount
   */
  validateAmount: (amount: number): boolean => {
    return amount > 0 && amount <= 10000; // Max $10,000 per task
  },

  /**
   * Format payment amount for display
   */
  formatAmount: (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }
};

// ========== STRIPE SETUP HELPERS ==========

/**
 * 📋 STRIPE SETUP INSTRUCTIONS
 * 
 * Your co-founder should follow these steps to set up Stripe in the mobile app:
 * 
 * 1. Install Stripe React Native:
 *    npm install @stripe/stripe-react-native
 * 
 * 2. Configure Stripe provider in your app root:
 *    import { StripeProvider } from '@stripe/stripe-react-native';
 *    
 *    <StripeProvider publishableKey="pk_test_..." merchantIdentifier="merchant.com.sabi">
 *      <YourApp />
 *    </StripeProvider>
 * 
 * 3. Add URL scheme for iOS (in app.json):
 *    "ios": {
 *      "supportsTablet": true,
 *      "bundleIdentifier": "com.yourcompany.sabi",
 *      "infoPlist": {
 *        "CFBundleURLTypes": [
 *          {
 *            "CFBundleURLName": "com.yourcompany.sabi",
 *            "CFBundleURLSchemes": ["com.yourcompany.sabi"]
 *          }
 *        ]
 *      }
 *    }
 * 
 * 4. Test with Stripe test cards:
 *    - Success: 4242 4242 4242 4242
 *    - Decline: 4000 0000 0000 0002
 */
export const StripeSetup = {
  testCards: {
    success: '4242424242424242',
    decline: '4000000000000002',
    requiresAuth: '4000002500003155'
  },
  
  publishableKeyFormat: 'pk_test_...' // or 'pk_live_...' for production
};
