import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Image, Keyboard, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Input, LoadingIndicator, Toast } from '../../components/ui';
import { COLORS } from '../../constants/colors';
import { useMission } from '../../hooks/useMission';
import { useSubmitReview } from '../../hooks/useSubmitReview';
import { StarRating } from './components/StarRating';

// Easter egg — see DESIGN.md's "Easter Egg: Fake Pest Control Ad". Styled to
// read as an actual native-ad unit (logo badge + name + fake rating
// + CTA button), not just a text card — the previous version didn't look like
// an ad at all, just a quote block. Every Text below deliberately skips the
// app's own font-sans* classes (Poppins) and uses plain font-bold/font-semibold
// instead, falling back to the platform default typeface — the app's own type
// nowhere else does this, so it reads as "not designed by us" at a glance,
// same reasoning as the off-brand blue CTA.
//
// One accent color (info blue) for everything foreign-brand-colored — the
// first pass scattered red (logo badge) + yellow (star emoji) + blue (CTA)
// and read as busy/garish rather than "a different but coherent brand."
function FakeAd({ onPress, large }: { onPress: () => void; large?: boolean }) {
  // Quick panicked shake before the joke toast lands — the bug "knows" it's
  // about to get exterminated. Plain Animated.View + inline style only, no
  // className (see the fix in StatusTimeline/MissionCompleteScreen for why).
  const shake = useRef(new Animated.Value(0)).current;

  const handlePress = () => {
    shake.setValue(0);
    Animated.sequence([
      Animated.timing(shake, { toValue: 1, duration: 60, useNativeDriver: true }),
      Animated.timing(shake, { toValue: -1, duration: 60, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 1, duration: 60, useNativeDriver: true }),
      Animated.timing(shake, { toValue: -1, duration: 60, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
    onPress();
  };

  return (
    <Pressable onPress={handlePress} className="rounded-card bg-surface p-5">
      <View className="flex-row items-center gap-3">
        <View className="h-12 w-12 items-center justify-center rounded-xl bg-background">
          <Animated.View
            style={{
              transform: [
                { translateX: shake.interpolate({ inputRange: [-1, 1], outputRange: [-4, 4] }) },
              ],
            }}
          >
            <Image
              source={require('../../../assets/bugs/cockroach.png')}
              style={{ width: 34, height: 34 }}
              resizeMode="contain"
            />
          </Animated.View>
          {/* Universal "no pests" prohibition sign (red is load-bearing here —
              it's what makes the symbol instantly readable — so it's the one
              deliberate exception to the single-accent-color rule below). */}
          <View
            pointerEvents="none"
            className="absolute items-center justify-center rounded-full border-2 border-danger"
            style={{ width: 38, height: 38 }}
          >
            <View
              className="absolute bg-danger"
              style={{ width: 42, height: 2.5, transform: [{ rotate: '45deg' }] }}
            />
          </View>
        </View>
        <View className="flex-1">
          <Text className="text-sm font-semibold text-text-primary">Segfault Pest Control</Text>
          <View className="flex-row items-center gap-1">
            <Ionicons name="star" size={11} color={COLORS.info} />
            <Text className="text-xs text-text-secondary">4.9 · 10K+ exterminated</Text>
          </View>
        </View>
        <Text className="rounded-full bg-text-disabled px-2 py-0.5 text-[10px] font-semibold text-background">
          Ad
        </Text>
      </View>

      {/* Left-aligned, matching the header row above — full center-alignment
          read as a generic "quote card" rather than ad copy. */}
      <Text className="mt-4 text-xs text-text-secondary">Need a permanent solution?</Text>
      <Text className={`mt-1 font-bold text-text-primary ${large ? 'text-5xl' : 'text-3xl'}`}>
        404 Bugs
      </Text>
      <Text className="mt-1 text-xs text-text-disabled">
        The bug you&apos;re looking for cannot be found.
      </Text>

      {/* Deliberately not bg-primary — the CTA should look like a foreign ad
          network's button, not one of NotMe's own, so the clash reads as "an
          ad" rather than "an in-app action." */}
      <View className="mt-4 items-center rounded-button bg-info px-6 py-3">
        <Text className="text-sm font-semibold text-background">Get Protected →</Text>
      </View>
    </Pressable>
  );
}

// Full-screen, shown right after Submit/Not now, before actually leaving for
// Home — mimics the real "ad right after you finish the thing" dark pattern
// more directly than a card sitting inside the review form would.
function AdInterstitial({ onContinue }: { onContinue: () => void }) {
  const [showToast, setShowToast] = useState(false);
  // The forced wait is the specific dark pattern being parodied — a static
  // "Skip" label wouldn't land the joke the same way a real (if token) delay does.
  const [secondsLeft, setSecondsLeft] = useState(3);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="flex-row justify-end px-4 pt-2">
        <Pressable
          onPress={onContinue}
          disabled={secondsLeft > 0}
          accessibilityRole="button"
          accessibilityLabel="Skip ad"
          className="rounded-full bg-surface px-3 py-1.5"
        >
          <Text className="text-xs font-semibold text-text-secondary">
            {secondsLeft > 0 ? `Skip in ${secondsLeft}s` : 'Skip ✕'}
          </Text>
        </Pressable>
      </View>
      <View className="flex-1 justify-center gap-3 px-6">
        {/* ml-5 matches FakeAd's own p-5 — aligning with the card's outer edge
            instead looked off because the rounded corner visually recedes
            there; the card's actual content (the logo) starts p-5 in. */}
        <Text className="ml-5 text-xs font-sans-semibold uppercase tracking-wide text-text-disabled">
          Sponsored
        </Text>
        <FakeAd onPress={() => setShowToast(true)} large />
      </View>
      <View className="px-6 pb-6">
        <Button label="Continue to NotMe" variant="primary" onPress={onContinue} />
      </View>
      {showToast && (
        <Toast message="장난이에요, 광고 없어요 🐱" onDismiss={() => setShowToast(false)} />
      )}
    </SafeAreaView>
  );
}

export function CompleteScreen() {
  const router = useRouter();
  const { missionId } = useLocalSearchParams<{ missionId?: string }>();
  const { data: mission, isLoading, isError, refetch } = useMission(missionId);
  const submitReview = useSubmitReview();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showAdInterstitial, setShowAdInterstitial] = useState(false);

  // Direct/repeat entry to an already-reviewed mission (e.g. a stale link or
  // back-navigation) would otherwise show the form again and hit the DB's
  // one-review-per-mission constraint on submit, stuck behind a generic error.
  // Guarded on !showAdInterstitial: submitReview's own onSuccess invalidates
  // the mission query, so hasReview flips true right after a real submit too
  // — without this guard, that refetch raced this effect and bounced straight
  // home before the ad interstitial ever got a chance to show.
  useEffect(() => {
    if (mission?.hasReview && !showAdInterstitial) {
      router.replace('/');
    }
  }, [mission, router, showAdInterstitial]);

  if (isLoading || (mission?.hasReview && !showAdInterstitial)) {
    return <LoadingIndicator message="Loading mission..." />;
  }

  // Without this, a failed fetch fell through to the form below with a silently
  // disabled Submit button (mission?.heroId guard) and no explanation why.
  if (isError || !mission) {
    return (
      <SafeAreaView
        className="flex-1 items-center justify-center gap-4 bg-background px-6"
        edges={['top']}
      >
        <Text className="text-sm text-text-secondary">
          Something went wrong.{'\n'}Please try again.
        </Text>
        <Button label="Try Again" variant="secondary" onPress={() => refetch()} />
      </SafeAreaView>
    );
  }

  const handleSubmit = async () => {
    if (!mission?.heroId) return;
    setError(null);

    try {
      await submitReview.mutateAsync({
        missionId: mission.id,
        heroId: mission.heroId,
        rating,
        comment,
      });
      setShowAdInterstitial(true);
    } catch {
      setError('Something went wrong. Please try again.');
    }
  };

  if (showAdInterstitial) {
    return <AdInterstitial onContinue={() => router.replace('/')} />;
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <Pressable className="flex-1" onPress={Keyboard.dismiss} accessible={false}>
        <View className="flex-1 gap-8 px-6 pt-8">
          <View className="items-center gap-3">
            <Image
              source={require('../../../assets/characters/proud-cat.png')}
              style={{ width: 140, height: 140 }}
              resizeMode="contain"
            />
            <Text className="text-2xl font-sans-bold text-text-primary">Mission Complete!</Text>
            <Text className="font-sans text-center text-sm text-text-secondary">
              바퀴벌레 문제 해결 완료!{'\n'}Thanks for using NotMe.
            </Text>
          </View>

          <View className="gap-4">
            <Text className="text-center text-base font-sans-semibold text-text-primary">
              How was your Hero?
            </Text>
            <StarRating rating={rating} onChange={setRating} />
            <Input
              placeholder="Leave a comment (optional)"
              value={comment}
              onChangeText={setComment}
              multiline
            />
            {error && <Text className="text-center text-sm text-danger">{error}</Text>}
          </View>
        </View>

        <View className="gap-3 px-6 pb-6">
          <Button
            label="Submit Review"
            variant="primary"
            loading={submitReview.isPending}
            disabled={rating === 0 || submitReview.isPending || !mission?.heroId}
            onPress={handleSubmit}
          />
          <Button
            label="Not now · 나중에 할게요"
            variant="ghost"
            onPress={() => setShowAdInterstitial(true)}
          />
        </View>
      </Pressable>
    </SafeAreaView>
  );
}
