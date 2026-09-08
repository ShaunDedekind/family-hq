import { useEffect, useState } from 'react';
import { AppState, Platform, View, Text, StyleSheet } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { isAppLockEnabled } from '@/src/lib/storage';

export function AppLockGate({ children }: { children: React.ReactNode }) {
  const [unlocked, setUnlocked] = useState(Platform.OS === 'web');
  const [checking, setChecking] = useState(Platform.OS !== 'web');

  const authenticate = async () => {
    if (Platform.OS === 'web') {
      setUnlocked(true);
      setChecking(false);
      return;
    }

    const enabled = await isAppLockEnabled();
    if (!enabled) {
      setUnlocked(true);
      setChecking(false);
      return;
    }

    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    if (!hasHardware || !enrolled) {
      setUnlocked(true);
      setChecking(false);
      return;
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Unlock Family',
      fallbackLabel: 'Use passcode',
    });
    setUnlocked(result.success);
    setChecking(false);
  };

  useEffect(() => {
    authenticate();
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        setChecking(true);
        authenticate();
      } else if (state === 'background') {
        setUnlocked(false);
      }
    });
    return () => sub.remove();
  }, []);

  if (checking) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>Checking lock…</Text>
      </View>
    );
  }

  if (!unlocked) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Family is locked</Text>
        <Text style={styles.text} onPress={authenticate}>
          Tap to unlock
        </Text>
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0f172a',
  },
  title: {
    color: '#f8fafc',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  text: {
    color: '#94a3b8',
    fontSize: 16,
  },
});
