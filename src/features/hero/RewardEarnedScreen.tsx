import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/ui';

export function RewardEarnedScreen() {
  const { amount } = useLocalSearchParams<{ amount: string }>();
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="flex-1 items-center justify-center gap-3 px-6">
        <Image
          source={require('../../../assets/characters/proud-cat.png')}
          style={{ width: 140, height: 140 }}
          resizeMode="contain"
        />
        <Text className="text-2xl font-sans-bold text-text-primary">You earned ${amount}!</Text>
        <Text className="font-sans text-center text-sm text-text-secondary">
          Nice work out there.{'\n'}수고하셨어요!
        </Text>
      </View>
      <View className="px-6 pb-6">
        <Button label="Back to Home" variant="primary" onPress={() => router.replace('/')} />
      </View>
    </SafeAreaView>
  );
}
