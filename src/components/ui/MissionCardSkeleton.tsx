import { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';
import { Card } from './Card';

// Placeholder that mirrors MissionCard's layout (round avatar + badge + two text
// lines) so the list "settles" into real data instead of popping in from a spinner.
// One shared opacity value pulses the whole card — enough polish without a library.
export function MissionCardSkeleton() {
  const opacity = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: false }),
        Animated.timing(opacity, { toValue: 0.5, duration: 700, useNativeDriver: false }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Card>
      <Animated.View
        className="flex-row items-center gap-4"
        style={{ opacity }}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <View className="rounded-full bg-surface" style={{ width: 64, height: 64 }} />
        <View className="flex-1 gap-2">
          <View className="rounded-full bg-surface" style={{ width: 64, height: 16 }} />
          <View className="rounded-md bg-surface" style={{ width: '70%', height: 18 }} />
          <View className="rounded-md bg-surface" style={{ width: '45%', height: 14 }} />
        </View>
      </Animated.View>
    </Card>
  );
}
