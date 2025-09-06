/**
 * Task Management Utilities for Sabi Mobile App
 * 
 * These functions abstract away all the API complexity.
 * Your co-founder can simply call these functions from UI components.
 * 
 * Example usage in a React component:
 * 
 * import { createTask, acceptTask, TaskLifecycle } from '@/src/api/taskUtils';
 * 
 * // Create a task
 * const result = await createTask({
 *   title: "Fix my sink",
 *   description: "Kitchen sink is leaking",
 *   taskAddress: "123 Main St",
 *   fixedPrice: 50,
 *   customerId: "user-id-here"
 * });
 */

import { buildApiUrl, API_CONFIG, ApiResponse } from './config';
import { supabase } from '@/lib/supabase';
// ========== TYPE DEFINITIONS ==========

export interface CreateTaskData {
  customerId: string;
  title: string;
  description: string;
  taskAddress: string;
  fixedPrice: number;
  taskType?: 'on_demand' | 'scheduled';
}

export interface Task {
  id: string;
  title: string;
  description: string;
  task_address: string;
  fixed_price?: number;
  agreed_price?: number;
  status: 'posted' | 'assigned' | 'arrived' | 'in_progress' | 'pending_customer_approval' | 'completed' | 'cancelled' | 'disputed';
  customer_id: string;
  tasker_id?: string;
  created_at: string;
  updated_at?: string;
  actual_start_time?: string;
  actual_end_time?: string;
}

export interface TaskResponse {
  message: string;
  task: Task;
  notifications?: {
    sent: number;
    failed?: number;
    error?: string;
  };
}

// ========== TASK LIFECYCLE UTILITIES ==========

/**
 * 🎯 CREATE TASK - Customer creates a new task
 * 
 * Call this when a customer wants to post a new task.
 * This will create the task and notify all available taskers.
 * 
 * @param taskData - Task creation data
 * @returns Promise with task creation result
 */
export async function createTask(taskData: CreateTaskData): Promise<ApiResponse<TaskResponse>> {
  try {
    const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.TASKS.CREATE), {
      method: 'POST',
      headers: API_CONFIG.HEADERS,
      body: JSON.stringify({
        ...taskData,
        taskType: taskData.taskType || 'on_demand'
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || 'Failed to create task'
      };
    }

    return {
      success: true,
      data: result,
      message: result.message
    };

  } catch (error) {
    return {
      success: false,
      error: 'Network error - check your connection and backend URL'
    };
  }
}

/**
 * ⚡ ACCEPT TASK - Tasker accepts a task (Uber-style, first-come-first-served)
 * 
 * Call this when a tasker wants to accept a task.
 * This will assign the task to the tasker and authorize payment.
 * 
 * @param taskId - ID of the task to accept
 * @param taskerId - ID of the tasker accepting
 * @returns Promise with acceptance result
 */
export async function acceptTask(taskId: string, taskerId: string): Promise<ApiResponse<TaskResponse>> {
  try {
    const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.TASKS.ACCEPT), {
      method: 'POST',
      headers: API_CONFIG.HEADERS,
      body: JSON.stringify({
        taskId,
        taskerId
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || 'Failed to accept task'
      };
    }

    return {
      success: true,
      data: result,
      message: result.message
    };

  } catch (error) {
    return {
      success: false,
      error: 'Network error - check your connection'
    };
  }
}

/**
 * 📍 MARK ARRIVED - Tasker marks that they've arrived at the location
 * 
 * Call this when the tasker reaches the task location.
 * 
 * @param taskId - ID of the task
 * @param taskerId - ID of the tasker
 * @returns Promise with arrival confirmation
 */
export async function markArrived(taskId: string, taskerId: string): Promise<ApiResponse> {
  try {
    const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.TASKS.ARRIVED), {
      method: 'POST',
      headers: API_CONFIG.HEADERS,
      body: JSON.stringify({
        taskId,
        taskerId
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || 'Failed to mark arrival'
      };
    }

    return {
      success: true,
      data: result,
      message: result.message
    };

  } catch (error) {
    return {
      success: false,
      error: 'Network error - check your connection'
    };
  }
}

/**
 * 🚀 START TASK - Tasker starts working on the task
 * 
 * Call this when the tasker begins the actual work.
 * 
 * @param taskId - ID of the task
 * @param taskerId - ID of the tasker
 * @returns Promise with start confirmation
 */
export async function startTask(taskId: string, taskerId: string): Promise<ApiResponse> {
  try {
    const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.TASKS.START), {
      method: 'POST',
      headers: API_CONFIG.HEADERS,
      body: JSON.stringify({
        taskId,
        taskerId
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || 'Failed to start task'
      };
    }

    return {
      success: true,
      data: result,
      message: result.message
    };

  } catch (error) {
    return {
      success: false,
      error: 'Network error - check your connection'
    };
  }
}

