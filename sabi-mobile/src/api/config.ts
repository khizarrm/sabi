/**
 * API Configuration for Sabi Mobile App
 * 
 * This file contains the base configuration for API calls to the Sabi backend.
 * Update the BASE_URL to match your backend deployment.
 */

// TODO: Update this URL to match your backend deployment
// For local development, use your computer's IP address (not localhost)
// For production, use your deployed backend URL
export const API_CONFIG = {
  BASE_URL: 'http://localhost:3000', // Backend running on port 3000
  ENDPOINTS: {
    // Task endpoints
    TASKS: {
      CREATE: '/api/tasks/create',
      ACCEPT: '/api/tasks/accept',
      ARRIVED: '/api/tasks/arrived',
      START: '/api/tasks/start',
      COMPLETE: '/api/tasks/complete',
      CONFIRM_COMPLETE: '/api/tasks/confirm-complete',
      CANCEL: '/api/tasks/cancel',
      NOTIFY_AVAILABLE: '/api/tasks/notify-available',
    },
    // Payment endpoints
    PAYMENTS: {
      CREATE_INTENT: '/api/payments/create-intent',
    },
    // Future endpoints can be added here
    AUTH: {
      // These would be Supabase direct calls, not our custom endpoints
    }
  },
  HEADERS: {
    'Content-Type': 'application/json',
  }
};

/**
 * Helper function to build full API URLs
 */
export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

/**
 * Common HTTP status codes
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

/**
 * API Response wrapper type
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
