# 🔔 Notification Utils Usage Guide

This guide shows your co-founder exactly how to use the notification utilities in the Sabi mobile app.

## 🚀 Quick Setup

### 1. Basic Setup (App Start)

```typescript
import { setupNotifications, getPendingNavigation } from '@/src/api';
import { useEffect } from 'react';

export function App() {
  useEffect(() => {
    // Set up notifications when app starts
    const initNotifications = async () => {
      if (currentUser) {
        const result = await setupNotifications(currentUser.id);
        if (result.success) {
          console.log('✅ Notifications ready!');
        } else {
          console.log('❌ Notification setup failed:', result.error);
        }
      }

      // Check if app was opened from a notification
      const pendingNav = await getPendingNavigation();
      if (pendingNav) {
        // Navigate to the appropriate screen
        navigation.navigate(pendingNav.screen, pendingNav.params);
      }
    };

    initNotifications();
  }, [currentUser]);

  return <YourAppContent />;
}
```

### 2. Listen for Notifications (In App)

```typescript
import { DeviceEventEmitter } from 'react-native';
import { useEffect } from 'react';

export function useNotificationHandling() {
  useEffect(() => {
    // Listen for notifications received while app is open
    const notificationListener = DeviceEventEmitter.addListener(
      'notificationReceived',
      (data) => {
        console.log('📱 Notification received:', data);
        // Handle in-app notification (show banner, update UI, etc.)
      }
    );

    // Listen for navigation from notification taps
    const navigationListener = DeviceEventEmitter.addListener(
      'navigateFromNotification',
      (navigationData) => {
        console.log('🎯 Navigate from notification:', navigationData);
        navigation.navigate(navigationData.screen, navigationData.params);
      }
    );

    return () => {
      notificationListener.remove();
      navigationListener.remove();
    };
  }, []);
}
```

## 📋 Individual Functions

### Permission Management

```typescript
import { requestPermissions } from '@/src/api';

// Request notification permissions
const handleRequestPermissions = async () => {
  const result = await requestPermissions();
  
  if (result.success) {
    console.log('Permissions granted:', result.data.granted);
  } else {
    console.error('Permission request failed:', result.error);
  }
};
```

### Token Management

```typescript
import { getNotificationToken, updatePushToken } from '@/src/api';

// Get device token and register with backend
const handleTokenSetup = async (userId: string) => {
  // Get the device's push token
  const tokenResult = await getNotificationToken();
  
  if (tokenResult.success) {
    const token = tokenResult.data;
    
    // Register token with your backend
    const updateResult = await updatePushToken(userId, token, 'ios'); // or 'android'
    
    if (updateResult.success) {
      console.log('✅ Token registered successfully');
    }
  }
};
```

### Settings Management

```typescript
import { getNotificationSettings, updateNotificationSettings } from '@/src/api';

// Get current notification settings
const loadSettings = async (userId: string) => {
  const result = await getNotificationSettings(userId);
  
  if (result.success) {
    const settings = result.data;
    console.log('Notifications enabled:', settings.enabled);
  }
};

// Update notification settings
const updateSettings = async (userId: string, enabled: boolean) => {
  const result = await updateNotificationSettings(userId, {
    enabled,
    taskNotifications: enabled,
    paymentNotifications: enabled,
    generalNotifications: enabled
  });
  
  if (result.success) {
    console.log('Settings updated successfully');
  }
};
```

## 🛠️ Installation Requirements

### For Expo Projects

```bash
expo install expo-notifications expo-device expo-constants
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

### For Bare React Native

```bash
npm install @react-native-firebase/app @react-native-firebase/messaging
```

Follow Firebase setup guide for iOS and Android.

### Optional Dependencies

```bash
npm install @react-native-async-storage/async-storage
```

## 🎯 Real-World Examples

### Settings Screen

```typescript
import React, { useState, useEffect } from 'react';
import { View, Switch, Text } from 'react-native';
import { getNotificationSettings, updateNotificationSettings } from '@/src/api';

export function NotificationSettingsScreen({ userId }: { userId: string }) {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const result = await getNotificationSettings(userId);
    if (result.success) {
      setEnabled(result.data.enabled);
    }
  };

  const handleToggle = async (value: boolean) => {
    setLoading(true);
    const result = await updateNotificationSettings(userId, {
      enabled: value,
      taskNotifications: value,
      paymentNotifications: value,
      generalNotifications: value
    });
    
    if (result.success) {
      setEnabled(value);
    }
    setLoading(false);
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>Push Notifications</Text>
      <Switch
        value={enabled}
        onValueChange={handleToggle}
        disabled={loading}
      />
    </View>
  );
}
```

### Task List with Notifications

```typescript
import React, { useEffect } from 'react';
import { DeviceEventEmitter } from 'react-native';
import { getAvailableTasks } from '@/src/api';

export function TaskListScreen() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    loadTasks();

    // Listen for new task notifications
    const listener = DeviceEventEmitter.addListener(
      'notificationReceived',
      (data) => {
        if (data.type === 'task_notification') {
          // New task available - refresh the list
          loadTasks();
        }
      }
    );

    return () => listener.remove();
  }, []);

  const loadTasks = async () => {
    const result = await getAvailableTasks(currentUser.id);
    if (result.success) {
      setTasks(result.data);
    }
  };

  return (
    // Your task list UI
  );
}
```

## 🔧 Troubleshooting

### Common Issues

1. **Notifications not working on simulator**
   - Physical device required for push notifications
   - Development tokens are generated for simulators

2. **Permissions denied**
   - Check device settings
   - Re-request permissions after app settings change

3. **Token not updating**
   - Tokens can change when app is reinstalled
   - Call `setupNotifications()` on each app start

### Debug Mode

```typescript
import { getNotificationToken, requestPermissions } from '@/src/api';

// Debug notification setup
const debugNotifications = async () => {
  console.log('🔍 Debugging notifications...');
  
  // Check permissions
  const permissions = await requestPermissions();
  console.log('Permissions:', permissions);
  
  // Check token
  const token = await getNotificationToken();
  console.log('Token:', token);
  
  // Check device type
  const { Platform } = require('react-native');
  console.log('Platform:', Platform.OS);
};
```

## 🎉 All Set!

Your notification system is now fully functional! The utilities handle:

- ✅ **Auto-detection** of Expo vs Firebase
- ✅ **Graceful fallbacks** when libraries aren't installed
- ✅ **Comprehensive error handling**
- ✅ **Navigation handling** from notifications
- ✅ **Settings management** with Supabase
- ✅ **Development-friendly** with fake tokens when needed

Just install the appropriate notification library and start using these functions! 🚀
