import { useEffect, useRef } from 'react';
import { Animated, Image, Text, View } from 'react-native';
import { COLORS } from '../../../constants/colors';

const CELEBRATE_CAT = require('../../../../assets/characters/celebrate-cat.png');

interface CelebrationBannerProps {
  onDismiss: () => void;
  durationMs?: number;
}

export function CelebrationBanner({ onDismiss, durationMs = 2500 }: CelebrationBannerProps) {
  const scale = useRef(new Animated.Value(0.85)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.sequence([
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.sequence([
          Animated.timing(scale, { toValue: 1.05, duration: 200, useNativeDriver: true }),
          Animated.timing(scale, { toValue: 1, duration: 120, useNativeDriver: true }),
        ]),
      ]),
      Animated.delay(durationMs),
      Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]);
    animation.start(({ finished }) => {
      if (finished) onDismiss();
    });
    return () => animation.stop();
  }, [opacity, scale, durationMs, onDismiss]);

  return (
    <View
      pointerEvents="none"
      style={{ position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center', zIndex: 50 }}
    >
      <Animated.View
        style={{
          opacity,
          transform: [{ scale }],
          backgroundColor: COLORS.background,
          shadowColor: '#000',
          shadowOpacity: 0.06,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 2 },
          elevation: 2,
        }}
        className="items-center gap-1 rounded-card px-6 py-5"
      >
        <Image
          source={CELEBRATE_CAT}
          style={{ width: 120, height: 120, marginBottom: 4 }}
          resizeMode="contain"
        />
        <Text className="text-center text-base font-sans-bold text-text-primary">
          Mission Complete!{'\n'}Your hero saved the day
        </Text>
        <Text className="font-sans text-center text-sm text-text-secondary">
          미션 완료! 히어로가 문제를 해결했어요
        </Text>
      </Animated.View>
    </View>
  );
}
