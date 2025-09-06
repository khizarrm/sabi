import React, { useState, useCallback, useMemo, forwardRef, useImperativeHandle, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetModal, BottomSheetView, BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useAuth from '@/src/hooks/useAuth';
import { router } from 'expo-router';

type AuthModalProps = {
  initialMode?: 'login' | 'signup';
  visible?: boolean;
  onClose?: () => void;
};

export interface AuthModalRef {
  present: () => void;
  dismiss: () => void;
}

const AuthModal = forwardRef<AuthModalRef, AuthModalProps>(({ initialMode = 'login', visible, onClose }, ref) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const { login, isLoading } = useAuth();
  const insets = useSafeAreaInsets();
  
  // Bottom sheet ref
  const bottomSheetModalRef = React.useRef<BottomSheetModal>(null);

  // Snap points - dynamic based on mode
  const snapPoints = useMemo(() => {
    return mode === 'signup' ? ['75%'] : ['65%'];
  }, [mode]);

  // Expose methods to parent
  useImperativeHandle(ref, () => ({
    present: () => bottomSheetModalRef.current?.present(),
    dismiss: () => bottomSheetModalRef.current?.dismiss(),
  }));

  // Open/close when `visible` changes
  useEffect(() => {
    if (visible) {
      bottomSheetModalRef.current?.present();
    } else {
      bottomSheetModalRef.current?.dismiss();
    }
  }, [visible]);

  const resetForm = useCallback(() => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setName('');
  }, []);

  const handleClose = useCallback(() => {
    resetForm();
    bottomSheetModalRef.current?.dismiss();
    onClose?.();
  }, [resetForm, onClose]);

  const handleLogin = useCallback(async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    const success = await login(email, password);
    
    if (success) {
      handleClose();
      router.replace('/(tabs)');
    } else {
      Alert.alert('Error', 'Login failed. Please check your credentials.');
    }
  }, [email, password, login, handleClose]);

  const handleSignup = useCallback(async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    // For now, just show a message since signup isn't functional yet
    Alert.alert('Coming Soon', 'Sign up functionality will be available soon!');
  }, [name, email, password, confirmPassword]);

  const switchMode = useCallback(() => {
    resetForm();
    setMode(mode === 'login' ? 'signup' : 'login');
  }, [mode, resetForm]);

  // Render backdrop
  const renderBackdrop = useCallback(
    (props: any) => (
      <View
        {...props}
        style={[props.style, styles.backdrop]}
      />
    ),
    []
  );

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      index={0}
      snapPoints={snapPoints}
      enablePanDownToClose
      enableDynamicSizing={false}
      keyboardBehavior="fillParent"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.bottomSheetBackground}
      handleIndicatorStyle={styles.handleIndicator}
      style={styles.bottomSheet}
      onDismiss={onClose}
    >
      <BottomSheetView style={[styles.contentContainer, { paddingBottom: insets.bottom || 20 }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <Text style={styles.subtitle}>
          {mode === 'login' 
            ? 'Sign in to continue to Sabi' 
            : 'Join Sabi to get started'
          }
        </Text>

        {/* Form */}
        <View style={styles.form}>
          {mode === 'signup' && (
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
              <BottomSheetTextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor="#999"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                editable={!isLoading}
              />
            </View>
          )}

          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
            <BottomSheetTextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
            <BottomSheetTextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              editable={!isLoading}
            />
          </View>

          {mode === 'signup' && (
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
              <BottomSheetTextInput
                style={styles.input}
                placeholder="Confirm Password"
                placeholderTextColor="#999"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoCapitalize="none"
                editable={!isLoading}
              />
            </View>
          )}
        </View>

        {/* Action Button */}
        <TouchableOpacity
          style={[styles.actionButton, isLoading && styles.buttonDisabled]}
          onPress={mode === 'login' ? handleLogin : handleSignup}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.actionButtonText}>
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </Text>
          )}
        </TouchableOpacity>

        {/* Switch Mode */}
        <View style={styles.switchContainer}>
          <Text style={styles.switchText}>
            {mode === 'login' 
              ? "Don't have an account? " 
              : "Already have an account? "
            }
          </Text>
          <TouchableOpacity onPress={switchMode} disabled={isLoading}>
            <Text style={styles.switchLink}>
              {mode === 'login' ? 'Sign Up' : 'Sign In'}
            </Text>
          </TouchableOpacity>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
});

const styles = StyleSheet.create({
  bottomSheet: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 16,
  },
  bottomSheetBackground: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  handleIndicator: {
    backgroundColor: '#E5E7EB',
    width: 40,
  },
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 26,
    fontFamily: 'Jost_700Bold',
    color: '#1a1a1a',
  },
  closeButton: {
    padding: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  form: {
    gap: 16,
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 16,
    height: 52,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1a1a1a',
    paddingVertical: 0,
  },
  actionButton: {
    backgroundColor: '#059669',
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#059669',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0,
    elevation: 0,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  switchText: {
    fontSize: 14,
    color: '#666',
  },
  switchLink: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '600',
  },
});

export default AuthModal;