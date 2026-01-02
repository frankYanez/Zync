import { ZyncLoader } from '@/components/ZyncLoader';
import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { ZyncProvider } from '@/context/ZyncContext';
import { AuthProvider } from '@/features/auth/context/AuthContext';
import { CartProvider } from '@/features/wallet/context/CartContext';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';

export const unstable_settings = {
  anchor: '(tabs)',
};

function InitialLayout() {
  const [isReady, setIsReady] = useState(false);

  // Handle auth protection
  useProtectedRoute();

  useEffect(() => {
    // Simulate initial resource loading
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (!isReady) {
    return <ZyncLoader visible={true} type="overlay" />;
  }

  return (
    <ThemeProvider value={DarkTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        <Stack.Screen name="cart" options={{ presentation: 'modal', headerShown: false }} />
      </Stack>
      <StatusBar style="light" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <ZyncProvider>
      <AuthProvider>
        <CartProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <InitialLayout />
          </GestureHandlerRootView>
        </CartProvider>
      </AuthProvider>
    </ZyncProvider>
  );
}
