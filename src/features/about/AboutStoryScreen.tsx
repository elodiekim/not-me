import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/ui';
import { COLORS } from '../../constants/colors';
import { parseLang } from './lang';

// Rebuilt per about-notme/others.PNG: one short beat per step (not a long
// scroll), step badge + progress dots + Continue, matching the reference's
// 4-page structure. Step 1 is a distinct "cover" layout (left-aligned);
// steps 2-4 are centered. No animations (DESIGN.md excludes them here).
const STEP_COUNT = 4;

const COPY = {
  en: {
    step1: {
      title: 'How NotMe Started',
      lead: 'One day,',
      body: 'a cockroach appeared in my apartment.',
    },
    step2: {
      headingBold: 'I stood there',
      headingRegular: 'for almost one hour.',
      caption: 'Waiting for a friend to come and rescue me.',
    },
    step3: {
      heading: ['Meanwhile,', 'my cat was ready.'],
      bubble: 'He wanted to catch it.',
    },
    step4: {
      lead: ['That day,', 'I had one thought:'],
      quote: '"There should be\nan app for this."',
      bornLead: "That's how",
      bornTrail: 'was born.',
    },
    continueLabel: 'Continue',
    startLabel: 'Start Using NotMe',
  },
  kr: {
    step1: {
      title: '이 앱을 만든 이유',
      lead: '어느 날,',
      body: '집에 바퀴벌레가 나타났습니다.',
    },
    step2: {
      headingBold: '저는 그 자리에 서서',
      headingRegular: '거의 한 시간을\n보냈습니다.',
      caption: '친구가 와서\n도와주기만을 기다렸습니다.',
    },
    step3: {
      heading: ['그런데 아래를 보니', '우리 집 고양이는', '준비되어 있었습니다.'],
      bubble: '계속 잡고 싶다고\n아옹거리고 있었어요.',
    },
    step4: {
      lead: ['그 순간', '생각했습니다:'],
      quote: '"이런 것도 대신 도와주는\n앱이 있으면 좋지 않을까?"',
      bornLead: '그렇게',
      bornTrail: '가\n시작되었습니다.',
    },
    continueLabel: '계속하기',
    startLabel: 'NotMe 시작하기',
  },
} as const;

function StepBadge({ step }: { step: number }) {
  return (
    <View className="items-center justify-center rounded-full bg-primary" style={{ width: 32, height: 32 }}>
      <Text className="font-sans-bold text-base text-text-primary">{step}</Text>
    </View>
  );
}

function ProgressDots({ activeIndex }: { activeIndex: number }) {
  return (
    <View className="flex-row items-center justify-center gap-2">
      {Array.from({ length: STEP_COUNT }).map((_, i) => (
        <View
          key={i}
          className={i === activeIndex ? 'rounded-full bg-primary' : 'rounded-full bg-surface'}
          style={{ width: i === activeIndex ? 24 : 8, height: 8 }}
        />
      ))}
    </View>
  );
}

function CoverStep({ lang }: { lang: 'en' | 'kr' }) {
  const copy = COPY[lang].step1;
  return (
    <View className="gap-6">
      <Image
        source={require('../../../assets/logo/brand-logo.png')}
        style={{ width: 120, height: 40, alignSelf: 'center' }}
        resizeMode="contain"
      />
      <Text className="text-4xl font-sans-bold text-text-primary" style={{ lineHeight: 44 }}>
        {copy.title}
      </Text>
      <Image
        source={require('../../../assets/characters/proud-cat.png')}
        style={{ width: 140, height: 140, alignSelf: 'center' }}
        resizeMode="contain"
      />
      <View className="flex-row items-start gap-4">
        <StepBadge step={1} />
        <View className="flex-1 gap-1 pt-1">
          <Text className="text-lg font-sans-bold text-text-primary">{copy.lead}</Text>
          <Text className="text-lg text-text-primary" style={{ lineHeight: 24 }}>
            {copy.body}
          </Text>
        </View>
      </View>
    </View>
  );
}

