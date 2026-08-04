import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/ui';
import { parseLang, type AboutLang } from './lang';

// Single scrollable read, not a multi-tap flow — this is a personal story,
// not a tutorial. Short fragments (not full sentences) for reading comfort,
// with the two real photos placed right where they belong in the story
// instead of on their own screens. No animations (DESIGN.md excludes them
// here). Hero Cat stays out of this flow — celebrate-cat carries the
// "mascot inspired by my cat" beat at the end.
type Block =
  | { kind: 'p'; text: string; emphasis?: boolean }
  | { kind: 'divider' }
  | { kind: 'quote'; text: string }
  | { kind: 'photo'; source: number; ratio: number; caption: string }
  | { kind: 'highlight'; text: string };

const STORY: Record<AboutLang, Block[]> = {
  en: [
    { kind: 'p', text: 'One day,' },
    { kind: 'p', text: 'a cockroach appeared in my apartment.' },
    { kind: 'p', text: "I couldn't kill it." },
    {
      kind: 'p',
      text: 'I stood there for almost an hour,\nwaiting for a friend to come and rescue me.',
    },
    {
      kind: 'photo',
      source: require('../../../assets/about/real-cockroach.png'),
      ratio: 1086 / 1448,
      caption: 'The actual cockroach.',
    },
    { kind: 'divider' },
    { kind: 'p', text: 'Meanwhile,' },
    { kind: 'p', text: 'my cat sat right underneath it,' },
    { kind: 'p', text: 'meowing —\nit wanted to catch it.' },
    { kind: 'p', text: 'I was terrified,', emphasis: true },
    { kind: 'p', text: 'my cat was ready.', emphasis: true },
    {
      kind: 'photo',
      source: require('../../../assets/about/real-cat.png'),
      ratio: 1122 / 1402,
      caption: 'He really wanted to catch it.',
    },
    { kind: 'divider' },
    { kind: 'quote', text: '💭 "Please...\ndon\'t run away..."' },
    { kind: 'divider' },
    { kind: 'p', text: 'That day, I had one thought:' },
    { kind: 'highlight', text: '"There should be\nan app for this."' },
  ],
  kr: [
    { kind: 'p', text: '어느 날,' },
    { kind: 'p', text: '집에 바퀴벌레가 나타났습니다.' },
    { kind: 'p', text: '저는 잡을 용기가 나지 않았습니다.' },
    { kind: 'p', text: '친구가 올 때까지\n거의 한 시간을\n그 자리에서 서 있었습니다.' },
    {
      kind: 'photo',
      source: require('../../../assets/about/real-cockroach.png'),
      ratio: 1086 / 1448,
      caption: '실제 그 바퀴벌레입니다.',
    },
    { kind: 'divider' },
    { kind: 'p', text: '그런데 아래를 보니' },
    { kind: 'p', text: '우리 집 고양이는' },
    { kind: 'p', text: '계속 잡고 싶다고\n야옹거리고 있었습니다.' },
    { kind: 'p', text: '저는 무서웠고,', emphasis: true },
    { kind: 'p', text: '고양이는 준비되어 있었습니다.', emphasis: true },
    {
      kind: 'photo',
      source: require('../../../assets/about/real-cat.png'),
      ratio: 1122 / 1402,
      caption: '계속 잡고 싶어했던 우리 집 고양이.',
    },
    { kind: 'divider' },
    { kind: 'quote', text: '💭 "제발...\n도망가지 마..."' },
    { kind: 'divider' },
    { kind: 'p', text: '그 순간 생각했습니다.' },
    { kind: 'highlight', text: '"이런 것도 대신\n도와주는 앱이\n있으면 좋지 않을까?"' },
  ],
};

const COPY: Record<AboutLang, { bornLead: string; bornTrail: string; startLabel: string }> = {
  en: { bornLead: "That's how", bornTrail: 'was born.', startLabel: 'Start Using NotMe' },
  kr: { bornLead: '그렇게', bornTrail: '가\n시작되었습니다.', startLabel: 'NotMe 시작하기' },
};

function Divider() {
  return <View className="self-center bg-text-disabled" style={{ width: 32, height: 1 }} />;
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
        <View className="items-center gap-3 pb-4">
          <Image
            source={require('../../../assets/logo/brand-logo.png')}
            style={{ width: 96, height: 32 }}
            resizeMode="contain"
          />
          <View className="items-center gap-1">
            <Text className="text-center text-3xl font-sans-bold text-text-primary">
              How NotMe Started
            </Text>
            <Text className="text-center text-base text-text-secondary">이 앱을 만든 이유</Text>
          </View>
          <Image
            source={require('../../../assets/characters/proud-cat.png')}
            style={{ width: 112, height: 112 }}
            resizeMode="contain"
          />
        </View>

        <View className="gap-5">
          {STORY[lang].map((block, index) => {
            if (block.kind === 'divider') {
              return <Divider key={index} />;
            }
            if (block.kind === 'photo') {
              return (
                <View key={index} className="items-center gap-3">
                  <Image
                    source={block.source}
                    style={{ width: 220, aspectRatio: block.ratio, borderRadius: 20 }}
                    resizeMode="contain"
                  />
                  <Text className="text-center font-sans text-sm text-text-secondary">
                    {block.caption}
                  </Text>
                </View>
              );
            }
            if (block.kind === 'quote') {
              return (
                <Text
                  key={index}
                  className="text-center font-sans text-base italic text-text-secondary"
                  style={{ lineHeight: 24 }}
                >
                  {block.text}
                </Text>
              );
            }
            if (block.kind === 'highlight') {
              return (
                <View
                  key={index}
                  className="items-center self-center rounded-2xl bg-primary px-5 py-4"
                  style={{ transform: [{ rotate: '-1deg' }] }}
                >
                  <Text
                    className="text-center text-xl font-sans-bold text-text-primary"
                    style={{ lineHeight: 28 }}
                  >
                    {block.text}
                  </Text>
                </View>
              );
            }
            return (
              <Text
                key={index}
                className={
                  block.emphasis
                    ? 'text-center font-sans-semibold text-lg text-text-primary'
                    : 'text-center font-sans text-base text-text-primary'
                }
                style={{ lineHeight: block.emphasis ? 26 : 24 }}
              >
                {block.text}
              </Text>
            );
          })}

          <View className="items-center gap-1 pt-2">
            <Text className="text-center text-lg text-text-primary">{copy.bornLead}</Text>
            <View className="flex-row items-center">
              <Image
                source={require('../../../assets/logo/brand-logo.png')}
                style={{ width: 80, height: 27 }}
                resizeMode="contain"
              />
              {lang === 'kr' && (
                <Text className="text-lg text-text-primary">{copy.bornTrail.slice(0, 1)}</Text>
              )}
            </View>
            <Text className="text-center text-lg text-text-primary">
              {lang === 'kr' ? copy.bornTrail.slice(2) : copy.bornTrail}
            </Text>
          </View>

          <Image
            source={require('../../../assets/characters/celebrate-cat.png')}
            style={{ width: 110, height: 110, alignSelf: 'center' }}
            resizeMode="contain"
          />
        </View>

        <View className="pt-6">
          <Button
            label={copy.startLabel}
            variant="primary"
            onPress={() => router.replace('/')}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
