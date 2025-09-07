import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ImageBackground,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import AuthModal from '@/components/AuthModal';

export default function LoginScreen() {
  const [loginModalVisible, setLoginModalVisible] = useState(false);
  const [signupModalVisible, setSignupModalVisible] = useState(false);

  const handleAuthSuccess = () => {
    setLoginModalVisible(false);
    setSignupModalVisible(false);
    router.replace('/(tabs)');
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <View style={styles.container}>
        {/* Background with gradient overlay */}
        <View style={styles.backgroundContainer}>
          <ImageBackground
            source={require('../background-image.png')}
            style={{ flex: 1 }}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.6)']}
            locations={[0, 0.4, 1]}
            style={styles.gradientOverlay}
          />
          {/* Bottom gradient overlay */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            locations={[0, 1]}
            style={styles.bottomGradient}
          />
        </View>

        <View style={styles.content}>
          {/* Logo and Tagline */}
          <View style={styles.header}>
            <Text style={styles.logo}>Sabi</Text>
            <Text style={styles.tagline}>Bringing skills right to your doorstep.</Text>
          </View>

          {/* Spacer to push buttons to bottom */}
          <View style={styles.spacer} />

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => setLoginModalVisible(true)}
            >
              <Text style={styles.loginButtonText}>Login</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.signUpButton}
              onPress={() => setSignupModalVisible(true)}
            >
              <Text style={styles.signUpButtonText}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Auth Modals (outside KeyboardAvoidingView to avoid keyboard pushing sheet) */}
      <AuthModal
        visible={loginModalVisible}
        onClose={() => setLoginModalVisible(false)}
        initialMode="login"
      />
      
      <AuthModal
        visible={signupModalVisible}
        onClose={() => setSignupModalVisible(false)}
        initialMode="signup"
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 50,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: 100,
  },
  logo: {
    fontFamily: 'Niconne_400Regular', // You'll need to load this font
    fontSize: 100,
    color: '#FFFFFF',
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  tagline: {
    fontFamily: 'Jost_400Regular', // You'll need to load this font
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 24,
  },
  spacer: {
    flex: 1,
  },
  buttonContainer: {
    gap: 16,
    paddingBottom: 20,
    alignItems: 'center',
  },
  signUpButton: {
    height: 56,
    width: '72%',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000000',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  signUpButtonText: {
    fontFamily: 'Jost_500Medium',
    color: '#2D1810',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    includeFontPadding: false,
  },
  loginButton: {
    height: 56,
    width: '72%',
    backgroundColor: '#065f46',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000000',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  loginButtonText: {
    fontFamily: 'Jost_500Medium',
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    includeFontPadding: false,
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
  },
});
