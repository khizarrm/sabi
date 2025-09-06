import React from 'react';
import { StyleSheet, SafeAreaView, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';

import { View } from '@/components/Themed';
import HomeHeader from '@/components/home/HomeHeader';
import TaskSearchBar from '@/components/home/TaskSearchBar';
import TaskSuggestions from '@/components/home/TaskSuggestions';
import NewTaskSheet from '@/components/home/NewTaskSheet';
import MatchingOverlay from '@/components/home/MatchingOverlay';
import ActiveTaskCard from '@/components/home/ActiveTaskCard';

export default function HomeScreen() {
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
