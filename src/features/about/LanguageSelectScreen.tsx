import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/ui';
import type { AboutLang } from './lang';

export function LanguageSelectScreen() {
  const router = useRouter();

  const choose = (lang: AboutLang) => {
    router.push({ pathname: '/about/story', params: { lang } });
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="flex-row items-center px-6 py-4">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={() => router.back()}
        >
          <Feather name="arrow-left" size={24} color="#111111" />
        </Pressable>
      </View>

      <View className="flex-1 items-center justify-center gap-10 px-6">
        <View className="items-center gap-2">
          <Text className="text-2xl font-sans-bold text-text-primary">About NotMe</Text>
          <Text className="text-center text-sm text-text-secondary">
            Pick a language to continue.{'\n'}이어서 볼 언어를 선택해주세요.
          </Text>
        </View>

        <View className="w-full gap-3">
          <Button label="🇺🇸 English" variant="primary" onPress={() => choose('en')} />
          <Button label="🇰🇷 한국어" variant="secondary" onPress={() => choose('kr')} />
        </View>
      </View>
    </SafeAreaView>
  );
}
