import React from 'react';
import { StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { View } from '@/components/Themed';
import HomeHeader from '@/components/home/HomeHeader';
import TaskSearchBar from '@/components/home/TaskSearchBar';
import TaskSuggestions from '@/components/home/TaskSuggestions';
import NewTaskSheet from '@/components/home/NewTaskSheet';
import MatchingOverlay from '@/components/home/MatchingOverlay';
import ActiveTaskCard from '@/components/home/ActiveTaskCard';
import Colors from '@/constants/Colors';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.select({ ios: 10, default: 0 }) as number}
        >
          <ScrollView
            style={styles.scroll}
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
  scroll: {
    backgroundColor: '#fafafa',
  },
  scrollContent: {
    paddingBottom: 120,
  },
});
