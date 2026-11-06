import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

import { supabase } from '@/lib/supabase/client';

// Потрібно лише на web: завершує вікно входу після повернення з Google.
WebBrowser.maybeCompleteAuthSession();

export type GoogleSignInResult = 'success' | 'cancelled';

/**
 * Вхід через Google (OAuth у браузері, PKCE).
 *
 * Native: відкриваємо системне вікно авторизації, з redirect-URL повертаємо `code`
 * і обмінюємо його на сесію. Web: звичайний redirect, сесію забере supabase-js.
 *
 * Кидає помилку, якщо щось пішло не так; 'cancelled', якщо користувач закрив вікно.
 */
export async function signInWithGoogle(): Promise<GoogleSignInResult> {
  if (Platform.OS === 'web') {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    if (error) throw error;
    return 'success';
  }

  // У dev build це `vidlunnia://auth-callback`, в Expo Go — `exp://<ip>:8081/--/auth-callback`.
  // Обидва варіанти мають бути в Redirect URLs у Supabase (див. README).
  const redirectTo = Linking.createURL('auth-callback');

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo, skipBrowserRedirect: true },
  });
  if (error) throw error;
  if (!data.url) throw new Error('Supabase не повернув адресу входу');

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (result.type !== 'success') return 'cancelled';

  const { queryParams } = Linking.parse(result.url);
  const authError = queryParams?.error_description ?? queryParams?.error;
  if (authError) throw new Error(String(authError));

  const code = queryParams?.code;
  if (typeof code !== 'string') throw new Error('У відповіді немає коду авторизації');

  const exchange = await supabase.auth.exchangeCodeForSession(code);
  if (exchange.error) throw exchange.error;
  return 'success';
}
