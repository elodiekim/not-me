import { router } from 'expo-router';
import { useState } from 'react';
import {
  Image,
  ImageSourcePropType,
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/ui';
import { useOnboardingStore } from '../../stores/useOnboardingStore';

// Fixed box so wide illustrations can't overflow their slide (className sizing
// isn't reliably applied to Image on web).
const IMAGE_SIZE = 240;

interface Slide {
  image: ImageSourcePropType;
  title: string;
  subtitle: string;
}

const SLIDES: Slide[] = [
  {
    image: require('../../../assets/characters/bush-cockroach-cat.png'),
    title: 'Got a roach? Ask for help.',
    subtitle: '이상한 문제, 도움을 요청하세요',
  },
  {
    image: require('../../../assets/characters/hero-cat.png'),
    title: 'A nearby hero shows up.',
    subtitle: '근처 히어로가 도우러 와요',
  },
  {
    image: require('../../../assets/characters/proud-cat.png'),
    title: 'Reviews keep it trustworthy.',
    subtitle: '리뷰와 신뢰로 안전하게',
  },
];

export function OnboardingScreen() {
  // Measure the actual scroll area so slide width matches the viewport exactly
  // (window width can differ on web) and slides fill the height for vertical centering.
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [page, setPage] = useState(0);
  const complete = useOnboardingStore((state) => state.complete);
  const isLastPage = page === SLIDES.length - 1;

  const finish = async () => {
    await complete();
    router.replace('/sign-in');
  };

  const onLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setSize({ width, height });
  };

  // onScroll (not onMomentumScrollEnd) so the page index tracks on web too,
  // where momentum events don't fire.
  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (size.width === 0) return;
    const nextPage = Math.round(event.nativeEvent.contentOffset.x / size.width);
    if (nextPage !== page) {
      setPage(nextPage);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      <View className="h-12 flex-row items-center justify-end px-6">
        <Pressable accessibilityRole="button" accessibilityLabel="Skip" onPress={finish} hitSlop={12}>
          <Text className="text-base font-sans-medium text-text-secondary">Skip</Text>
        </Pressable>
      </View>

      <View className="flex-1" onLayout={onLayout}>
        {size.width > 0 && (
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={onScroll}
            scrollEventThrottle={16}
          >
            {SLIDES.map((slide) => (
              <View
                key={slide.subtitle}
                style={{ width: size.width, height: size.height }}
                className="items-center justify-center gap-8 px-6"
              >
                <Image
                  source={slide.image}
                  style={{ width: IMAGE_SIZE, height: IMAGE_SIZE }}
                  resizeMode="contain"
                />
                <View className="items-center gap-2">
                  <Text className="text-center text-2xl font-sans-bold text-text-primary">{slide.title}</Text>
                  <Text className="text-center text-base text-text-secondary">{slide.subtitle}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        )}
      </View>

      <View className="gap-8 px-6 pb-4">
        <View className="flex-row items-center justify-center gap-2">
          {SLIDES.map((slide, index) => (
            <View
              key={slide.subtitle}
              className={`h-2 rounded-full ${index === page ? 'w-6 bg-primary' : 'w-2 bg-text-disabled'}`}
            />
          ))}
        </View>

        <View className="h-14 justify-center">
          {isLastPage && <Button label="Get Started" variant="primary" onPress={finish} />}
        </View>
      </View>
    </SafeAreaView>
  );
}