/**
 * ✅ COMPLETE TASK - Tasker marks task as complete (awaiting customer approval)
 * 
 * Call this when the tasker finishes the work.
 * The task will be marked as pending customer approval.
 * Payment will remain authorized until customer confirms.
 * 
 * @param taskId - ID of the task
 * @param taskerId - ID of the tasker
 * @param completionNotes - Optional notes about the completion
 * @returns Promise with completion result
 */
export async function completeTask(
  taskId: string, 
  taskerId: string, 
  completionNotes?: string
): Promise<ApiResponse> {
  try {
    const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.TASKS.COMPLETE), {
      method: 'POST',
      headers: API_CONFIG.HEADERS,
      body: JSON.stringify({
        taskId,
        taskerId,
        ...(completionNotes && { completionNotes })
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || 'Failed to complete task'
      };
    }

    return {
      success: true,
      data: result,
      message: result.message
    };

  } catch (error) {
    return {
      success: false,
      error: 'Network error - check your connection'
    };
  }
}

/**
 * 🎉 CONFIRM COMPLETION - Customer approves/rejects task completion
 * 
 * Call this when the customer reviews the completed work.
 * If approved: payment is captured and released to tasker.
 * If rejected: task goes to dispute status.
 * 
 * @param taskId - ID of the task
 * @param customerId - ID of the customer
 * @param approved - Whether the customer approves the work
 * @param rating - Rating from 1-5 (only if approved)
 * @param review - Optional review text (only if approved)
 * @returns Promise with confirmation result
 */
export async function confirmCompletion(
  taskId: string,
  customerId: string,
  approved: boolean,
  rating?: number,
  review?: string
): Promise<ApiResponse> {
  try {
    const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.TASKS.CONFIRM_COMPLETE), {
      method: 'POST',
      headers: API_CONFIG.HEADERS,
      body: JSON.stringify({
        taskId,
        customerId,
        approved,
        ...(approved && rating && { rating }),
        ...(approved && review && { review })
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || 'Failed to confirm completion'
      };
    }

    return {
      success: true,
      data: result,
      message: result.message
    };

  } catch (error) {
    return {
      success: false,
      error: 'Network error - check your connection'
    };
  }
}

/**
 * ❌ CANCEL TASK - Cancel a task (can be called by customer or tasker)
 * 
 * Call this when either party wants to cancel the task.
 * Payment authorization will be voided if task was in progress.
 * 
 * @param taskId - ID of the task
 * @param userId - ID of the user cancelling (customer or tasker)
 * @param reason - Reason for cancellation
 * @returns Promise with cancellation result
 */
export async function cancelTask(
  taskId: string,
  userId: string,
  reason: string
): Promise<ApiResponse> {
  try {
    const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.TASKS.CANCEL), {
      method: 'POST',
      headers: API_CONFIG.HEADERS,
      body: JSON.stringify({
        taskId,
        userId,
        reason
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || 'Failed to cancel task'
      };
    }

    return {
      success: true,
      data: result,
      message: result.message
    };

  } catch (error) {
    return {
      success: false,
      error: 'Network error - check your connection'
    };
  }
}

// ========== CONVENIENCE CLASSES ==========

/**
 * 🔄 TaskLifecycle - A convenience class for managing task lifecycle
 * 
 * This provides a more object-oriented way to manage tasks.
 * Your co-founder can instantiate this and call methods on it.
 * 
 * Example usage:
 * const lifecycle = new TaskLifecycle('task-id-123', 'user-id-456');
 * await lifecycle.accept();
 * await lifecycle.arrived();
 * await lifecycle.start();
 * await lifecycle.complete('Work is done!');
 */
export class TaskLifecycle {
  constructor(
    private taskId: string,
    private userId: string
  ) {}

  /**
   * Accept this task (if user is a tasker)
   */
  async accept(): Promise<ApiResponse<TaskResponse>> {
    return acceptTask(this.taskId, this.userId);
  }

  /**
   * Mark arrival at task location
   */
  async arrived(): Promise<ApiResponse> {
    return markArrived(this.taskId, this.userId);
  }

  /**
   * Start working on the task
   */
  async start(): Promise<ApiResponse> {
    return startTask(this.taskId, this.userId);
  }

  /**
   * Mark task as complete
   */
  async complete(notes?: string): Promise<ApiResponse> {
    return completeTask(this.taskId, this.userId, notes);
  }

  /**
   * Confirm completion (if user is customer)
   */
  async confirmComplete(approved: boolean, rating?: number, review?: string): Promise<ApiResponse> {
    return confirmCompletion(this.taskId, this.userId, approved, rating, review);
  }

  /**
   * Cancel the task
   */
  async cancel(reason: string): Promise<ApiResponse> {
    return cancelTask(this.taskId, this.userId, reason);
  }
}

// ========== CONVENIENCE FUNCTIONS ==========

/**
 * 🏃‍♂️ Quick task creation for common scenarios
 */