function PhotoStep({ lang }: { lang: 'en' | 'kr' }) {
  const copy = COPY[lang].step2;
  return (
    <View className="items-center gap-6">
      <StepBadge step={2} />
      <View className="items-center">
        <Text className="text-center text-2xl font-sans-bold text-text-primary">
          {copy.headingBold}
        </Text>
        <Text
          className="text-center text-2xl text-text-primary"
          style={{ lineHeight: 30 }}
        >
          {copy.headingRegular}
        </Text>
      </View>
      <Image
        source={require('../../../assets/about/real-cockroach.png')}
        // Full original photo, just scaled down — not cropped/zoomed.
        style={{ width: 240, aspectRatio: 1086 / 1448, borderRadius: 24, alignSelf: 'center' }}
        resizeMode="contain"
      />
      <View className="flex-row items-start justify-center gap-2 px-4">
        <Feather name="clock" size={16} color={COLORS.textSecondary} style={{ marginTop: 2 }} />
        <Text className="flex-1 text-center font-sans text-sm text-text-secondary">
          {copy.caption}
        </Text>
      </View>
    </View>
  );
}

function PhotoQuoteStep({ lang }: { lang: 'en' | 'kr' }) {
  const copy = COPY[lang].step3;
  return (
    <View className="items-center gap-6">
      <StepBadge step={3} />
      <View className="items-center">
        {copy.heading.map((line, i) => (
          <Text key={i} className="text-center text-2xl font-sans-bold text-text-primary">
            {line}
          </Text>
        ))}
      </View>
      <View style={{ alignSelf: 'center' }}>
        <Image
          source={require('../../../assets/about/real-cat.png')}
          // Full original photo, just scaled down — not cropped/zoomed.
          style={{ width: 240, aspectRatio: 1122 / 1402, borderRadius: 24 }}
          resizeMode="contain"
        />
        <View
          className="absolute rounded-input border bg-background px-4 py-3"
          style={{ borderColor: COLORS.surface, left: 16, bottom: -28, maxWidth: '80%' }}
        >
          <View className="flex-row items-start gap-2">
            <Feather name="heart" size={14} color={COLORS.primary} style={{ marginTop: 2 }} />
            <Text className="flex-1 font-sans text-sm text-text-primary">{copy.bubble}</Text>
          </View>
        </View>
      </View>
      <Image
        source={require('../../../assets/characters/celebrate-cat.png')}
        style={{ width: 96, height: 96, marginTop: 24 }}
        resizeMode="contain"
      />
    </View>
  );
}

function FinaleStep({ lang }: { lang: 'en' | 'kr' }) {
  const copy = COPY[lang].step4;
  return (
    <View className="items-center gap-6">
      <StepBadge step={4} />
      <View className="items-center">
        {copy.lead.map((line, i) => (
          <Text key={i} className="text-center text-lg text-text-primary">
            {line}
          </Text>
        ))}
      </View>
      <View
        className="items-center rounded-2xl bg-primary px-5 py-4"
        style={{ transform: [{ rotate: '-1deg' }] }}
      >
        <Text
          className="text-center text-xl font-sans-bold text-text-primary"
          style={{ lineHeight: 28 }}
        >
          {copy.quote}
        </Text>
      </View>
      <View className="bg-surface" style={{ width: 40, height: 1 }} />
      <View className="items-center gap-1">
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
        style={{ width: 110, height: 110 }}
        resizeMode="contain"
      />
    </View>
  );
}

export function AboutStoryScreen() {
  const router = useRouter();
  const { lang: langParam } = useLocalSearchParams<{ lang?: string }>();
  const lang = parseLang(langParam);
  const [step, setStep] = useState(0);
  const copy = COPY[lang];

  const handleBack = () => {
    if (step === 0) {
      router.back();
    } else {
      setStep(step - 1);
    }
  };

  const handleContinue = () => {
    if (step === STEP_COUNT - 1) {
      router.replace('/');
    } else {
      setStep(step + 1);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="flex-row items-center px-6 py-4">
        <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={handleBack}>
          <Feather name="arrow-left" size={24} color="#111111" />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24, flexGrow: 1 }}>
        <View className="flex-1 justify-center">
          {step === 0 && <CoverStep lang={lang} />}
          {step === 1 && <PhotoStep lang={lang} />}
          {step === 2 && <PhotoQuoteStep lang={lang} />}
          {step === 3 && <FinaleStep lang={lang} />}
        </View>
      </ScrollView>

      <View className="gap-4 px-6 pb-6 pt-2">
        <ProgressDots activeIndex={step} />
        <Button
          label={step === STEP_COUNT - 1 ? copy.startLabel : copy.continueLabel}
          variant="primary"
          onPress={handleContinue}
        />
      </View>
    </SafeAreaView>
  );
}
