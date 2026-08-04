import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/ui';
import { parseLang, type AboutLang } from './lang';

// Editorial layout (chosen over card-sections and timeline mockups): normal
// flowing left-aligned paragraphs, not fragmented lines — reads like a short
// essay rather than an app-UI pattern. Everything left-aligned, no exceptions
// — the closing beat is a third real photo (not an illustration) so the
// piece stays photographic/authentic all the way through instead of
// snapping back to a cartoon mascot at the emotional peak. Photos are modest
// and never cropped (fixed width/height, resizeMode="contain"). No
// animations (DESIGN.md excludes them here).
const PHOTO_WIDTH = 190;
// Heights computed from each photo's real pixel ratio at PHOTO_WIDTH — fixed
// numbers instead of aspectRatio (see Photo component).
const COCKROACH_HEIGHT = Math.round((PHOTO_WIDTH * 1448) / 1086); // 253
const CAT_HEIGHT = Math.round((PHOTO_WIDTH * 1402) / 1122); // 237
const CAT_BOX_HEIGHT = Math.round((PHOTO_WIDTH * 1440) / 1080); // 253

const COPY: Record<
  AboutLang,
  {
    title: string;
    titleSub: string;
    p1: string[];
    cockroachCaption: string;
    p2: string[];
    catCaption: string;
    aside: string;
    pullLead: string;
    pullQuote: string;
    bornBefore: string;
    bornAfter: string;
    catBoxCaption: string;
    startLabel: string;
  }
> = {
  en: {
    title: 'How NotMe Started',
    titleSub: '이 앱을 만든 이유',
    p1: [
      'One day, a cockroach appeared in my apartment.',
      "I couldn't kill it — I stood there for almost an hour, waiting for a friend to come and rescue me.",
    ],
    cockroachCaption: 'The actual cockroach.',
    p2: [
      'Meanwhile, my cat sat right underneath it, meowing — it wanted to catch it.',
      'I was terrified.',
      'My cat was ready.',
    ],
    catCaption: 'He really wanted to catch it.',
    aside: '💭 "Please... don\'t run away..."',
    pullLead: 'That day, I had one thought:',
    pullQuote: '"There should be an app for this."',
    bornBefore: "That's how ",
    bornAfter: ' was born — one cockroach, one very brave cat.',
    catBoxCaption: 'Every character in this app is inspired by him.',
    startLabel: 'Start Using NotMe',
  },
  kr: {
    title: '이 앱을 만든 이유',
    titleSub: 'How NotMe Started',
    p1: [
      '어느 날 집에 바퀴벌레가 나타났습니다.',
      '저는 잡을 용기가 나지 않아, 친구가 올 때까지 거의 한 시간을 그 자리에 서 있었습니다.',
    ],
    cockroachCaption: '실제 그 바퀴벌레입니다.',
    p2: [
      '그런데 아래를 보니 우리 집 고양이는 계속 잡고 싶다고 야옹거리고 있었습니다.',
      '저는 무서웠고, 고양이는 준비되어 있었습니다.',
    ],
    catCaption: '계속 잡고 싶어했던 우리 집 고양이.',
    aside: '💭 "제발... 도망가지 마..."',
    pullLead: '그 순간 생각했습니다.',
    pullQuote: '"이런 것도 대신 도와주는 앱이 있으면 좋지 않을까?"',
    bornBefore: '그렇게 ',
    bornAfter: '가 시작되었습니다 — 바퀴벌레 한 마리와, 그보다 용감했던 고양이 한 마리 덕분에.',
    catBoxCaption: '이 앱에 나오는 캐릭터들은 전부 얘한테서 영감을 받았어요.',
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

function Photo({ source, height, caption }: { source: number; height: number; caption: string }) {
  return (
    <View className="items-start gap-2 py-2">
      {/* Fixed width AND height (no aspectRatio) — aspectRatio-computed sizing
          wasn't being respected on-device, rendering the photo edge-to-edge. */}
      <Image
        source={source}
        style={{ width: PHOTO_WIDTH, height, borderRadius: 16 }}
        resizeMode="contain"
      />
      <Text className="font-sans text-xs italic text-text-secondary">{caption}</Text>
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
        <View className="items-start gap-3 pb-6">
          <Image
            source={require('../../../assets/characters/proud-cat.png')}
            style={{ width: 72, height: 72 }}
            resizeMode="contain"
          />
          <View className="items-start gap-1">
            <Text className="text-3xl font-sans-bold text-text-primary">{copy.title}</Text>
            {lang !== 'en' && (
              <Text className="text-base text-text-secondary">{copy.titleSub}</Text>
            )}
          </View>
        </View>

        {copy.p1.map((sentence, i) => (
          <Text
            key={i}
            className="font-sans text-base text-text-primary"
            style={{ lineHeight: 26 }}
          >
            {sentence}
          </Text>
        ))}

        <Photo
          source={require('../../../assets/about/real-cockroach.png')}
          height={COCKROACH_HEIGHT}
          caption={copy.cockroachCaption}
        />

        {copy.p2.map((sentence, i) => (
          <Text
            key={i}
            className="font-sans text-base text-text-primary"
            style={{ lineHeight: 26 }}
          >
            {sentence}
          </Text>
        ))}

        <Photo
          source={require('../../../assets/about/real-cat.png')}
          height={CAT_HEIGHT}
          caption={copy.catCaption}
        />

        <Text
          className="font-sans text-base italic text-text-secondary"
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

        <View style={{ marginTop: 8 }}>
          <Photo
            source={require('../../../assets/about/real-cat-box.jpg')}
            height={CAT_BOX_HEIGHT}
            caption={copy.catBoxCaption}
          />
        </View>

        <View className="pt-8">
          <Button label={copy.startLabel} variant="primary" onPress={() => router.replace('/')} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
