import AsyncStorage from '@react-native-async-storage/async-storage';

// Same AsyncStorage the Supabase session uses — one flag, one key.
const ONBOARDING_KEY = 'hasOnboarded';

export async function getHasOnboarded(): Promise<boolean> {
  const value = await AsyncStorage.getItem(ONBOARDING_KEY);
  return value === 'true';
}

export async function setHasOnboarded(): Promise<void> {
  await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
}

export async function clearHasOnboarded(): Promise<void> {
  await AsyncStorage.removeItem(ONBOARDING_KEY);
}
