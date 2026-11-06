import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.EXPO_PUBLIC_SUPABASE_KEY;

if (!url || !publishableKey) {
  throw new Error(
    'Не задано EXPO_PUBLIC_SUPABASE_URL або EXPO_PUBLIC_SUPABASE_KEY. Скопіюйте .env.example у .env і заповніть значення.',
  );
}

/**
 * Клієнт Supabase для застосунку.
 * Використовується лише publishable-ключ: доступ до даних захищає RLS.
 * Secret-ключ у застосунок не потрапляє ніколи.
 */
export const supabase = createClient(url, publishableKey, {
  auth: {
    storage: AsyncStorage,
    flowType: 'pkce',
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web',
  },
});

// Оновлюємо токен, лише поки застосунок активний.
if (Platform.OS !== 'web') {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      supabase.auth.startAutoRefresh();
    } else {
      supabase.auth.stopAutoRefresh();
    }
  });
}
