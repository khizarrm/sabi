/**
 * 🚀 Sabi Mobile API Utilities - Main Export File
 * 
 * This file exports all the API utilities your co-founder needs.
 * Import everything from here for consistent imports across the app.
 * 
 * Example usage in React components:
 * 
 * import { 
 *   createTask, 
 *   acceptTask, 
 *   TaskLifecycle,
 *   signIn, 
 *   getCurrentUser,
 *   setupNotifications 
 * } from '@/src/api';
 * 
 * // Create a task
 * const result = await createTask({ ... });
 * 
 * // Use task lifecycle
 * const lifecycle = new TaskLifecycle('task-id', 'user-id');
 * await lifecycle.accept();
 */

// ========== CONFIGURATION ==========
export * from './config';

// ========== TASK MANAGEMENT ==========
export {
  // Main task functions
  createTask,
  acceptTask,
  markArrived,
  startTask,
  completeTask,
  confirmCompletion,
  cancelTask,
  
  // Task lifecycle class
  TaskLifecycle,
  
  // Task templates for quick creation
  TaskTemplates,
  
  // Task query functions
  getUserTasks,
  getAvailableTasks,
  getTaskDetails,
  
  // Types
  type CreateTaskData,
  type Task,
  type TaskResponse,
} from './taskUtils';

// ========== AUTHENTICATION ==========
// Note: authUtils.ts was removed - your co-founder will implement auth directly
// You can add your own auth exports here when ready

// ========== PAYMENTS ==========
export {
  // Payment functions
  createPaymentIntent,
  handlePaymentFlow,
  completeTaskPaymentFlow,
  getPaymentStatus,
  refreshPaymentStatus,
  getTaskPayments,
  
  // Payment flows
  PaymentFlows,
  
  // Stripe setup info
  StripeSetup,
  
  // Types
  type PaymentIntentData,
  type PaymentIntentResponse,
  type PaymentStatus,
} from './paymentUtils';

// ========== NOTIFICATIONS ==========
export {
  // Notification setup
  setupNotifications,
  requestPermissions,
  getNotificationToken,
  registerTokenWithBackend,
  setupNotificationListeners,
  
  // Notification handling
  handleNotificationReceived,
  handleNotificationTap,
  getPendingNavigation,
  
  // Notification settings
  updateNotificationSettings,
  getNotificationSettings,
  disableNotifications,
  
  // Setup info
  NotificationSetup,
  
  // Types
  type NotificationPermissionStatus,
  type PushNotificationData,
  type NotificationSettings,
} from './notificationUtils';

// ========== CONVENIENCE EXPORTS ==========

/**
 * 🎯 QUICK START FUNCTIONS
 * 
 * These are the most commonly used functions your co-founder will need.
 * Perfect for getting started quickly.
 */
export const QuickStart = {
  // Task management
  tasks: {
    create: createTask,
    accept: acceptTask,
    lifecycle: TaskLifecycle,
  },
  
  // User management - implement your own auth functions
  // auth: { ... },
  
  // Notifications
  notifications: {
    setup: setupNotifications,
    requestPermissions,
  },
  
  // Payments
  payments: {
    createIntent: createPaymentIntent,
    completeFlow: completeTaskPaymentFlow,
  }
};

/**
 * 📚 USAGE EXAMPLES
 * 
 * Here are some common usage patterns for your co-founder:
 */
export const UsageExamples = {
  // Creating a task
  createTask: `
    import { createTask } from '@/src/api';
    
    const result = await createTask({
      customerId: user.id,
      title: 'Fix my sink',
      description: 'Kitchen sink is leaking badly',
      taskAddress: '123 Main St, San Francisco, CA',
      fixedPrice: 75
    });
    
    if (result.success) {
      console.log('Task created:', result.data.task.id);
    } else {
      console.error('Error:', result.error);
    }
  `,
  
  // Task lifecycle
  taskLifecycle: `
    import { TaskLifecycle } from '@/src/api';
    
    const lifecycle = new TaskLifecycle(taskId, userId);
    
    // Tasker flow
    await lifecycle.accept();
    await lifecycle.arrived();
    await lifecycle.start();
    await lifecycle.complete('All done!');
    
    // Customer flow (after tasker completes)
    await lifecycle.confirmComplete(true, 5, 'Great work!');
  `,
  
  // Authentication - implement your own
  authentication: `
    // Your co-founder will implement auth functions
    // Example structure:
    // const user = await yourAuthSystem.signIn(email, password);
    // const currentUser = await yourAuthSystem.getCurrentUser();
  `,
  
  // Notifications setup
  notifications: `
    import { setupNotifications } from '@/src/api';
    
    // Call this when app starts or user logs in
    const notifResult = await setupNotifications(user.id);
    if (notifResult.success) {
      console.log('Notifications ready!');
    }
  `
};

/**
 * 🛠️ SETUP CHECKLIST
 * 
 * Your co-founder should complete these setup steps:
 */
export const SetupChecklist = {
  required: [
    '✅ Update API_CONFIG.BASE_URL in config.ts with your backend URL',
    '✅ Install @stripe/stripe-react-native for payments',
    '✅ Install expo-notifications (Expo) or @react-native-firebase/messaging (bare RN)',
    '✅ Set up Stripe publishable key in your app',
    '✅ Configure Firebase project for push notifications',
    '✅ Add Supabase client configuration for auth',
  ],
  
  optional: [
    '🔧 Customize notification handling in notificationUtils.ts',
    '🔧 Add app-specific navigation in handleNotificationTap',
    '🔧 Implement proper error handling and user feedback',
    '🔧 Add loading states and progress indicators',
    '🔧 Set up proper TypeScript types for your specific use case',
  ]
};

// ========== TESTING UTILITIES ==========
export {
  testBackendConnection,
  testTaskCreation,
  testTaskAcceptance,
  testTaskLifecycle,
  runAllTests,
  getApiStatus,
  printTestReport,
} from './test-api';

// ========== TYPE DEFINITIONS ==========
export * from './types';

// ========== IMPORT SHORTCUTS ==========

// Re-export common types for convenience
import type { CreateTaskData, Task, UserProfile, PaymentIntentData } from './taskUtils';
export type { CreateTaskData, Task, UserProfile, PaymentIntentData };

/**
 * 🎉 ALL SET!
 * 
 * Your co-founder now has everything needed to integrate with the Sabi backend.
 * All API complexity is abstracted away into simple, typed functions.
 * 
 * Next steps:
 * 1. Update config.ts with the correct backend URL
 * 2. Install required dependencies (Stripe, notifications)
 * 3. Start using these functions in UI components
 * 4. Test with the backend to make sure everything works
 * 
 * Happy coding! 🚀
 */
