import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

import useAuth from '@/src/hooks/useAuth';

export default function OnboardingScreen() {
  const { currentStep, totalSteps, isComplete, resetOnboarding } = useOnboardingStore();
  const { isAuthenticated, user } = useAuth();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated]);

  // Handle onboarding completion
  useEffect(() => {
    if (isComplete) {
      // Update user's onboarding status
      const { updateUserOnboardingStatus } = useAuth.getState();
      updateUserOnboardingStatus(true);
      
      // TODO: Save onboarding data to backend/persistent storage
      // For now, just redirect to main app
      router.replace('/(tabs)');
    }
  }, [isComplete]);

  // Render appropriate step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <PersonalInfoStep />;
      case 2:
        return <SkillsSelectionStep />;
      default:
        return <PersonalInfoStep />;
    }
  };

  // Show loading or redirect screen while checking authentication
  if (!isAuthenticated) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          {/* Background Gradient (subtle) */}
          <LinearGradient
            colors={['#F0FDF4', '#FFFFFF', '#F9FAFB']}
            locations={[0, 0.5, 1]}
            style={styles.backgroundGradient}
          />

          <View style={styles.content}>
            {/* Welcome Header */}
            <View style={styles.welcomeHeader}>
              <Text style={styles.welcomeText}>
                Welcome to Sabi, {user?.name?.split(' ')[0] || 'there'}! 👋
              </Text>
              <Text style={styles.welcomeSubtext}>
                Let's set up your profile to get you started
              </Text>
            </View>

            {/* Progress Indicator */}
            <ProgressIndicator 
              currentStep={currentStep} 
              totalSteps={totalSteps} 
            />

            {/* Step Content */}
            <View style={styles.stepContainer}>
              {renderStepContent()}
            </View>

            {/* Debug Info (remove in production) */}
            {__DEV__ && (
              <View style={styles.debugInfo}>
                <Text style={styles.debugText}>
                  Debug: Step {currentStep}/{totalSteps} | Complete: {isComplete.toString()}
                </Text>
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 34, // Extra padding for home indicator on newer iPhones
  },
  welcomeHeader: {
    alignItems: 'center',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 8,
  },
  welcomeSubtext: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  stepContainer: {
    flex: 1,
  },
  debugInfo: {
    position: 'absolute',
    bottom: 10,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.1)',
    padding: 10,
    borderRadius: 8,
  },
  debugText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});