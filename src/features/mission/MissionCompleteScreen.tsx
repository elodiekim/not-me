import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, Image, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/ui';

const CELEBRATE_CAT = require('../../../assets/characters/celebrate-cat.png');

export function MissionCompleteScreen() {
  const { missionId } = useLocalSearchParams<{ missionId: string }>();
  const router = useRouter();
  const scale = useRef(new Animated.Value(0.85)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.05, duration: 200, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 120, useNativeDriver: true }),
      ]),
    ]).start();
  }, [opacity, scale]);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <Animated.View
        style={{ opacity, transform: [{ scale }] }}
        className="flex-1 items-center justify-center gap-3 px-6"
      >
        <Image source={CELEBRATE_CAT} style={{ width: 140, height: 140 }} resizeMode="contain" />
        <Text className="text-2xl font-sans-bold text-text-primary">Mission Complete!</Text>
        <Text className="font-sans text-center text-sm text-text-secondary">
          Your hero saved the day{'\n'}미션 완료! 히어로가 문제를 해결했어요
        </Text>
      </Animated.View>
      <View className="gap-3 px-6 pb-6">
        <Button
          label="Leave a Review"
          variant="primary"
          onPress={() => router.replace({ pathname: '/complete', params: { missionId } })}
        />
        <Button
          label="Not now · 나중에 할게요"
          variant="ghost"
          onPress={() => router.replace('/')}
        />
      </View>
    </SafeAreaView>
  );
}
