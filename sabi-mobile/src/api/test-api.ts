/**
 * 🧪 API Test Functions
 * 
 * Use these functions to test your API integration.
 * Call these from your React components to verify everything is working.
 * 
 * Example usage:
 * import { testBackendConnection, testTaskCreation } from '@/src/api/test-api';
 * 
 * // Test if backend is reachable
 * const connectionResult = await testBackendConnection();
 * console.log(connectionResult);
 */

import { createTask, acceptTask, TaskLifecycle } from './taskUtils';
import { API_CONFIG } from './config';

// ========== CONNECTION TESTS ==========

/**
 * 🔌 TEST BACKEND CONNECTION
 * 
 * Tests if the backend is reachable and responding.
 * Call this first to verify your backend URL is correct.
 */
export async function testBackendConnection(): Promise<{
  success: boolean;
  message: string;
  url: string;
  responseTime?: number;
}> {
  const startTime = Date.now();
  
  try {
    // Try to fetch from a simple endpoint
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/tasks/create`, {
      method: 'GET', // This should return method info
    });
    
    const responseTime = Date.now() - startTime;
    
    if (response.ok) {
      return {
        success: true,
        message: `✅ Backend connected successfully!`,
        url: API_CONFIG.BASE_URL,
        responseTime
      };
    } else {
      return {
        success: false,
        message: `❌ Backend responded with status ${response.status}`,
        url: API_CONFIG.BASE_URL,
        responseTime
      };
    }
    
  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    return {
      success: false,
      message: `❌ Cannot reach backend. Check URL and make sure server is running.`,
      url: API_CONFIG.BASE_URL,
      responseTime
    };
  }
}

/**
 * 📋 TEST TASK CREATION
 * 
 * Tests creating a task with sample data.
 * Make sure you have test users in your database first.
 */
export async function testTaskCreation(customerId: string = 'test-customer-id'): Promise<{
  success: boolean;
  message: string;
  taskId?: string;
  error?: string;
}> {
  try {
    const result = await createTask({
      customerId,
      title: '🧪 Test Task - Kitchen Sink Repair',
      description: 'This is a test task created by the mobile app. Kitchen sink is leaking and needs immediate repair.',
      taskAddress: '123 Test Street, San Francisco, CA 94102',
      fixedPrice: 75,
      taskType: 'on_demand'
    });

    if (result.success && result.data) {
      return {
        success: true,
        message: '✅ Task created successfully!',
        taskId: result.data.task.id
      };
    } else {
      return {
        success: false,
        message: '❌ Task creation failed',
        error: result.error
      };
    }

  } catch (error) {
    return {
      success: false,
      message: '❌ Task creation error',
      error: String(error)
    };
  }
}

/**
 * ⚡ TEST TASK ACCEPTANCE
 * 
 * Tests accepting a task (Uber-style).
 * You need a valid task ID from testTaskCreation first.
 */
export async function testTaskAcceptance(
  taskId: string, 
  taskerId: string = 'test-tasker-id'
): Promise<{
  success: boolean;
  message: string;
  error?: string;
}> {
  try {
    const result = await acceptTask(taskId, taskerId);

    if (result.success) {
      return {
        success: true,
        message: '✅ Task accepted successfully!'
      };
    } else {
      return {
        success: false,
        message: '❌ Task acceptance failed',
        error: result.error
      };
    }

  } catch (error) {
    return {
      success: false,
      message: '❌ Task acceptance error',
      error: String(error)
    };
  }
}

/**
 * 🔄 TEST TASK LIFECYCLE
 * 
 * Tests the complete task lifecycle using TaskLifecycle class.
 */
export async function testTaskLifecycle(
  taskId: string,
  taskerId: string = 'test-tasker-id'
): Promise<{
  success: boolean;
  steps: Array<{ step: string; success: boolean; message: string; }>;
}> {
  const lifecycle = new TaskLifecycle(taskId, taskerId);
  const steps: Array<{ step: string; success: boolean; message: string; }> = [];

  // Test each step
  try {
    // Step 1: Accept
    const acceptResult = await lifecycle.accept();
    steps.push({
      step: 'Accept Task',
      success: acceptResult.success,
      message: acceptResult.success ? '✅ Accepted' : `❌ ${acceptResult.error}`
    });

    if (!acceptResult.success) {
      return { success: false, steps };
    }

    // Wait a bit between steps
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Step 2: Arrived
    const arrivedResult = await lifecycle.arrived();
    steps.push({
      step: 'Mark Arrived',
      success: arrivedResult.success,
      message: arrivedResult.success ? '✅ Arrived' : `❌ ${arrivedResult.error}`
    });

    if (!arrivedResult.success) {
      return { success: false, steps };
    }

    await new Promise(resolve => setTimeout(resolve, 1000));

    // Step 3: Start
    const startResult = await lifecycle.start();
    steps.push({
      step: 'Start Task',
      success: startResult.success,
      message: startResult.success ? '✅ Started' : `❌ ${startResult.error}`
    });

    if (!startResult.success) {
      return { success: false, steps };
    }

    await new Promise(resolve => setTimeout(resolve, 1000));

    // Step 4: Complete
    const completeResult = await lifecycle.complete('Test task completed successfully! 🎉');
    steps.push({
      step: 'Complete Task',
      success: completeResult.success,
      message: completeResult.success ? '✅ Completed (awaiting customer approval)' : `❌ ${completeResult.error}`
    });

    return {
      success: completeResult.success,
      steps
    };

  } catch (error) {
    steps.push({
      step: 'Error',
      success: false,
      message: `❌ Lifecycle error: ${error}`
    });

    return { success: false, steps };
  }
}

// ========== COMPREHENSIVE TEST SUITE ==========

/**
 * 🏃‍♂️ RUN ALL TESTS
 * 
 * Runs all tests in sequence to verify your API integration.
 * This is perfect for initial setup verification.
 */
export async function runAllTests(customerId?: string, taskerId?: string): Promise<{
  overallSuccess: boolean;
  results: Array<{
    test: string;
    success: boolean;
    message: string;
    duration: number;
    details?: any;
  }>;
}> {
  const results: Array<{
    test: string;
    success: boolean;
    message: string;
    duration: number;
    details?: any;
  }> = [];

  console.log('🧪 Starting Sabi API Test Suite...\n');

  // Test 1: Backend Connection
  console.log('1️⃣ Testing backend connection...');
  const connectionStart = Date.now();
  const connectionResult = await testBackendConnection();
  results.push({
    test: 'Backend Connection',
    success: connectionResult.success,
    message: connectionResult.message,
    duration: Date.now() - connectionStart,
    details: { url: connectionResult.url, responseTime: connectionResult.responseTime }
  });

  if (!connectionResult.success) {
    console.log('❌ Backend connection failed. Stopping tests.\n');
    return { overallSuccess: false, results };
  }

  // Test 2: Task Creation
  console.log('2️⃣ Testing task creation...');
  const taskStart = Date.now();
  const taskResult = await testTaskCreation(customerId);
  results.push({
    test: 'Task Creation',
    success: taskResult.success,
    message: taskResult.message,
    duration: Date.now() - taskStart,
    details: { taskId: taskResult.taskId, error: taskResult.error }
  });

  if (!taskResult.success || !taskResult.taskId) {
    console.log('❌ Task creation failed. Skipping lifecycle tests.\n');
    return { overallSuccess: false, results };
  }

  // Test 3: Task Lifecycle
  console.log('3️⃣ Testing task lifecycle...');
  const lifecycleStart = Date.now();
  const lifecycleResult = await testTaskLifecycle(taskResult.taskId, taskerId);
  results.push({
    test: 'Task Lifecycle',
    success: lifecycleResult.success,
    message: lifecycleResult.success ? '✅ Complete lifecycle works!' : '❌ Lifecycle failed',
    duration: Date.now() - lifecycleStart,
    details: { steps: lifecycleResult.steps }
  });

  const overallSuccess = results.every(r => r.success);

  console.log('\n🎯 Test Results Summary:');
  results.forEach(result => {
    console.log(`${result.success ? '✅' : '❌'} ${result.test}: ${result.message} (${result.duration}ms)`);
  });

  console.log(`\n${overallSuccess ? '🎉 All tests passed!' : '❌ Some tests failed'}`);

  return { overallSuccess, results };
}

// ========== HELPER FUNCTIONS ==========

/**
 * 🔧 GET API STATUS
 * 
 * Returns current API configuration status.
 */
export function getApiStatus(): {
  backendUrl: string;
  isLocalhost: boolean;
  isHttps: boolean;
  recommendations: string[];
} {
  const url = API_CONFIG.BASE_URL;
  const isLocalhost = url.includes('localhost') || url.includes('127.0.0.1');
  const isHttps = url.startsWith('https://');
  
  const recommendations: string[] = [];
  
  if (isLocalhost) {
    recommendations.push('💡 Using localhost - make sure to use your computer\'s IP address for device testing');
  }
  
  if (!isHttps && !isLocalhost) {
    recommendations.push('🔒 Consider using HTTPS for production');
  }
  
  return {
    backendUrl: url,
    isLocalhost,
    isHttps,
    recommendations
  };
}

/**
 * 📊 PRINT TEST REPORT
 * 
 * Prints a formatted test report to console.
 */
export function printTestReport(results: any): void {
  console.log('\n📊 DETAILED TEST REPORT');
  console.log('='.repeat(50));
  
  results.results.forEach((result: any, index: number) => {
    console.log(`\n${index + 1}. ${result.test}`);
    console.log(`   Status: ${result.success ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`   Message: ${result.message}`);
    console.log(`   Duration: ${result.duration}ms`);
    
    if (result.details) {
      console.log(`   Details:`, result.details);
    }
  });
  
  console.log('\n' + '='.repeat(50));
  console.log(`Overall Result: ${results.overallSuccess ? '🎉 SUCCESS' : '❌ FAILURE'}`);
}

// ========== EXAMPLE USAGE ==========

/**
 * 💡 EXAMPLE: How to use these tests in your React component
 * 
 * ```typescript
 * import React, { useEffect } from 'react';
 * import { runAllTests, testBackendConnection } from '@/src/api/test-api';
 * 
 * export function TestScreen() {
 *   useEffect(() => {
 *     // Quick connection test
 *     testBackendConnection().then(result => {
 *       console.log('Connection test:', result);
 *     });
 *   }, []);
 * 
 *   const handleRunTests = async () => {
 *     const results = await runAllTests('customer-id-123', 'tasker-id-456');
 *     console.log('Test results:', results);
 *   };
 * 
 *   return (
 *     <View>
 *       <Button title="Run API Tests" onPress={handleRunTests} />
 *     </View>
 *   );
 * }
 * ```
 */

export default {
  testBackendConnection,
  testTaskCreation,
  testTaskAcceptance,
  testTaskLifecycle,
  runAllTests,
  getApiStatus,
  printTestReport
};
