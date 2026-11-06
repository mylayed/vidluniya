import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Невеликі несекретні налаштування (тема, мова, онбординг).
 * Токени й секрети — лише в expo-secure-store.
 */
const PREFIX = 'vidlunnia:';

export const storageKeys = {
  onboarded: 'onboarded',
  themePreference: 'themePreference',
  language: 'language',
  devSession: 'devSession',
} as const;

export async function getItem(key: string): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(PREFIX + key);
  } catch {
    return null;
  }
}

export async function setItem(key: string, value: string): Promise<void> {
  try {
    await AsyncStorage.setItem(PREFIX + key, value);
  } catch {
    // Налаштування не критичні: застосунок працює і без збереження.
  }
}

export async function removeItem(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(PREFIX + key);
  } catch {
    // ігноруємо
  }
}
