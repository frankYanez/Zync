import { ZyncLoader } from '@/presentation/components/ui/ZyncLoader';
import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { CartProvider } from '@/application/CartContext';
import { ZyncProvider } from '@/application/ZyncContext';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  // Force dark theme


  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial resource loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 4000); // 4 seconds splash
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <ZyncLoader visible={true} type="overlay" />;
  }

  return (
    <ZyncProvider>
      <CartProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <ThemeProvider value={DarkTheme}>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
              <Stack.Screen name="cart" options={{ presentation: 'modal', headerShown: false }} />
            </Stack>
            <StatusBar style="light" />
          </ThemeProvider>
        </GestureHandlerRootView>
      </CartProvider>
    </ZyncProvider>
  );
}
