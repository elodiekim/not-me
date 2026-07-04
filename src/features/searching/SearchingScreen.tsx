import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Image, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, LoadingIndicator } from '../../components/ui';

export function SearchingScreen() {
  const router = useRouter();
  const { amount } = useLocalSearchParams<{ amount?: string }>();

  useEffect(() => {
    const timer = setTimeout(
      () => router.replace({ pathname: '/mission-status', params: { amount } }),
      2500
    );
    return () => clearTimeout(timer);
  }, [router, amount]);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="flex-1 items-center justify-center gap-6 px-6">
        <Image
          source={require('../../../assets/characters/binoculars-cat.png')}
          style={{ width: 160, height: 160 }}
          resizeMode="contain"
        />
        <LoadingIndicator message="Looking for a hero..." />
        <Text className="font-sans text-center text-sm text-text-secondary">
          Stay calm. Help is on the way.
        </Text>
      </View>
      <View className="px-6 pb-6">
        <Button label="Cancel" variant="ghost" onPress={() => router.replace('/')} />
      </View>
    </SafeAreaView>
  );
}
