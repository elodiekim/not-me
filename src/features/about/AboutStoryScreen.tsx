import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/ui';
import { parseLang } from './lang';

// Same words as the DESIGN.md spec, restructured after design feedback: short
// Apple-style fragments (one beat per block) instead of full sentences/paragraphs,
// a couple of emphasized beats for rhythm, and the pull-quote inline instead of
// boxed in a card. \n inside a block's text is a tight in-block line break;
// separate blocks get the full paragraph gap.
type Block =
  | { kind: 'p'; text: string; emphasis?: boolean }
  | { kind: 'divider' }
  | { kind: 'quote'; text: string };

const STORY: Record<'en' | 'kr', Block[]> = {
  en: [
    { kind: 'p', text: 'One day,' },
    { kind: 'p', text: 'a cockroach appeared in my apartment.' },
    { kind: 'p', text: "I couldn't kill it." },
    {
      kind: 'p',
      text: 'I stood there for almost an hour,\nwaiting for a friend to come and rescue me.',
    },
    { kind: 'divider' },
    { kind: 'p', text: 'Meanwhile,' },
    { kind: 'p', text: 'my cat sat right underneath it,' },
    { kind: 'p', text: 'meowing —\nit wanted to catch it.' },
    { kind: 'divider' },
    { kind: 'p', text: 'I was terrified,', emphasis: true },
    { kind: 'p', text: 'my cat was ready.', emphasis: true },
    { kind: 'divider' },
    { kind: 'quote', text: '💭\n"Please...\ndon\'t run away..."' },
    { kind: 'divider' },
    { kind: 'p', text: 'That day, I had one thought:' },
    { kind: 'p', text: '"There should be\nan app for this."', emphasis: true },
  ],
  kr: [
    { kind: 'p', text: '어느 날,' },
    { kind: 'p', text: '집에 바퀴벌레가 나타났습니다.' },
    { kind: 'p', text: '저는 잡을 용기가 나지 않았습니다.' },
    { kind: 'p', text: '친구가 올 때까지\n거의 한 시간을\n그 자리에서 서 있었습니다.' },
    { kind: 'divider' },
    { kind: 'p', text: '그런데 아래를 보니' },
    { kind: 'p', text: '우리 집 고양이는' },
    { kind: 'p', text: '계속 잡고 싶다고\n야옹거리고 있었습니다.' },
    { kind: 'divider' },
    { kind: 'p', text: '저는 무서웠고,', emphasis: true },
    { kind: 'p', text: '고양이는 준비되어 있었습니다.', emphasis: true },
    { kind: 'divider' },
    { kind: 'quote', text: '💭\n"제발...\n도망가지 마..."' },
    { kind: 'divider' },
    { kind: 'p', text: '그 순간 생각했습니다.' },
    { kind: 'p', text: '"There should be\nan app for this."', emphasis: true },
  ],
};

const CONTINUE_LABEL: Record<'en' | 'kr', string> = { en: 'Continue', kr: '계속하기' };

function Divider() {
  return <View className="self-center bg-text-disabled" style={{ width: 32, height: 1 }} />;
}

export function AboutStoryScreen() {
  const router = useRouter();
  const { lang: langParam } = useLocalSearchParams<{ lang?: string }>();
  const lang = parseLang(langParam);

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

      <ScrollView contentContainerStyle={{ paddingHorizontal: 28, paddingBottom: 24, gap: 12 }}>
        {/* Title stays bilingual (English primary, Korean secondary) even though the
            body below is single-language — brand moment, not reading content. */}
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
        </View>

        <View className="pt-6">
          <Button
            label={CONTINUE_LABEL[lang]}
            variant="primary"
            onPress={() => router.push({ pathname: '/about/real-story', params: { lang } })}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
