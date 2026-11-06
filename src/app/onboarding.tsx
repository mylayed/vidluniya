import { requestRecordingPermissionsAsync } from 'expo-audio';
import * as Location from 'expo-location';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FlatList,
  StyleSheet,
  View,
  useWindowDimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';

import { CapsuleWave } from '@/components/capsule-wave';
import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { useSession } from '@/features/session/session-provider';
import { useTheme } from '@/theme/theme-provider';
import { radius, spacing } from '@/theme/tokens';

type PermissionState = 'unknown' | 'granted' | 'denied';

const slides = [
  { key: '1', title: 'onboarding.slide1Title', body: 'onboarding.slide1Body', accent: 'accent' },
  { key: '2', title: 'onboarding.slide2Title', body: 'onboarding.slide2Body', accent: 'accent' },
  { key: '3', title: 'onboarding.slide3Title', body: 'onboarding.slide3Body', accent: 'timeCapsule' },
] as const;

export default function OnboardingScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const { completeOnboarding } = useSession();
  const listRef = useRef<FlatList<(typeof slides)[number]>>(null);
  const [index, setIndex] = useState(0);
  const [showPermissions, setShowPermissions] = useState(false);
  const [location, setLocation] = useState<PermissionState>('unknown');
  const [microphone, setMicrophone] = useState<PermissionState>('unknown');

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setIndex(Math.round(event.nativeEvent.contentOffset.x / width));
  };

  const next = () => {
    if (index < slides.length - 1) {
      // onMomentumScrollEnd не спрацьовує на програмному скролі (web), тож оновлюємо індекс одразу.
      listRef.current?.scrollToIndex({ index: index + 1, animated: true });
      setIndex(index + 1);
    } else {
      setShowPermissions(true);
    }
  };

  const requestPermissions = async () => {
    try {
      const loc = await Location.requestForegroundPermissionsAsync();
      setLocation(loc.granted ? 'granted' : 'denied');
    } catch {
      setLocation('denied');
    }
    try {
      const mic = await requestRecordingPermissionsAsync();
      setMicrophone(mic.granted ? 'granted' : 'denied');
    } catch {
      setMicrophone('denied');
    }
  };

  if (showPermissions) {
    const asked = location !== 'unknown' || microphone !== 'unknown';
    return (
      <Screen style={styles.permissions}>
        <View style={styles.center}>
          <CapsuleWave color={colors.accent} size={140} />
          <AppText variant="title" style={styles.centerText}>
            {t('onboarding.permissionsTitle')}
          </AppText>
          <AppText tone="secondary" style={styles.centerText}>
            {t('onboarding.permissionsBody')}
          </AppText>

          {asked && (
            <View style={[styles.statusCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <PermissionRow label={t('onboarding.location')} state={location} />
              <PermissionRow label={t('onboarding.microphone')} state={microphone} />
            </View>
          )}
        </View>

        <View style={styles.actions}>
          {asked ? (
            <Button label={t('common.start')} onPress={completeOnboarding} />
          ) : (
            <>
              <Button label={t('onboarding.allow')} onPress={requestPermissions} />
              <Button label={t('common.later')} variant="ghost" onPress={completeOnboarding} />
            </>
          )}
        </View>
      </Screen>
    );
  }

  return (
    <Screen style={styles.noPadding}>
      <View style={styles.skipRow}>
        <Button label={t('common.skip')} variant="ghost" onPress={() => setShowPermissions(true)} />
      </View>

      <FlatList
        ref={listRef}
        data={slides}
        keyExtractor={(item) => item.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScroll}
        getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <CapsuleWave color={colors[item.accent]} size={200} />
            <AppText variant="hero" style={styles.centerText}>
              {t(item.title)}
            </AppText>
            <AppText tone="secondary" style={styles.centerText}>
              {t(item.body)}
            </AppText>
          </View>
        )}
      />

      <View style={styles.footer}>
        <View style={styles.dots}>
          {slides.map((slide, i) => (
            <View
              key={slide.key}
              style={[
                styles.dot,
                { backgroundColor: i === index ? colors.accent : colors.border, width: i === index ? 24 : 8 },
              ]}
            />
          ))}
        </View>
        <Button label={t('common.next')} onPress={next} />
      </View>
    </Screen>
  );
}

function PermissionRow({ label, state }: { label: string; state: PermissionState }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const granted = state === 'granted';
  return (
    <View style={styles.permissionRow}>
      <AppText variant="bodyStrong">{label}</AppText>
      <AppText style={{ color: granted ? colors.accent : colors.danger }}>
        {granted ? t('onboarding.granted') : t('onboarding.denied')}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  noPadding: { paddingHorizontal: 0 },
  skipRow: { alignItems: 'flex-end', paddingHorizontal: spacing.md },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  centerText: { textAlign: 'center' },
  footer: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md, gap: spacing.lg },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: spacing.sm },
  dot: { height: 8, borderRadius: radius.pill },
  permissions: { justifyContent: 'space-between' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.lg },
  statusCard: {
    alignSelf: 'stretch',
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.md,
    gap: spacing.sm,
  },
  permissionRow: { flexDirection: 'row', justifyContent: 'space-between' },
  actions: { gap: spacing.sm, paddingBottom: spacing.md },
});
