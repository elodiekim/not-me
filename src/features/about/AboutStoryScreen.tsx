import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/ui';
import { parseLang, type AboutLang } from './lang';

// Editorial layout (chosen over card-sections and timeline mockups): normal
// flowing left-aligned paragraphs, not fragmented lines — reads like a short
// essay rather than an app-UI pattern. Photos are modest and never cropped
// (fixed width + real aspect ratio + resizeMode="contain"). No animations
// (DESIGN.md excludes them here). Hero Cat stays out of this flow —
// celebrate-cat carries the "mascot inspired by my cat" beat at the end.
const PHOTO_WIDTH = 170;

const COPY: Record<
  AboutLang,
  {
    title: string;
    titleSub: string;
    p1: string;
    cockroachCaption: string;
    p2: string;
    catCaption: string;
    aside: string;
    pullLead: string;
    pullQuote: string;
    bornBefore: string;
    bornAfter: string;
    startLabel: string;
  }
> = {
  en: {
    title: 'How NotMe Started',
    titleSub: '이 앱을 만든 이유',
    p1: "One day, a cockroach appeared in my apartment. I couldn't kill it — I stood there for almost an hour, waiting for a friend to come and rescue me.",
    cockroachCaption: 'The actual cockroach.',
    p2: 'Meanwhile, my cat sat right underneath it, meowing — it wanted to catch it. I was terrified. My cat was ready.',
    catCaption: 'He really wanted to catch it.',
    aside: '💭 "Please... don\'t run away..."',
    pullLead: 'That day, I had one thought:',
    pullQuote: '"There should be an app for this."',
    bornBefore: "That's how ",
    bornAfter: ' was born — one cockroach, one very brave cat.',
    startLabel: 'Start Using NotMe',
  },
  kr: {
    title: '이 앱을 만든 이유',
    titleSub: 'How NotMe Started',
    p1: '어느 날 집에 바퀴벌레가 나타났습니다. 저는 잡을 용기가 나지 않아, 친구가 올 때까지 거의 한 시간을 그 자리에 서 있었습니다.',
    cockroachCaption: '실제 그 바퀴벌레입니다.',
    p2: '그런데 아래를 보니 우리 집 고양이는 계속 잡고 싶다고 야옹거리고 있었습니다. 저는 무서웠고, 고양이는 준비되어 있었습니다.',
    catCaption: '계속 잡고 싶어했던 우리 집 고양이.',
    aside: '💭 "제발... 도망가지 마..."',
    pullLead: '그 순간 생각했습니다.',
    pullQuote: '"이런 것도 대신 도와주는 앱이 있으면 좋지 않을까?"',
    bornBefore: '그렇게 ',
    bornAfter: '가 시작되었습니다 — 바퀴벌레 한 마리와, 그보다 용감했던 고양이 한 마리 덕분에.',
    startLabel: 'NotMe 시작하기',
  },
};

function Wordmark({ size = 18 }: { size?: number }) {
  return (
    <Text style={{ fontSize: size }}>
      <Text className="font-sans-bold italic text-text-primary">Not</Text>
      <Text className="font-sans-bold italic text-primary">Me</Text>
    </Text>
  );
}

function Photo({ source, ratio, caption }: { source: number; ratio: number; caption: string }) {
  return (
    <View className="items-center gap-2 py-2">
      <Image
        source={source}
        style={{ width: PHOTO_WIDTH, aspectRatio: ratio, borderRadius: 16 }}
        resizeMode="contain"
      />
      <Text className="text-center font-sans text-xs italic text-text-secondary">{caption}</Text>
    </View>
  );
}

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

      <ScrollView contentContainerStyle={{ paddingHorizontal: 28, paddingBottom: 32, gap: 12 }}>
        <View className="items-center gap-3 pb-6">
          <Wordmark size={22} />
          <View className="items-center gap-1">
            <Text className="text-center text-3xl font-sans-bold text-text-primary">
              {copy.title}
            </Text>
            <Text className="text-center text-base text-text-secondary">{copy.titleSub}</Text>
          </View>
          <Image
            source={require('../../../assets/characters/proud-cat.png')}
            style={{ width: 112, height: 112 }}
            resizeMode="contain"
          />
        </View>

        <Text className="font-sans text-base text-text-primary" style={{ lineHeight: 26 }}>
          {copy.p1}
        </Text>

        <Photo
          source={require('../../../assets/about/real-cockroach.png')}
          ratio={1086 / 1448}
          caption={copy.cockroachCaption}
        />

        <Text className="font-sans text-base text-text-primary" style={{ lineHeight: 26 }}>
          {copy.p2}
        </Text>

        <Photo
          source={require('../../../assets/about/real-cat.png')}
          ratio={1122 / 1402}
          caption={copy.catCaption}
        />

        <Text
          className="text-center font-sans text-base italic text-text-secondary"
          style={{ lineHeight: 24, marginTop: 8 }}
        >
          {copy.aside}
        </Text>

        <Text
          className="font-sans text-base text-text-primary"
          style={{ lineHeight: 26, marginTop: 16 }}
        >
          {copy.pullLead}
        </Text>
        <Text
          className="font-sans-bold text-text-primary"
          style={{ fontSize: 22, lineHeight: 30 }}
        >
          {copy.pullQuote}
        </Text>

        <View className="bg-primary" style={{ width: 32, height: 3, borderRadius: 2, marginTop: 20, marginBottom: 4 }} />

        <Text className="font-sans text-base text-text-primary" style={{ lineHeight: 26 }}>
          {copy.bornBefore}
          <Wordmark size={16} />
          {copy.bornAfter}
        </Text>

        <Image
          source={require('../../../assets/characters/celebrate-cat.png')}
          style={{ width: 100, height: 100, alignSelf: 'center', marginTop: 16 }}
          resizeMode="contain"
        />

        <View className="pt-8">
          <Button label={copy.startLabel} variant="primary" onPress={() => router.replace('/')} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
