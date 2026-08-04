import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card } from '../../components/ui';
import { parseLang } from './lang';

// Same words as the DESIGN.md spec — split into paragraphs at natural pauses
// purely for reading comfort (one dense unbroken block was hard to read).
const COPY = {
  en: {
    title: 'How NotMe Started',
    story: [
      "One day, a cockroach appeared in my apartment. I couldn't kill it. Instead, I stood there for almost an hour, watching it and waiting for a friend to come and rescue me.",
      'Meanwhile, my cat was sitting underneath it, meowing because it wanted to catch it. I was terrified. My cat was ready.',
      'That day I had one simple thought. "There should be an app for this." That’s how NotMe was born.',
      "The mascot you see throughout this app is inspired by my own cat, who was much braver than I was. NotMe started with one cockroach, but it grew into an idea: helping people solve the weird little problems they don't want to face alone.",
    ],
    quote:
      '💭 What I was thinking — "Please don’t run away..." I stood there watching that cockroach for almost an hour, waiting for a friend.',
    continueLabel: 'Continue',
  },
  kr: {
    title: '이 앱을 만든 이유',
    story: [
      '어느 날 집에 바퀴벌레가 나타났습니다. 저는 잡을 용기가 나지 않았습니다. 혹시라도 도망갈까 봐 친구가 올 때까지 거의 한 시간을 그 자리에서 서 있었습니다.',
      '그런데 아래를 보니 우리 집 고양이는 계속 잡고 싶다고 야옹거리고 있었습니다. 저는 무서웠고, 고양이는 준비되어 있었습니다.',
      '그때 이런 생각이 들었습니다. "이런 것도 대신 도와주는 앱이 있으면 좋지 않을까?"',
    ],
    quote:
      '💭 그때 들었던 생각 — "제발 도망가지 마..." 친구가 올 때까지 거의 한 시간을 바퀴벌레만 바라보고 있었습니다.',
    continueLabel: '계속하기',
  },
};

export function AboutStoryScreen() {
  const router = useRouter();
  const { lang: langParam } = useLocalSearchParams<{ lang?: string }>();
  const lang = parseLang(langParam);
  const copy = COPY[lang];

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

      <ScrollView contentContainerStyle={{ padding: 24, gap: 32 }}>
        <View className="items-center gap-6">
          <Image
            source={require('../../../assets/logo/brand-logo.png')}
            style={{ width: 120, height: 40 }}
            resizeMode="contain"
          />
          <Image
            source={require('../../../assets/characters/proud-cat.png')}
            style={{ width: 160, height: 160 }}
            resizeMode="contain"
          />
          <Text className="text-center text-2xl font-sans-bold text-text-primary">
            {copy.title}
          </Text>
        </View>

        <View className="gap-4">
          {copy.story.map((paragraph, index) => (
            <Text
              key={index}
              className="font-sans text-base text-text-primary"
              style={{ lineHeight: 26 }}
            >
              {paragraph}
            </Text>
          ))}
        </View>

        <View className="items-center">
          <Card style={{ maxWidth: 320 }}>
            <Text className="text-center font-sans text-sm text-text-secondary">
              {copy.quote}
            </Text>
          </Card>
        </View>

        <Button
          label={copy.continueLabel}
          variant="primary"
          onPress={() => router.push({ pathname: '/about/real-story', params: { lang } })}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
