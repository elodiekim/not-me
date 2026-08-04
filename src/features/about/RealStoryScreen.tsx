import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/ui';
import { parseLang } from './lang';

const COPY = {
  en: {
    title: 'The Real Story',
    cockroachCaption: 'The one that started everything.',
    catCaption: "He wanted to catch it. I definitely didn't.",
    heroCatCaption: 'The mascot of NotMe was inspired by my real cat.',
    footer: 'Made with ☕ and one unforgettable cockroach.',
    ctaLabel: '🐱 Continue to NotMe — Start helping with weird problems →',
  },
  kr: {
    title: '진짜 이야기',
    cockroachCaption: '모든 것의 시작이 된 바로 그 바퀴벌레입니다.',
    catCaption: '저보다 훨씬 용감했던 우리 집 고양이입니다.',
    heroCatCaption: '지금 앱에서 사용하는 Hero Cat은 이 친구에게서 영감을 받아 만들어졌습니다.',
    footer: '☕ 바퀴벌레 한 마리와 용감한 고양이가 만든 앱',
    ctaLabel: '홈으로',
  },
};

function PhotoBlock({
  source,
  caption,
  aspectRatio,
}: {
  source: number;
  caption: string;
  aspectRatio: number;
}) {
  return (
    <View className="items-center gap-3">
      <Image
        source={source}
        // contain (not cover) so the whole photo always shows, never cropped —
        // and capped well under full width so it reads as a photo, not a banner.
        style={{ width: 240, aspectRatio, borderRadius: 24 }}
        resizeMode="contain"
      />
      <Text className="text-center font-sans text-sm text-text-secondary">{caption}</Text>
    </View>
  );
}

export function RealStoryScreen() {
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

      <ScrollView contentContainerStyle={{ padding: 24, gap: 40 }}>
        <Text className="text-center text-2xl font-sans-bold text-text-primary">
          {copy.title}
        </Text>

        <PhotoBlock
          source={require('../../../assets/about/real-cockroach.png')}
          caption={copy.cockroachCaption}
          aspectRatio={1086 / 1448}
        />

        <PhotoBlock
          source={require('../../../assets/about/real-cat.png')}
          caption={copy.catCaption}
          aspectRatio={1122 / 1402}
        />

        <View className="items-center gap-3">
          <Image
            source={require('../../../assets/characters/hero-cat.png')}
            style={{ width: 200, height: 200 }}
            resizeMode="contain"
          />
          <Text className="text-center font-sans text-sm text-text-secondary">
            {copy.heroCatCaption}
          </Text>
        </View>

        <Text className="text-center font-sans text-xs text-text-secondary">{copy.footer}</Text>

        <Button label={copy.ctaLabel} variant="primary" onPress={() => router.replace('/')} />
      </ScrollView>
    </SafeAreaView>
  );
}
