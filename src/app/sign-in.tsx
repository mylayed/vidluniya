import { useTranslation } from 'react-i18next';
import { Platform, StyleSheet, View } from 'react-native';

import { CapsuleWave } from '@/components/capsule-wave';
import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { useSession } from '@/features/session/session-provider';
import { useTheme } from '@/theme/theme-provider';
import { spacing } from '@/theme/tokens';

export default function SignInScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { signInDev } = useSession();

  // TODO(Етап 1, Supabase): Google — supabase.auth.signInWithIdToken / OAuth,
  // Apple — expo-apple-authentication на iOS.
  const providers = Platform.OS === 'ios' ? (['apple', 'google'] as const) : (['google', 'apple'] as const);

  return (
    <Screen style={styles.container}>
      <View style={styles.hero}>
        <CapsuleWave color={colors.accent} size={180} />
        <AppText variant="hero">{t('auth.title')}</AppText>
        <AppText tone="secondary">{t('auth.subtitle')}</AppText>
      </View>

      <View style={styles.actions}>
        {providers.map((provider, i) => (
          <Button
            key={provider}
            label={t(provider === 'google' ? 'auth.google' : 'auth.apple')}
            variant={i === 0 ? 'primary' : 'secondary'}
            onPress={() => signInDev(provider)}
          />
        ))}
        <AppText variant="caption" tone="secondary" style={styles.note}>
          {t('auth.terms')}
        </AppText>
        {__DEV__ && (
          <AppText variant="caption" tone="accent" style={styles.note}>
            {t('auth.devNotice')}
          </AppText>
        )}
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