export const TaskTemplates = {
  /**
   * Quick home repair task
   */
  homeRepair: (customerId: string, description: string, address: string, price: number): CreateTaskData => ({
    customerId,
    title: 'Home Repair',
    description,
    taskAddress: address,
    fixedPrice: price,
    taskType: 'on_demand'
  }),

  /**
   * Quick cleaning task
   */
  cleaning: (customerId: string, details: string, address: string, price: number): CreateTaskData => ({
    customerId,
    title: 'Cleaning Service',
    description: details,
    taskAddress: address,
    fixedPrice: price,
    taskType: 'on_demand'
  }),

  /**
   * Quick delivery task
   */
  delivery: (customerId: string, items: string, address: string, price: number): CreateTaskData => ({
    customerId,
    title: 'Delivery',
    description: `Deliver: ${items}`,
    taskAddress: address,
    fixedPrice: price,
    taskType: 'on_demand'
  })
};

// ========== TASK QUERY FUNCTIONS ==========

/**
 * 📋 GET USER TASKS - Get tasks for a specific user
 * 
 * Retrieves tasks where the user is either customer or tasker.
 * Perfect for showing "My Tasks" screens.
 * 
 * @param userId - User's ID
 * @param status - Optional status filter
 * @returns Promise with user's tasks
 */
export async function getUserTasks(
  userId: string,
  status?: string[]
): Promise<ApiResponse<Task[]>> {
  try {
    let query = supabase
      .from('tasks')
      .select(`
        id,
        title,
        description,
        task_address,
        budget_min,
        budget_max,
        agreed_price,
        status,
        task_type,
        created_at,
        updated_at,
        actual_start_time,
        actual_end_time,
        customer_id,
        tasker_id
      `)
      .or(`customer_id.eq.${userId},tasker_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (status && status.length > 0) {
      query = query.in('status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Supabase error getting user tasks:', error);
      return {
        success: false,
        error: `Failed to get tasks: ${error.message}`
      };
    }

    const tasks: Task[] = data.map(task => ({
      ...task,
      fixed_price: task.agreed_price || task.budget_min
    }));

    return {
      success: true,
      data: tasks,
      message: `Found ${tasks.length} tasks`
    };

  } catch (error) {
    console.error('Error getting user tasks:', error);
    return {
      success: false,
      error: 'Network error - failed to get tasks'
    };
  }
}

/**
 * 🔍 GET AVAILABLE TASKS - Get tasks available for taskers
 * 
 * Retrieves tasks with status 'posted' that taskers can accept.
 * Perfect for the "Available Tasks" screen.
 * 
 * @param excludeUserId - Optional user ID to exclude (don't show their own tasks)
 * @returns Promise with available tasks
 */
export async function getAvailableTasks(
  excludeUserId?: string
): Promise<ApiResponse<Task[]>> {
  try {
    let query = supabase
      .from('tasks')
      .select(`
        id,
        title,
        description,
        task_address,
        budget_min,
        budget_max,
        status,
        task_type,
        created_at,
        customer_id
      `)
      .eq('status', 'posted')
      .order('created_at', { ascending: false });

    if (excludeUserId) {
      query = query.neq('customer_id', excludeUserId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Supabase error getting available tasks:', error);
      return {
        success: false,
        error: `Failed to get available tasks: ${error.message}`
      };
    }

    const tasks: Task[] = data.map(task => ({
      ...task,
      fixed_price: task.budget_min,
      tasker_id: undefined,
      agreed_price: undefined
    }));

    return {
      success: true,
      data: tasks,
      message: `Found ${tasks.length} available tasks`
    };

  } catch (error) {
    console.error('Error getting available tasks:', error);
    return {
      success: false,
      error: 'Network error - failed to get available tasks'
    };
  }
}

/**
 * 📄 GET TASK DETAILS - Get detailed task information
 * 
 * Retrieves a single task with full details including customer/tasker info.
 * Perfect for task detail screens.
 * 
 * @param taskId - Task ID
 * @returns Promise with task details
 */
export async function getTaskDetails(
  taskId: string
): Promise<ApiResponse<Task & { customer?: any; tasker?: any }>> {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        customer:users!customer_id(id, first_name, last_name, average_rating),
        tasker:users!tasker_id(id, first_name, last_name, average_rating)
      `)
      .eq('id', taskId)
      .single();

    if (error) {
      console.error('Supabase error getting task details:', error);
      return {
        success: false,
        error: `Failed to get task details: ${error.message}`
      };
    }

    if (!data) {
      return {
        success: false,
        error: 'Task not found'
      };
    }

    const task = {
      ...data,
      fixed_price: data.agreed_price || data.budget_min
    };

    return {
      success: true,
      data: task,
      message: 'Task details retrieved successfully'
    };

  } catch (error) {
    console.error('Error getting task details:', error);
    return {
      success: false,
      error: 'Network error - failed to get task details'
    };
  }
}
