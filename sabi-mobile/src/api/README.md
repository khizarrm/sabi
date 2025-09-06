# 🚀 Sabi Mobile API Utilities

This directory contains all the API utilities your co-founder needs to interact with the Sabi backend. All the complex API logic is abstracted away into simple, typed functions.

## 📁 File Structure

```
src/api/
├── config.ts           # API configuration and base settings
├── taskUtils.ts        # Task management functions (create, accept, lifecycle)
├── authUtils.ts        # Authentication and user management
├── paymentUtils.ts     # Stripe payment integration
├── notificationUtils.ts # Push notification handling
├── index.ts            # Main export file - import everything from here
└── README.md           # This documentation
```

## 🎯 Quick Start

### 1. Update Configuration

First, update the backend URL in `config.ts`:

```typescript
// src/api/config.ts
export const API_CONFIG = {
  BASE_URL: 'http://YOUR_BACKEND_URL:3000', // Change this!
  // ... rest of config
};
```

### 2. Install Dependencies

```bash
# For payments
npm install @stripe/stripe-react-native

# For notifications (choose one)
# Expo projects:
expo install expo-notifications expo-device

# Bare React Native:
npm install @react-native-firebase/app @react-native-firebase/messaging
```

### 3. Basic Usage

```typescript
import { 
  createTask, 
  acceptTask, 
  TaskLifecycle,
  signIn, 
  setupNotifications 
} from '@/src/api';

// Create a task
const result = await createTask({
  customerId: user.id,
  title: 'Fix my kitchen sink',
  description: 'Sink is leaking and needs repair',
  taskAddress: '123 Main Street, San Francisco, CA',
  fixedPrice: 50
});

if (result.success) {
  console.log('Task created!', result.data.task.id);
} else {
  console.error('Error:', result.error);
}
```

## 📋 Common Usage Patterns

### Task Management

#### Creating a Task (Customer)
```typescript
import { createTask } from '@/src/api';

const handleCreateTask = async () => {
  const result = await createTask({
    customerId: currentUser.id,
    title: taskTitle,
    description: taskDescription,
    taskAddress: taskAddress,
    fixedPrice: taskPrice
  });

  if (result.success) {
    // Task created successfully
    navigation.navigate('TaskDetails', { taskId: result.data.task.id });
  } else {
    // Show error message
    Alert.alert('Error', result.error);
  }
};
```

#### Task Lifecycle (Tasker)
```typescript
import { TaskLifecycle } from '@/src/api';

const handleTaskFlow = async () => {
  const lifecycle = new TaskLifecycle(taskId, currentUser.id);

  try {
    // Accept the task
    await lifecycle.accept();
    setTaskStatus('assigned');

    // Mark arrival
    await lifecycle.arrived();
    setTaskStatus('arrived');

    // Start work
    await lifecycle.start();
    setTaskStatus('in_progress');

    // Complete work
    await lifecycle.complete('Repair completed successfully');
    setTaskStatus('pending_approval');

  } catch (error) {
    Alert.alert('Error', error.message);
  }
};
```

#### Task Confirmation (Customer)
```typescript
import { confirmCompletion } from '@/src/api';

const handleConfirmTask = async (approved: boolean, rating?: number) => {
  const result = await confirmCompletion(
    taskId,
    currentUser.id,
    approved,
    rating,
    reviewText
  );

  if (result.success) {
    if (approved) {
      Alert.alert('Success', 'Payment released to tasker!');
    } else {
      Alert.alert('Dispute', 'Task marked for review');
    }
  }
};
```

### Authentication

#### Sign In
```typescript
import { signIn } from '@/src/api';

const handleSignIn = async () => {
  const result = await signIn(email, password);
  
  if (result.success) {
    // Store user data and navigate to main app
    setUser(result.data.user);
    navigation.navigate('MainTabs');
  } else {
    Alert.alert('Sign In Failed', result.error);
  }
};
```

#### Sign Up
```typescript
import { signUp } from '@/src/api';

const handleSignUp = async () => {
  const result = await signUp(email, password, {
    firstName: firstName,
    lastName: lastName,
    phoneNumber: phone,
    isTasker: wantsToBeTasker
  });
  
  if (result.success) {
    // Account created successfully
    navigation.navigate('Welcome');
  } else {
    Alert.alert('Sign Up Failed', result.error);
  }
};
```

### Notifications

#### Setup Notifications
```typescript
import { setupNotifications } from '@/src/api';

// Call this when app starts or user logs in
useEffect(() => {
  if (currentUser) {
    setupNotifications(currentUser.id);
  }
}, [currentUser]);
```

#### Handle Notification Taps
```typescript
// Customize the handleNotificationTap function in notificationUtils.ts
export function handleNotificationTap(notificationData: any): void {
  if (notificationData?.type === 'task_notification' && notificationData?.taskId) {
    // Navigate to task details
    navigation.navigate('TaskDetails', { taskId: notificationData.taskId });
  } else if (notificationData?.type === 'payment_update') {
    // Navigate to payments/earnings
    navigation.navigate('Earnings');
  }
}
```

### Payments

#### Payment Flow for Task Acceptance
```typescript
import { completeTaskPaymentFlow } from '@/src/api';

const handleAcceptWithPayment = async () => {
  const result = await completeTaskPaymentFlow(
    taskId,
    task.customer_id,
    currentUser.id,
    task.fixed_price,
    task.title,
    {
      email: customerEmail,
      name: customerName
    }
  );

  if (result.success) {
    Alert.alert('Success', 'Task accepted and payment authorized!');
  } else {
    Alert.alert('Payment Failed', result.error);
  }
};
```

## 🔧 Setup Instructions

### 1. Backend URL Configuration

Update `src/api/config.ts` with your backend URL:

