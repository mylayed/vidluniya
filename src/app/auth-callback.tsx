import { Redirect } from 'expo-router';

/**
 * Сюди повертається redirect після входу через Google (deep link).
 * Код авторизації обробляє signInWithGoogle, тож екрану показувати нічого:
 * одразу відправляємо на головний маршрут, а захист у _layout вибере правильний екран.
 */
export default function AuthCallback() {
  return <Redirect href="/" />;
}
