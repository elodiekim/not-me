import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Image,
  ImageSourcePropType,
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/ui';
import { COLORS } from '../../constants/colors';
import { useOnboardingStore } from '../../stores/useOnboardingStore';

// Fixed box so wide illustrations can't overflow their slide (className sizing
// isn't reliably applied to Image on web).
const IMAGE_SIZE = 240;

// Pill indicator dimensions (matches the old w-2/w-6 h-2 Tailwind sizes).
const DOT_SIZE = 8;
const DOT_ACTIVE_WIDTH = 24;

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

const LAST_INDEX = SLIDES.length - 1;

export function OnboardingScreen() {
  // Measure the actual scroll area so slide width matches the viewport exactly
  // (window width can differ on web) and slides fill the height for vertical centering.
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [page, setPage] = useState(0);
  // Fluid interpolations are driven off the live scroll offset (Apple: feedback
  // must be continuous during the gesture, not a discrete swap at the 50% mark).
  // useNativeDriver is false because we animate width + backgroundColor.
  const scrollX = useRef(new Animated.Value(0)).current;
  // Reduced-motion users get discrete, page-keyed states instead of springy
  // interpolation (no vestibular motion), per prefers-reduced-motion.
  const [reduceMotion, setReduceMotion] = useState(false);
  const complete = useOnboardingStore((state) => state.complete);
  const isLastPage = page === LAST_INDEX;

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => sub.remove();
  }, []);

  const finish = async () => {
    await complete();
    router.replace('/sign-in');
  };

  const onLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setSize({ width, height });
  };

  // Animated.event feeds scrollX for the interpolations; the JS listener keeps
  // `page` in sync (used for a11y, the reduced-motion fallback, and Get Started).
  // onScroll (not onMomentumScrollEnd) so the page index tracks on web too.
  const onScroll = Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
    useNativeDriver: false,
    listener: (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (size.width === 0) return;
      const nextPage = Math.round(event.nativeEvent.contentOffset.x / size.width);
      if (nextPage !== page) {
        // A light "tick" at the moment a slide snaps into place (Apple §13:
        // causality — fire on the actual snap event). No-op on web.
        Haptics.selectionAsync();
        setPage(nextPage);
      }
    },
  });

  const measured = size.width > 0;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      <View className="h-12 flex-row items-center justify-end px-6">
        <Pressable accessibilityRole="button" accessibilityLabel="Skip" onPress={finish} hitSlop={12}>
          <Text className="text-base font-sans-medium text-text-secondary">Skip</Text>
        </Pressable>
      </View>

      <View className="flex-1" onLayout={onLayout}>
        {measured && (
          <Animated.ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={onScroll}
            scrollEventThrottle={16}
          >
            {SLIDES.map((slide, index) => (
              <View
                key={slide.subtitle}
                style={{ width: size.width, height: size.height }}
                className="items-center justify-center gap-8 px-6"
                accessible
                accessibilityLabel={`${slide.title}. ${slide.subtitle}. ${index + 1} of ${SLIDES.length}`}
              >
                <Image
                  source={slide.image}
                  style={{ width: IMAGE_SIZE, height: IMAGE_SIZE }}
                  resizeMode="contain"
                />
                <View className="items-center gap-2">
                  {/* Large display text wants negative tracking + tighter leading
                      (Apple typography): letters read too far apart as they grow. */}
                  <Text
                    className="text-center text-2xl font-sans-bold text-text-primary"
                    style={{ letterSpacing: -0.5, lineHeight: 30 }}
                  >
                    {slide.title}
                  </Text>
                  <Text className="text-center text-base text-text-secondary">{slide.subtitle}</Text>
                </View>
              </View>
            ))}
          </Animated.ScrollView>
        )}
      </View>

      <View className="gap-8 px-6 pb-4">
        <View className="flex-row items-center justify-center gap-2">
          {SLIDES.map((slide, index) => (
            <PageDot
              key={slide.subtitle}
              index={index}
              page={page}
              scrollX={scrollX}
              slideWidth={size.width}
              animate={measured && !reduceMotion}
            />
          ))}
        </View>

        <View className="h-14 justify-center">
          <GetStartedButton
            scrollX={scrollX}
            slideWidth={size.width}
            isLastPage={isLastPage}
            animate={measured && !reduceMotion}
            onPress={finish}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

// The active pill grows/colors continuously with the scroll offset so it tracks
// the finger mid-drag (and hints where you're heading) instead of snapping at 50%.
function PageDot({
  index,
  page,
  scrollX,
  slideWidth,
  animate,
}: {
  index: number;
  page: number;
  scrollX: Animated.Value;
  slideWidth: number;
  animate: boolean;
}) {
  if (!animate) {
    // Reduced-motion / pre-measure fallback: discrete active state.
    const active = index === page;
    return (
      <View
        style={{
          height: DOT_SIZE,
          width: active ? DOT_ACTIVE_WIDTH : DOT_SIZE,
          borderRadius: DOT_SIZE / 2,
          backgroundColor: active ? COLORS.primary : COLORS.textDisabled,
        }}
      />
    );
  }

  const inputRange = [(index - 1) * slideWidth, index * slideWidth, (index + 1) * slideWidth];
  const width = scrollX.interpolate({
    inputRange,
    outputRange: [DOT_SIZE, DOT_ACTIVE_WIDTH, DOT_SIZE],
    extrapolate: 'clamp',
  });
  const backgroundColor = scrollX.interpolate({
    inputRange,
    outputRange: [COLORS.textDisabled, COLORS.primary, COLORS.textDisabled],
    extrapolate: 'clamp',
  });

  return <Animated.View style={{ height: DOT_SIZE, width, borderRadius: DOT_SIZE / 2, backgroundColor }} />;
}

// Fades/rises in as the last slide approaches instead of popping into existence
// at the page boundary. Stays mounted; only the last page can actually press it.
function GetStartedButton({
  scrollX,
  slideWidth,
  isLastPage,
  animate,
  onPress,
}: {
  scrollX: Animated.Value;
  slideWidth: number;
  isLastPage: boolean;
  animate: boolean;
  onPress: () => void;
}) {
  if (!animate) {
    // Reduced-motion / pre-measure fallback: discrete mount on the last page.
    return isLastPage ? <Button label="Get Started" variant="primary" onPress={onPress} /> : null;
  }

  const inputRange = [(LAST_INDEX - 1) * slideWidth, LAST_INDEX * slideWidth];
  const opacity = scrollX.interpolate({ inputRange, outputRange: [0, 1], extrapolate: 'clamp' });
  const translateY = scrollX.interpolate({ inputRange, outputRange: [8, 0], extrapolate: 'clamp' });

  return (
    <Animated.View
      style={{ opacity, transform: [{ translateY }] }}
      pointerEvents={isLastPage ? 'auto' : 'none'}
    >
      <Button label="Get Started" variant="primary" onPress={onPress} />
    </Animated.View>
  );
}
