import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  const serviceAccount = {
    type: 'service_account',
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://oauth2.googleapis.com/token',
    auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
    client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL}`,
  };

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID,
  });
}

export interface FCMNotificationData {
  to: string;
  title: string;
  body: string;
  data?: Record<string, string>;
  sound?: string;
  badge?: number;
  priority?: 'normal' | 'high';
}

export interface FCMResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send a push notification via Firebase Cloud Messaging
 */
export async function sendFCMNotification(notification: FCMNotificationData): Promise<FCMResponse> {
  try {
    const message: admin.messaging.Message = {
      token: notification.to,
      notification: {
        title: notification.title,
        body: notification.body,
      },
      data: notification.data || {},
      android: {
        notification: {
          sound: notification.sound || 'default',
          priority: notification.priority === 'high' ? 'high' : 'default',
          channelId: 'task_notifications', // You'll need to create this channel in the app
        },
      },
      apns: {
        payload: {
          aps: {
            sound: notification.sound || 'default',
            badge: notification.badge || 1,
            alert: {
              title: notification.title,
              body: notification.body,
            },
          },
        },
      },
    };

    const response = await admin.messaging().send(message);
    
    return {
      success: true,
      messageId: response,
    };
  } catch (error: any) {
    console.error('FCM send error:', error);
    
    // Handle common FCM errors
    let errorMessage = 'Unknown FCM error';
    if (error.code === 'messaging/registration-token-not-registered') {
      errorMessage = 'Token not registered';
    } else if (error.code === 'messaging/invalid-registration-token') {
      errorMessage = 'Invalid token';
    } else if (error.code === 'messaging/mismatched-credential') {
      errorMessage = 'Invalid credentials';
    } else if (error.message) {
      errorMessage = error.message;
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Send notifications to multiple tokens
 */
export async function sendBulkFCMNotifications(notifications: FCMNotificationData[]): Promise<{
  successful: number;
  failed: number;
  results: FCMResponse[];
}> {
  const results: FCMResponse[] = [];
  let successful = 0;
  let failed = 0;

  // Send notifications in parallel (but be careful of rate limits)
  const promises = notifications.map(async (notification) => {
    const result = await sendFCMNotification(notification);
    if (result.success) {
      successful++;
    } else {
      failed++;
    }
    return result;
  });

  const responses = await Promise.all(promises);
  results.push(...responses);

  return {
    successful,
    failed,
    results,
  };
}

/**
 * Validate if a FCM token looks valid
 */
export function isValidFCMToken(token: string): boolean {
  if (!token || typeof token !== 'string') {
    return false;
  }
  
  // Basic validation - FCM tokens are typically long strings
  return token.length > 50 && !token.includes(' ');
}