```typescript
export const API_CONFIG = {
  BASE_URL: 'http://YOUR_COMPUTER_IP:3000', // For local development
  // OR
  BASE_URL: 'https://your-backend.railway.app', // For production
};
```

**Important**: For local development on a physical device, use your computer's IP address, not `localhost`.

### 2. Stripe Setup

1. Install Stripe React Native:
```bash
npm install @stripe/stripe-react-native
```

2. Configure Stripe provider in your app root:
```typescript
import { StripeProvider } from '@stripe/stripe-react-native';

export default function App() {
  return (
    <StripeProvider 
      publishableKey="pk_test_your_stripe_publishable_key"
      merchantIdentifier="merchant.com.sabi"
    >
      <YourAppContent />
    </StripeProvider>
  );
}
```

3. Add URL scheme to `app.json` (for iOS):
```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.yourcompany.sabi",
      "infoPlist": {
        "CFBundleURLTypes": [
          {
            "CFBundleURLName": "com.yourcompany.sabi",
            "CFBundleURLSchemes": ["com.yourcompany.sabi"]
          }
        ]
      }
    }
  }
}
```

### 3. Push Notifications Setup

#### For Expo Projects:
```bash
expo install expo-notifications expo-device
```

Add to `app.json`:
```json
{
  "expo": {
    "notification": {
      "icon": "./assets/notification-icon.png",
      "color": "#000000"
    }
  }
}
```

#### For Bare React Native:
```bash
npm install @react-native-firebase/app @react-native-firebase/messaging
```

Follow Firebase setup guide for iOS and Android.

### 4. Supabase Auth Setup

Install Supabase client:
```bash
npm install @supabase/supabase-js
```

Configure Supabase in your app (you'll need to implement this in `authUtils.ts`):
```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'YOUR_SUPABASE_URL',
  'YOUR_SUPABASE_ANON_KEY'
);
```

## 🎨 UI Integration Examples

### Task Creation Screen
```typescript
import React, { useState } from 'react';
import { View, TextInput, Button, Alert } from 'react-native';
import { createTask } from '@/src/api';

export function CreateTaskScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateTask = async () => {
    setLoading(true);
    
    const result = await createTask({
      customerId: currentUser.id,
      title,
      description,
      taskAddress: address,
      fixedPrice: parseFloat(price)
    });

    setLoading(false);

    if (result.success) {
      Alert.alert('Success', 'Task posted successfully!');
      navigation.goBack();
    } else {
      Alert.alert('Error', result.error);
    }
  };

  return (
    <View>
      <TextInput 
        placeholder="Task title"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput 
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        multiline
      />
      <TextInput 
        placeholder="Address"
        value={address}
        onChangeText={setAddress}
      />
      <TextInput 
        placeholder="Price ($)"
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
      />
      <Button 
        title={loading ? "Creating..." : "Create Task"}
        onPress={handleCreateTask}
        disabled={loading}
      />
    </View>
  );
}
```

### Task List Screen
```typescript
import React, { useEffect, useState } from 'react';
import { FlatList, TouchableOpacity, Text, View } from 'react-native';
import { acceptTask } from '@/src/api';

export function TaskListScreen() {
  const [tasks, setTasks] = useState([]);

  const handleAcceptTask = async (taskId: string) => {
    const result = await acceptTask(taskId, currentUser.id);
    
    if (result.success) {
      Alert.alert('Success', 'Task accepted!');
      // Refresh task list
      loadTasks();
    } else {
      Alert.alert('Error', result.error);
    }
  };

  const renderTask = ({ item: task }) => (
    <TouchableOpacity 
      style={styles.taskCard}
      onPress={() => navigation.navigate('TaskDetails', { taskId: task.id })}
    >
      <Text style={styles.taskTitle}>{task.title}</Text>
      <Text style={styles.taskDescription}>{task.description}</Text>
      <Text style={styles.taskPrice}>${task.fixed_price}</Text>
      <Text style={styles.taskAddress}>{task.task_address}</Text>
      
      <Button 
        title="Accept Task"
        onPress={() => handleAcceptTask(task.id)}
      />
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={tasks}
      renderItem={renderTask}
      keyExtractor={(item) => item.id}
    />
  );
}
```

## 🚨 Error Handling

All API functions return a consistent response format:

```typescript
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
```

Always check the `success` field:

```typescript
const result = await createTask(taskData);

if (result.success) {
  // Success - use result.data
  console.log('Task created:', result.data.task);
} else {
  // Error - show result.error to user
  Alert.alert('Error', result.error);
}
```

## 📱 Testing

### Test with Backend

1. Make sure your backend is running
2. Update `BASE_URL` in `config.ts`
3. Test creating a task:

```typescript
import { createTask } from '@/src/api';

// Test function
const testCreateTask = async () => {
  const result = await createTask({
    customerId: 'test-customer-id',
    title: 'Test Task',
    description: 'This is a test task',
    taskAddress: '123 Test Street',
    fixedPrice: 25
  });
  
  console.log('Result:', result);
};
```

### Test Cards for Stripe

Use these test cards in development:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Requires authentication: `4000 0025 0000 3155`

## 🎉 You're All Set!

Your co-founder now has:
- ✅ Complete task management API
- ✅ Authentication utilities
- ✅ Payment processing
- ✅ Push notification handling
- ✅ Consistent error handling
- ✅ TypeScript types for everything
- ✅ Real-world usage examples

Just update the configuration, install dependencies, and start building the UI! 🚀

## 🆘 Need Help?

If you run into issues:
1. Check the console for error messages
2. Verify the backend URL is correct
3. Make sure the backend server is running
4. Check that all dependencies are installed
5. Ensure API keys (Stripe, Firebase) are configured correctly

Happy coding! 🎯
