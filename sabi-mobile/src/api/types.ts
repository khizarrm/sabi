/**
 * 🏷️ Sabi Mobile API Types
 * 
 * Centralized type definitions for the entire API layer.
 * Import these types throughout your app for consistency.
 */

// ========== COMMON API TYPES ==========

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// ========== USER & AUTH TYPES ==========

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  profile_picture_url?: string;
  is_active: boolean;
  is_available: boolean; // For taskers
  total_earnings?: number;
  total_tasks_completed?: number;
  average_rating?: number;
  push_token?: string;
  device_type?: 'ios' | 'android' | 'web';
  push_enabled: boolean;
  country?: string;
  created_at: string;
  updated_at?: string;
}

export interface AuthSession {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignUpData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  isTasker?: boolean;
}

// ========== TASK TYPES ==========

export type TaskStatus = 
  | 'posted' 
  | 'assigned' 
  | 'arrived' 
  | 'in_progress' 
  | 'pending_customer_approval' 
  | 'completed' 
  | 'cancelled' 
  | 'disputed';

export type TaskType = 'on_demand' | 'scheduled';

export interface Task {
  id: string;
  customer_id: string;
  tasker_id?: string;
  title: string;
  description: string;
  task_address: string;
  task_type: TaskType;
  status: TaskStatus;
  budget_min: number;
  budget_max: number;
  agreed_price?: number;
  created_at: string;
  updated_at?: string;
  actual_start_time?: string;
  actual_end_time?: string;
  // Additional computed fields
  fixed_price?: number; // For display purposes
  customer?: User;
  tasker?: User;
}

export interface CreateTaskRequest {
  customerId: string;
  title: string;
  description: string;
  taskAddress: string;
  fixedPrice: number;
  taskType?: TaskType;
}

export interface TaskFilters {
  status?: TaskStatus[];
  taskType?: TaskType;
  priceMin?: number;
  priceMax?: number;
  location?: {
    latitude: number;
    longitude: number;
    radius: number; // in kilometers
  };
}

// ========== PAYMENT TYPES ==========

export type PaymentStatus = 'authorized' | 'captured' | 'voided' | 'failed' | 'pending';

export interface Payment {
  id: string;
  task_id: string;
  customer_id: string;
  tasker_id: string;
  amount: number;
  status: PaymentStatus;
  stripe_payment_intent_id?: string;
  created_at: string;
  released_at?: string;
  release_reason?: string;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  client_secret: string;
  customer_id: string;
  task_id: string;
}

export interface BillingDetails {
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

// ========== NOTIFICATION TYPES ==========

export type NotificationType = 
  | 'task_notification' 
  | 'task_update' 
  | 'payment_update' 
  | 'general' 
  | 'task_assigned'
  | 'task_completed'
  | 'payment_released';

export interface PushNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  notification_type: NotificationType;
  related_task_id?: string;
  data?: Record<string, any>;
  is_read: boolean;
  created_at: string;
}

export interface NotificationPreferences {
  push_enabled: boolean;
  email_enabled: boolean;
  task_notifications: boolean;
  payment_notifications: boolean;
  marketing_notifications: boolean;
}

export interface FCMToken {
  token: string;
  device_type: 'ios' | 'android' | 'web';
  created_at: string;
  is_active: boolean;
}

// ========== REVIEW & RATING TYPES ==========

export interface TaskReview {
  id: string;
  task_id: string;
  reviewer_id: string; // Customer who left the review
  reviewee_id: string; // Tasker being reviewed
  rating: number; // 1-5 stars
  review_text?: string;
  created_at: string;
}

export interface UserRating {
  average_rating: number;
  total_reviews: number;
  rating_breakdown: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

// ========== ERROR TYPES ==========

export interface ApiError {
  code: string;
  message: string;
  field?: string; // For validation errors
  details?: any;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

// ========== LOCATION TYPES ==========

export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
}

export interface LocationPermission {
  granted: boolean;
  accuracy: 'high' | 'low' | 'none';
  canAskAgain: boolean;
}

// ========== UTILITY TYPES ==========

export interface TimestampedEntity {
  created_at: string;
  updated_at?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SearchParams {
  query?: string;
  filters?: Record<string, any>;
  pagination?: PaginationParams;
}

// ========== HOOK RETURN TYPES ==========

export interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export interface UseInfiniteApiResult<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refetch: () => Promise<void>;
}

// ========== FORM TYPES ==========

export interface TaskFormData {
  title: string;
  description: string;
  address: string;
  price: string;
  taskType: TaskType;
}

export interface ProfileFormData {
  firstName: string;
  lastName: string;
  phone: string;
  bio?: string;
  isAvailable?: boolean;
}

// ========== SOCKET EVENT TYPES ==========

export interface SocketEvent {
  type: string;
  payload: any;
  timestamp: string;
}

export interface TaskUpdateEvent {
  taskId: string;
  status: TaskStatus;
  message: string;
  user: User;
}

// ========== EXPORT CONVENIENT TYPE UNIONS ==========

export type AsyncResult<T> = Promise<ApiResponse<T>>;
export type OptionalAsync<T> = T | Promise<T>;
export type EntityId = string;
export type Timestamp = string;

// ========== TYPE GUARDS ==========

export function isUser(obj: any): obj is User {
  return obj && typeof obj.id === 'string' && typeof obj.email === 'string';
}

export function isTask(obj: any): obj is Task {
  return obj && typeof obj.id === 'string' && typeof obj.title === 'string';
}

export function isApiError(obj: any): obj is ApiError {
  return obj && typeof obj.code === 'string' && typeof obj.message === 'string';
}

export function isSuccessResponse<T>(response: ApiResponse<T>): response is ApiResponse<T> & { success: true; data: T } {
  return response.success === true && response.data !== undefined;
}

export function isErrorResponse(response: ApiResponse): response is ApiResponse & { success: false; error: string } {
  return response.success === false && typeof response.error === 'string';
}

// ========== CONSTANTS ==========

export const TASK_STATUSES: TaskStatus[] = [
  'posted',
  'assigned', 
  'arrived',
  'in_progress',
  'pending_customer_approval',
  'completed',
  'cancelled',
  'disputed'
];

export const PAYMENT_STATUSES: PaymentStatus[] = [
  'authorized',
  'captured', 
  'voided',
  'failed',
  'pending'
];

export const NOTIFICATION_TYPES: NotificationType[] = [
  'task_notification',
  'task_update',
  'payment_update',
  'general',
  'task_assigned',
  'task_completed',
  'payment_released'
];
