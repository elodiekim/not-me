import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Toast } from '../../components/ui';
import { BecomeHeroSection } from './components/BecomeHeroSection';
import { HeroSection } from './components/HeroSection';
import { HomeHeader } from './components/HomeHeader';

export function HomeScreen() {
  const router = useRouter();
  const { cancelled } = useLocalSearchParams<{ cancelled?: string }>();
  // A single toast slot shared by every transient banner on Home (cancel confirmation,
  // bell "coming soon", etc). null = nothing showing. Only one shows at a time.
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // A cancel navigation arrives with ?cancelled=1. Show the toast once, then clear
  // the in-memory route param so re-entering Home (e.g. switching tabs and back)
  // doesn't re-fire it. setParams (not router.replace) is used on purpose: replace
  // would remount this screen and the toast would never render.
  useEffect(() => {
    if (cancelled !== '1') return;
    setToastMessage('Request cancelled · 요청이 취소됐어요');
    router.setParams({ cancelled: undefined });
  }, [cancelled, router]);

  const handleToastDismiss = useCallback(() => setToastMessage(null), []);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {/* Header-to-Hero keeps the original 32px gap (gap-8); only Hero-to-
          BecomeHero nudges slightly wider (36px) to rebalance against the
          Hero section's own content shrinking a bit shorter (tighter cat-to-
          button spacing). */}
      <ScrollView contentContainerStyle={{ padding: 24, gap: 36 }}>
        <View className="gap-8">
          <HomeHeader onBellPress={() => setToastMessage('Coming soon · 곧 만나요')} />
          <HeroSection />
        </View>
        <BecomeHeroSection onPress={() => router.push('/hero')} />
      </ScrollView>
      {toastMessage && <Toast message={toastMessage} onDismiss={handleToastDismiss} />}
    </SafeAreaView>
  );
}
