import AsyncStorage from '@react-native-async-storage/async-storage';

const LAST_VIEWED_KEY = 'family:last_viewed_at';
const APP_LOCK_KEY = 'family:app_lock_enabled';

export async function getLastViewedAt(): Promise<string | null> {
  return AsyncStorage.getItem(LAST_VIEWED_KEY);
}

export async function setLastViewedAt(iso: string): Promise<void> {
  await AsyncStorage.setItem(LAST_VIEWED_KEY, iso);
}

export async function isAppLockEnabled(): Promise<boolean> {
  const value = await AsyncStorage.getItem(APP_LOCK_KEY);
  return value === 'true';
}

export async function setAppLockEnabled(enabled: boolean): Promise<void> {
  await AsyncStorage.setItem(APP_LOCK_KEY, enabled ? 'true' : 'false');
}
