import { Stack, useRouter } from 'expo-router';
import { useFonts } from 'expo-font';
import { DarkTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import NetInfo from '@react-native-community/netinfo';

import { AuthProvider } from '@/src/contexts/AuthContext';
import { FamilyProvider } from '@/src/contexts/FamilyContext';
import { AppLockGate } from '@/src/components/AppLockGate';
import { flushOutbox } from '@/src/lib/outbox';
import { colors } from '@/src/theme';

export { ErrorBoundary } from 'expo-router';

const familyTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.bg,
    card: colors.card,
    text: colors.text,
    border: colors.cardBorder,
    primary: colors.accent,
  },
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  useEffect(() => {
    const unsub = NetInfo.addEventListener(() => {
      flushOutbox();
    });
    return () => unsub();
  }, []);

  if (!loaded) return null;

  return (
    <AuthProvider>
      <FamilyProvider>
        <ThemeProvider value={familyTheme}>
          <AppLockGate>
            <Stack screenOptions={{ headerStyle: { backgroundColor: colors.bg }, headerTintColor: colors.text }}>
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="log" options={{ presentation: 'modal', title: 'Log activity' }} />
            </Stack>
          </AppLockGate>
        </ThemeProvider>
      </FamilyProvider>
    </AuthProvider>
  );
}
