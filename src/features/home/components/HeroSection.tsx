import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Image, Text, View } from 'react-native';
import { Button } from '../../../components/ui';

export function HeroSection() {
  const router = useRouter();

  return (
    <View className="gap-6">
      <View className="gap-2">
        <Text className="text-3xl font-sans-bold leading-tight text-text-primary">
          A cockroach{'\n'}just appeared.
        </Text>
        <Text className="text-3xl font-sans-bold leading-tight text-primary">Get help now.</Text>
        <Text className="text-sm text-text-secondary">
          바퀴벌레가 나타났어요? 지금 <Text className="text-primary underline">도움을 요청하세요</Text>!
        </Text>
      </View>

      <View className="items-center justify-center self-center p-6">
        <Image
          source={require('../../../../assets/characters/hero-cat.png')}
          style={{ width: 200, height: 200 }}
          resizeMode="contain"
        />
      </View>

      <View className="items-center gap-2">
        <Button
          label="Request Help"
          variant="primary"
          icon={<Feather name="zap" size={18} color="#111111" />}
          onPress={() => router.push('/request')}
        />
        <View className="items-center">
          <Text className="text-sm font-sans-medium text-text-primary">It takes 10 seconds</Text>
          <Text className="text-xs text-text-secondary">요청까지 단 10초</Text>
        </View>
      </View>
    </View>
  );
}
