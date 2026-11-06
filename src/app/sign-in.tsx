import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { CapsuleWave } from '@/components/capsule-wave';
import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { signInWithGoogle } from '@/features/session/google-auth';
import { useTheme } from '@/theme/theme-provider';
import { spacing } from '@/theme/tokens';

export default function SignInScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  const onGoogle = async () => {
    setBusy(true);
    setFailed(false);
    try {
      await signInWithGoogle();
      // Після успіху SessionProvider побачить сесію, і маршрут зміниться сам.
    } catch (error) {
      if (__DEV__) console.warn('Google sign-in failed', error);
      setFailed(true);
    } finally {
      setBusy(false);
    }
  };

  // TODO(Етап 1): Apple (expo-apple-authentication) — потрібен платний Apple Developer.
  return (
    <Screen style={styles.container}>
      <View style={styles.hero}>
        <CapsuleWave color={colors.accent} size={180} />
        <AppText variant="hero">{t('auth.title')}</AppText>
        <AppText tone="secondary">{t('auth.subtitle')}</AppText>
      </View>

      <View style={styles.actions}>
        {failed && (
          <AppText variant="caption" style={[styles.note, { color: colors.danger }]}>
            {t('auth.error')}
          </AppText>
        )}
        <Button label={t('auth.google')} onPress={onGoogle} disabled={busy} />
        <AppText variant="caption" tone="secondary" style={styles.note}>
          {t('auth.terms')}
        </AppText>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { justifyContent: 'space-between' },
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  actions: { gap: spacing.sm, paddingBottom: spacing.md },
  note: { textAlign: 'center' },
});
