import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { CapsuleWave } from '@/components/capsule-wave';
import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { useTheme } from '@/theme/theme-provider';
import { radius, spacing } from '@/theme/tokens';

const filters = ['public', 'mine', 'forMe', 'quests'] as const;
type Filter = (typeof filters)[number];

const filterLabels = {
  public: 'map.filterPublic',
  mine: 'map.filterMine',
  forMe: 'map.filterForMe',
  quests: 'map.filterQuests',
} as const;

/**
 * Екран карти.
 * TODO(Етап 1): react-native-maps з темним/світлим стилем і капсулами
 * з RPC capsules_nearby; точна точка — лише в радіусі ~300 м.
 */
export default function MapScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [filter, setFilter] = useState<Filter>('public');

  return (
    <Screen edges={['top']}>
      <AppText variant="title" style={styles.title}>
        {t('map.title')}
      </AppText>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters} style={styles.filtersScroll}>
        {filters.map((item) => {
          const active = item === filter;
          return (
            <Pressable
              key={item}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              onPress={() => setFilter(item)}
              style={[
                styles.chip,
                {
                  backgroundColor: active ? colors.accent : colors.surface,
                  borderColor: active ? colors.accent : colors.border,
                },
              ]}>
              <AppText variant="bodyStrong" tone={active ? 'onAccent' : 'primary'}>
                {t(filterLabels[item])}
              </AppText>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={[styles.mapPlaceholder, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.waveA}>
          <CapsuleWave color={colors.accent} size={120} />
        </View>
        <View style={styles.waveB}>
          <CapsuleWave color={colors.timeCapsule} size={90} rings={2} />
        </View>
        <AppText tone="secondary" style={styles.placeholderText}>
          {t('map.placeholder')}
        </AppText>
      </View>

      <Button label={t('map.record')} onPress={() => {}} style={styles.record} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  // На web NativeTabs малює панель вкладок зверху поверх контенту.
  title: { marginTop: Platform.OS === 'web' ? 64 : spacing.md },
  filtersScroll: { flexGrow: 0, marginVertical: spacing.md },
  filters: { gap: spacing.sm },
  chip: {
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  mapPlaceholder: {
    flex: 1,
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  waveA: { position: 'absolute', top: '18%', left: '14%' },
  waveB: { position: 'absolute', bottom: '20%', right: '16%' },
  placeholderText: { textAlign: 'center', paddingHorizontal: spacing.xl },
  record: { marginVertical: spacing.md },
});
