import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, Redirect } from 'expo-router';
import {
  Jost_400Regular,
  Jost_500Medium,
  Jost_700Bold,
} from '@expo-google-fonts/jost';
import {
  Niconne_400Regular,
} from '@expo-google-fonts/niconne';
import * as SplashScreen from 'expo-splash-screen';
import { Text as RNText, TextInput as RNTextInput } from 'react-native';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';

import { useColorScheme } from '@/components/useColorScheme';
import useAuth from '@/src/hooks/useAuth';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: 'index',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
    Jost_400Regular,
    Jost_500Medium,
    Jost_700Bold,
    Niconne_400Regular,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  // Set default font family app-wide once fonts are loaded
  useEffect(() => {
    if (!loaded) return;
    // Preserve any existing default styles
    // Note: This affects native Text/TextInput only; Themed.Text wraps it and will inherit
    // Jost_400Regular as the base font across the app
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    RNText.defaultProps = RNText.defaultProps || {};
    // @ts-ignore
    RNText.defaultProps.style = [RNText.defaultProps.style, { fontFamily: 'Jost_400Regular' }];
    // @ts-ignore
    RNTextInput.defaultProps = RNTextInput.defaultProps || {};
    // @ts-ignore
    RNTextInput.defaultProps.style = [RNTextInput.defaultProps.style, { fontFamily: 'Jost_400Regular' }];
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  // Force light theme regardless of system setting
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading screen while checking authentication
  if (isLoading) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <ThemeProvider value={DefaultTheme}>
          <Stack>
            <Stack.Screen name="login" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
          </Stack>
        </ThemeProvider>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
