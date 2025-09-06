import React, { useEffect } from 'react';
import { StyleSheet, SafeAreaView, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';

import { View } from '@/components/Themed';
import HomeHeader from '@/components/home/HomeHeader';
import TaskSearchBar from '@/components/home/TaskSearchBar';
import TaskSuggestions from '@/components/home/TaskSuggestions';
import NewTaskSheet from '@/components/home/NewTaskSheet';
import MatchingOverlay from '@/components/home/MatchingOverlay';
import ActiveTaskCard from '@/components/home/ActiveTaskCard';
import { setupNotifications, requestPermissions } from '@/src/api';

export default function HomeScreen() {
  // Initialize notifications when home screen loads
  useEffect(() => {
    const initializeNotifications = async () => {
      try {
        console.log('🔔 Initializing notifications...');
        
        // Request permissions first
        const permissionResult = await requestPermissions();
        if (permissionResult.success && permissionResult.data?.granted) {
          console.log('✅ Notification permissions granted');
          
          // Set up notifications for temp user
          const setupResult = await setupNotifications('00000000-0000-0000-0000-000000000001');
          if (setupResult.success) {
            console.log('✅ Notifications setup completed');
          } else {
            console.warn('⚠️ Notifications setup failed:', setupResult.error);
          }
        } else {
          console.warn('⚠️ Notification permissions denied');
        }
      } catch (error) {
        console.error('❌ Error initializing notifications:', error);
      }
    };

    initializeNotifications();
  }, []);

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.select({ ios: 10, default: 0 }) as number}
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}
          >
            <HomeHeader />
            <TaskSearchBar />
            <TaskSuggestions />
            <ActiveTaskCard />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      <MatchingOverlay />
      <NewTaskSheet />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  scrollContent: {
    paddingBottom: 120,
  },
});
