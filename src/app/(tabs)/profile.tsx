import { useTranslation } from 'react-i18next';
import { Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { useSession } from '@/features/session/session-provider';
import { setLanguage, type Language } from '@/i18n';
import { useTheme, type ThemePreference } from '@/theme/theme-provider';
import { radius, spacing } from '@/theme/tokens';

export default function ProfileScreen() {
  const { t, i18n } = useTranslation();
  const { colors, preference, setPreference } = useTheme();
  const { signOut, resetOnboarding } = useSession();

  const themeOptions: { value: ThemePreference; label: string }[] = [
    { value: 'dark', label: t('profile.themeDark') },
    { value: 'light', label: t('profile.themeLight') },
    { value: 'system', label: t('profile.themeSystem') },
  ];
  const languageOptions: { value: Language; label: string }[] = [
    { value: 'uk', label: 'Українська' },
    { value: 'en', label: 'English' },
  ];

  return (
    <Screen edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AppText variant="title">{t('profile.title')}</AppText>

        <View style={styles.stats}>
          <StatCard label={t('profile.myCapsules')} value="0" />
          <StatCard label={t('profile.found')} value="0" />
        </View>

        <AppText variant="label" tone="secondary">
          {t('profile.settings').toUpperCase()}
        </AppText>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <AppText variant="bodyStrong">{t('profile.theme')}</AppText>
          <Segmented options={themeOptions} value={preference} onChange={setPreference} />

          <AppText variant="bodyStrong">{t('profile.language')}</AppText>
          <Segmented
            options={languageOptions}
            value={i18n.language as Language}
            onChange={(language) => setLanguage(language)}
          />
        </View>

        <Button label={t('profile.signOut')} variant="secondary" onPress={signOut} />
        {__DEV__ && (
          <Button label={t('profile.resetOnboarding')} variant="ghost" onPress={resetOnboarding} />
        )}
      </ScrollView>
    </Screen>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.stat, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <AppText variant="hero" tone="accent">
        {value}
      </AppText>
      <AppText tone="secondary">{label}</AppText>
    </View>
  );
}

function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  const { colors } = useTheme();
  return (
    <View style={[styles.segmented, { backgroundColor: colors.surfaceRaised }]}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(option.value)}
            style={[styles.segment, active && { backgroundColor: colors.accent }]}>
            <AppText variant="bodyStrong" tone={active ? 'onAccent' : 'secondary'}>
              {option.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  // На web NativeTabs малює панель вкладок зверху поверх контенту.
  content: { gap: spacing.md, paddingTop: Platform.OS === 'web' ? 64 : spacing.md, paddingBottom: spacing.md },
  stats: { flexDirection: 'row', gap: spacing.sm },
  stat: { flex: 1, borderRadius: radius.md, borderWidth: 1, padding: spacing.md, gap: spacing.xs },
  card: { borderRadius: radius.md, borderWidth: 1, padding: spacing.md, gap: spacing.sm },
  segmented: { flexDirection: 'row', borderRadius: radius.sm, padding: 3 },
  segment: { flex: 1, alignItems: 'center', paddingVertical: spacing.sm, borderRadius: radius.sm - 2 },
});
