import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

type Props = {
  size?: number;
  color: string;
  rings?: number;
};

/** «Хвиля» капсули: пульсуючі кола, якими капсули позначені на карті. */
export function CapsuleWave({ size = 160, color, rings = 3 }: Props) {
  return (
    <View style={{ width: size, height: size }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {Array.from({ length: rings }, (_, index) => (
        <Ring key={index} size={size} color={color} delay={(index * 2400) / rings} />
      ))}
      <View
        style={[
          styles.core,
          {
            width: size * 0.18,
            height: size * 0.18,
            borderRadius: size,
            backgroundColor: color,
            top: size * 0.41,
            left: size * 0.41,
          },
        ]}
      />
    </View>
  );
}

function Ring({ size, color, delay }: { size: number; color: string; delay: number }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      delay,
      withRepeat(withTiming(1, { duration: 2400, easing: Easing.out(Easing.quad) }), -1, false),
    );
  }, [delay, progress]);

  const animated = useAnimatedStyle(() => ({
    opacity: 0.55 * (1 - progress.value),
    transform: [{ scale: 0.2 + progress.value * 0.8 }],
  }));

  return (
    <Animated.View
      style={[
        StyleSheet.absoluteFill,
        { borderRadius: size, borderWidth: 2, borderColor: color, backgroundColor: color + '22' },
        animated,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  core: { position: 'absolute' },
});
