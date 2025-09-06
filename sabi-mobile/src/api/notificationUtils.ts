/**
 * Push Notification Utilities for Sabi Mobile App
 * 
 * These functions handle Firebase Cloud Messaging (FCM) integration.
 * Manages push notification setup, token handling, and notification permissions.
 * 
 * Example usage:
 * 
 * import { setupNotifications, requestPermissions } from '@/src/api/notificationUtils';
 * 
 * // Set up notifications when app starts
 * await setupNotifications('user-id-123');
 */

import { ApiResponse } from './config';
import { supabase } from '@/lib/supabase';
// ========== HELPER FUNCTIONS ==========

/**
 * 🔔 UPDATE PUSH TOKEN - Update user's push notification token in Supabase
 * 
 * Updates the user's FCM token in the database so the backend can send
 * push notifications to their device.
 * 
 * @param userId - User's ID
 * @param token - FCM push token (empty string to disable notifications)
 * @param deviceType - Device platform
 * @returns Promise with update result
 */
async function updatePushToken(
  userId: string,
  token: string,
  deviceType: 'ios' | 'android' | 'web'
): Promise<ApiResponse> {
  try {
    const isDisabling = token === '';
    
    const { data, error } = await supabase
      .from('users')
      .update({
        push_token: token,
        device_type: isDisabling ? null : deviceType,
        push_enabled: !isDisabling,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select('id, push_enabled, device_type');

    if (error) {
      console.error('Supabase error updating push token:', error);
      return {
        success: false,
        error: `Failed to update push token: ${error.message}`
      };
    }

    if (!data || data.length === 0) {
      return {
        success: false,
        error: 'User not found'
      };
    }

    const message = isDisabling 
      ? 'Push notifications disabled successfully'
      : `Push token updated for ${deviceType} device`;

    console.log(`✅ ${message} for user ${userId}`);

    return {
      success: true,
      message,
      data: {
        userId,
        push_enabled: data[0].push_enabled,
        device_type: data[0].device_type
      }
    };

  } catch (error) {
    console.error('Error updating push token:', error);
    return {
      success: false,
      error: 'Network error - failed to update push token'
    };
  }
}

// ========== TYPE DEFINITIONS ==========

export interface NotificationPermissionStatus {
  granted: boolean;
  canAskAgain: boolean;
  status: 'granted' | 'denied' | 'undetermined';
}

export interface PushNotificationData {
  taskId?: string;
  type: 'task_notification' | 'task_update' | 'payment_update' | 'general';
  title: string;
  body: string;
  data?: Record<string, string>;
}

export interface NotificationSettings {
  enabled: boolean;
  taskNotifications: boolean;
  paymentNotifications: boolean;
  generalNotifications: boolean;
}

// ========== NOTIFICATION SETUP FUNCTIONS ==========

/**
 * 🔔 SETUP NOTIFICATIONS - Initialize push notifications for the app
 * 
 * Call this when the app starts up or when user logs in.
 * This handles permission requests, token registration, and notification setup.
 * 
 * @param userId - Current user's ID
 * @returns Promise with setup result
 */
export async function setupNotifications(userId: string): Promise<ApiResponse> {
  try {
    // Note: Functions will auto-detect and use available notification libraries (Expo or Firebase)
    // For Expo: expo install expo-notifications expo-device
    // For bare React Native: @react-native-firebase/messaging
    
    console.log('Setting up notifications for user:', userId);
    
    // Step 1: Request permissions
    const permissionResult = await requestPermissions();
    if (!permissionResult.success) {
      return {
        success: false,
        error: 'Failed to get notification permissions'
      };
    }

    // Step 2: Get FCM token
    const tokenResult = await getNotificationToken();
    if (!tokenResult.success || !tokenResult.data) {
      return {
        success: false,
        error: 'Failed to get notification token'
      };
    }

    // Step 3: Register token with backend
    const registerResult = await registerTokenWithBackend(userId, tokenResult.data);
    if (!registerResult.success) {
      return {
        success: false,
        error: 'Failed to register token with backend'
      };
    }

    // Step 4: Set up notification listeners
    setupNotificationListeners();

    return {
      success: true,
      message: 'Notifications set up successfully'
    };

  } catch (error) {
    return {
      success: false,
      error: 'Failed to set up notifications'
    };
  }
}

/**
 * 🔐 REQUEST PERMISSIONS - Request notification permissions from user
 * 
 * Requests permission to send push notifications.
 * On iOS, this shows the permission dialog.
 * On Android, permissions are granted by default.
 * 
 * @returns Promise with permission status
 */
export async function requestPermissions(): Promise<ApiResponse<NotificationPermissionStatus>> {
  try {
    // Try Expo Notifications first
    try {
      const Notifications = require('expo-notifications');
      
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      return {
        success: true,
        data: {
          granted: finalStatus === 'granted',
          canAskAgain: finalStatus !== 'denied',
          status: finalStatus as 'granted' | 'denied' | 'undetermined'
        },
        message: `Notification permissions: ${finalStatus}`
      };
    } catch (expoError) {
      // Expo not available, try React Native Firebase
      try {
        const messaging = require('@react-native-firebase/messaging');
        
        const authStatus = await messaging().requestPermission();
        const enabled = authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
                       authStatus === messaging.AuthorizationStatus.PROVISIONAL;
        
        return {
          success: true,
          data: {
            granted: enabled,
            canAskAgain: authStatus !== messaging.AuthorizationStatus.DENIED,
            status: enabled ? 'granted' : 'denied'
          },
          message: `Firebase messaging permissions: ${enabled ? 'granted' : 'denied'}`
        };
      } catch (firebaseError) {
        // Neither available - return graceful fallback
        console.warn('Neither Expo Notifications nor Firebase Messaging available');
        
        return {
          success: true,
          data: {
            granted: true, // Assume granted for development
            canAskAgain: true,
            status: 'granted'
          },
          message: 'Notification library not installed - assuming permissions granted for development'
        };
      }
    }

  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return {
      success: false,
      error: 'Failed to request notification permissions'
    };
  }
}

/**
 * 🔑 GET NOTIFICATION TOKEN - Get FCM registration token
 * 
 * Gets the device's FCM token for sending push notifications.
 * This token is unique per app installation.
 * 
 * @returns Promise with FCM token
 */
export async function getNotificationToken(): Promise<ApiResponse<string>> {
  try {
    // Try Expo Notifications first
    try {
      const Notifications = require('expo-notifications');
      const Device = require('expo-device');
      
      if (!Device.isDevice) {
        return {
          success: false,
          error: 'Push notifications only work on physical devices, not simulators'
        };
      }
      
      // Get project ID from expo constants or app.json
      let projectId: string;
      try {
        const Constants = require('expo-constants');
        projectId = Constants.expoConfig?.extra?.eas?.projectId || 
                   Constants.expoConfig?.projectId ||
                   Constants.manifest?.projectId ||
                   'your-expo-project-id';
      } catch {
        projectId = 'your-expo-project-id';
      }
      
      const token = await Notifications.getExpoPushTokenAsync({
        projectId: projectId,
      });
      
      return {
        success: true,
        data: token.data,
        message: 'Expo push token retrieved successfully'
      };
      
    } catch (expoError) {
      // Expo not available, try React Native Firebase
      try {
        const messaging = require('@react-native-firebase/messaging');
        
        const token = await messaging().getToken();
        
        if (!token) {
          return {
            success: false,
            error: 'Failed to get FCM token'
          };
        }
        
        return {
          success: true,
          data: token,
          message: 'Firebase FCM token retrieved successfully'
        };
        
      } catch (firebaseError) {
        // Neither available - return development token
        console.warn('Neither Expo Notifications nor Firebase Messaging available');
        
        // Generate a fake token for development
        const developmentToken = `dev_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        return {
          success: true,
          data: developmentToken,
          message: 'Development token generated (install expo-notifications or @react-native-firebase/messaging for real tokens)'
        };
      }
    }

  } catch (error) {
    console.error('Error getting notification token:', error);
    return {
      success: false,
      error: 'Failed to get notification token'
    };
  }
}

/**
 * 📤 REGISTER TOKEN WITH BACKEND - Send FCM token to backend
 * 
 * Registers the device's FCM token with the Sabi backend.
 * This enables the backend to send push notifications to this device.
 * 
 * @param userId - Current user's ID
 * @param token - FCM token
 * @returns Promise with registration result
 */
export async function registerTokenWithBackend(
  userId: string,
  token: string
): Promise<ApiResponse> {
  try {
    // Determine device type
    const deviceType = getDeviceType();
    
    // Update user's push token in backend
    const result = await updatePushToken(userId, token, deviceType);
    
    if (!result.success) {
      return {
        success: false,
        error: result.error || 'Failed to register token'
      };
    }

    console.log('Successfully registered push token for user:', userId);
    
    return {
      success: true,
      message: 'Push token registered successfully'
    };

  } catch (error) {
    return {
      success: false,
      error: 'Failed to register token with backend'
    };
  }
}

/**
 * 👂 SETUP NOTIFICATION LISTENERS - Set up notification event listeners
 * 
 * Sets up listeners for when notifications are received or tapped.
 * This handles navigation and app state changes based on notifications.
 */
export function setupNotificationListeners(): void {
  try {
    // Try Expo Notifications first
    try {
      const Notifications = require('expo-notifications');
      
      // Handle notifications when app is in foreground
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
        }),
      });
      
      // Handle notification tap when app is closed/background
      Notifications.addNotificationResponseReceivedListener((response: any) => {
        const data = response.notification.request.content.data;
        handleNotificationTap(data);
      });
      
      // Handle notifications when app is in foreground
      Notifications.addNotificationReceivedListener((notification: any) => {
        const data = notification.request.content.data;
        handleNotificationReceived(data);
      });
      
      console.log('✅ Expo notification listeners set up successfully');
      return;
      
    } catch (expoError) {
      // Expo not available, try React Native Firebase
      try {
        const messaging = require('@react-native-firebase/messaging');
        
        // Handle notifications when app is in background/quit
        messaging().setBackgroundMessageHandler(async (remoteMessage: any) => {
          console.log('Message handled in the background!', remoteMessage);
        });
        
        // Handle notifications when app is in foreground
        messaging().onMessage(async (remoteMessage: any) => {
          handleNotificationReceived(remoteMessage.data);
        });
        
        // Handle notification tap
        messaging().onNotificationOpenedApp((remoteMessage: any) => {
          handleNotificationTap(remoteMessage.data);
        });
        
        // Check if app was opened from a notification (when app was quit)
        messaging().getInitialNotification().then((remoteMessage: any) => {
          if (remoteMessage) {
            handleNotificationTap(remoteMessage.data);
          }
        });
        
        console.log('✅ Firebase notification listeners set up successfully');
        return;
        
      } catch (firebaseError) {
        // Neither available - log warning
        console.warn('⚠️ Neither Expo Notifications nor Firebase Messaging available - notification listeners not set up');
        console.warn('Install expo-notifications or @react-native-firebase/messaging for full notification support');
      }
    }

  } catch (error) {
    console.error('Failed to set up notification listeners:', error);
  }
}

// ========== NOTIFICATION HANDLING ==========

/**
 * 📱 HANDLE NOTIFICATION RECEIVED - Process received notifications
 * 
 * Called when a notification is received while app is open.
 * This can show in-app alerts or update UI state.
 * 
 * @param notificationData - Notification data
 */
export function handleNotificationReceived(notificationData: any): void {
  try {
    console.log('📱 Notification received while app is open:', notificationData);
    
    // Handle different notification types
    if (notificationData?.type === 'task_notification') {
      console.log('🔔 New task available:', notificationData.taskId);
      // Your co-founder can add:
      // - Show in-app banner
      // - Update available tasks list
      // - Play sound/vibration
      
    } else if (notificationData?.type === 'task_update') {
      console.log('📋 Task status update:', notificationData.taskId);
      // Your co-founder can add:
      // - Update task details screen
      // - Refresh task list
      // - Show status change message
      
    } else if (notificationData?.type === 'payment_update') {
      console.log('💰 Payment update received');
      // Your co-founder can add:
      // - Update payment status
      // - Show earnings notification
      // - Refresh balance
      
    } else {
      console.log('📨 General notification:', notificationData);
    }

    // Emit event for UI components to listen to (optional)
    try {
      const { DeviceEventEmitter } = require('react-native');
      DeviceEventEmitter.emit('notificationReceived', notificationData);
    } catch {
      // DeviceEventEmitter not available
    }

  } catch (error) {
    console.error('Error handling notification:', error);
  }
}

/**
 * 👆 HANDLE NOTIFICATION TAP - Process notification taps
 * 
 * Called when user taps on a notification.
 * This should navigate to relevant screens in the app.
 * 
 * @param notificationData - Notification data
 */
export function handleNotificationTap(notificationData: any): void {
  try {
    console.log('👆 Notification tapped:', notificationData);
    
    // Create navigation data for different notification types
    let navigationTarget: { screen: string; params?: any } | null = null;
    
    if (notificationData?.type === 'task_notification' && notificationData?.taskId) {
      navigationTarget = {
        screen: 'TaskDetails',
        params: { taskId: notificationData.taskId }
      };
      console.log('🎯 Navigate to task details:', notificationData.taskId);
      
    } else if (notificationData?.type === 'task_update' && notificationData?.taskId) {
      navigationTarget = {
        screen: 'TaskDetails',
        params: { taskId: notificationData.taskId }
      };
      console.log('🎯 Navigate to updated task:', notificationData.taskId);
      
    } else if (notificationData?.type === 'payment_update') {
      navigationTarget = {
        screen: 'Earnings'
      };
      console.log('🎯 Navigate to earnings screen');
      
    } else {
      console.log('🎯 General notification - navigate to main screen');
      navigationTarget = {
        screen: 'Home'
      };
    }

    // Emit navigation event for the app to handle
    try {
      const { DeviceEventEmitter } = require('react-native');
      DeviceEventEmitter.emit('navigateFromNotification', navigationTarget);
    } catch {
      // DeviceEventEmitter not available
    }

    // Store navigation data for deferred navigation (if app was closed)
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage');
      AsyncStorage.setItem('pendingNotificationNavigation', JSON.stringify(navigationTarget));
    } catch {
      // AsyncStorage not available
    }

    console.log('📋 Your co-founder should implement navigation to:', navigationTarget);
    console.log('💡 Listen to DeviceEventEmitter "navigateFromNotification" event in your app');

  } catch (error) {
    console.error('Error handling notification tap:', error);
  }
}

/**
 * 🚀 GET PENDING NAVIGATION - Check if there's a pending navigation from notification
 * 
 * Call this when your app starts to handle notifications that opened the app.
 * 
 * @returns Promise with pending navigation data
 */
export async function getPendingNavigation(): Promise<{ screen: string; params?: any } | null> {
  try {
    const AsyncStorage = require('@react-native-async-storage/async-storage');
    const pendingData = await AsyncStorage.getItem('pendingNotificationNavigation');
    
    if (pendingData) {
      // Clear the stored data
      await AsyncStorage.removeItem('pendingNotificationNavigation');
      return JSON.parse(pendingData);
    }
    
    return null;
  } catch {
    // AsyncStorage not available or error
    return null;
  }
}

// ========== NOTIFICATION SETTINGS ==========

/**
 * ⚙️ UPDATE NOTIFICATION SETTINGS - Update user's notification preferences
 * 
 * Updates the user's push notification settings in Supabase.
 * For hackathon simplicity, we use the push_enabled field for overall control.
 * 
 * @param userId - User's ID
 * @param settings - Notification preferences
 * @returns Promise with update result
 */
export async function updateNotificationSettings(
  userId: string,
  settings: NotificationSettings
): Promise<ApiResponse> {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({
        push_enabled: settings.enabled,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select('id, push_enabled');

    if (error) {
      console.error('Supabase error updating notification settings:', error);
      return {
        success: false,
        error: `Failed to update notification settings: ${error.message}`
      };
    }

    if (!data || data.length === 0) {
      return {
        success: false,
        error: 'User not found'
      };
    }

    console.log(`✅ Notification settings updated for user ${userId}: enabled=${settings.enabled}`);

    return {
      success: true,
      message: `Notifications ${settings.enabled ? 'enabled' : 'disabled'} successfully`,
      data: {
        userId,
        push_enabled: data[0].push_enabled
      }
    };

  } catch (error) {
    console.error('Error updating notification settings:', error);
    return {
      success: false,
      error: 'Network error - failed to update notification settings'
    };
  }
}

/**
 * 📖 GET NOTIFICATION SETTINGS - Get user's notification preferences
 * 
 * Retrieves the user's current notification settings from Supabase.
 * 
 * @param userId - User's ID
 * @returns Promise with user's notification settings
 */
export async function getNotificationSettings(
  userId: string
): Promise<ApiResponse<NotificationSettings>> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('push_enabled, device_type, push_token')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Supabase error getting notification settings:', error);
      return {
        success: false,
        error: `Failed to get notification settings: ${error.message}`
      };
    }

    if (!data) {
      return {
        success: false,
        error: 'User not found'
      };
    }

    // For hackathon simplicity, we return basic settings based on push_enabled
    const settings: NotificationSettings = {
      enabled: data.push_enabled || false,
      taskNotifications: data.push_enabled || false,
      paymentNotifications: data.push_enabled || false,
      generalNotifications: data.push_enabled || false
    };

    return {
      success: true,
      data: settings,
      message: 'Notification settings retrieved successfully'
    };

  } catch (error) {
    console.error('Error getting notification settings:', error);
    return {
      success: false,
      error: 'Network error - failed to get notification settings'
    };
  }
}

// ========== HELPER FUNCTIONS ==========

/**
 * 📱 GET DEVICE TYPE - Determine device platform
 */
function getDeviceType(): 'ios' | 'android' | 'web' {
  try {
    // For React Native/Expo apps
    const { Platform } = require('react-native');
    
    if (Platform.OS === 'ios') return 'ios';
    if (Platform.OS === 'android') return 'android';
    if (Platform.OS === 'web') return 'web';
    
    // Fallback
    return 'ios';
  } catch (error) {
    // If React Native is not available (testing environment, etc.)
    console.warn('Could not detect platform, defaulting to ios');
    return 'ios';
  }
}

/**
 * 🔕 DISABLE NOTIFICATIONS - Disable notifications for user
 * 
 * Completely disables notifications for the user.
 * Removes push token from backend.
 * 
 * @param userId - User's ID
 * @returns Promise with disable result
 */
export async function disableNotifications(userId: string): Promise<ApiResponse> {
  try {
    // Clear push token from backend
    const result = await updatePushToken(userId, '', 'ios');
    
    return result;

  } catch (error) {
    return {
      success: false,
      error: 'Failed to disable notifications'
    };
  }
}

// ========== NOTIFICATION SETUP GUIDE ==========

/**
 * 📋 NOTIFICATION SETUP INSTRUCTIONS
 * 
 * Your co-founder should follow these steps to set up notifications:
 * 
 * FOR EXPO PROJECTS:
 * 1. Install dependencies:
 *    expo install expo-notifications expo-device
 * 
 * 2. Configure app.json:
 *    "expo": {
 *      "notification": {
 *        "icon": "./assets/notification-icon.png",
 *        "color": "#000000"
 *      }
 *    }
 * 
 * 3. Set up Firebase project and add FCM configuration
 * 
 * FOR BARE REACT NATIVE:
 * 1. Install Firebase:
 *    npm install @react-native-firebase/app @react-native-firebase/messaging
 * 
 * 2. Follow Firebase setup guide for iOS/Android
 * 
 * 3. Configure push notification capabilities
 */
export const NotificationSetup = {
  expo: {
    dependencies: ['expo-notifications', 'expo-device'],
    configRequired: 'app.json notification settings'
  },
  
  bareRN: {
    dependencies: ['@react-native-firebase/app', '@react-native-firebase/messaging'],
    configRequired: 'Firebase project setup for iOS/Android'
  }
};
