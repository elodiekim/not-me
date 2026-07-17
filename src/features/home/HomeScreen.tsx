import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Toast } from '../../components/ui';
import { BecomeHeroSection } from './components/BecomeHeroSection';
import { HeroSection } from './components/HeroSection';
import { HomeHeader } from './components/HomeHeader';

export function HomeScreen() {
  const router = useRouter();
  const { cancelled } = useLocalSearchParams<{ cancelled?: string }>();
  const [showCancelToast, setShowCancelToast] = useState(false);

  // A cancel navigation arrives with ?cancelled=1. Show the toast once, then clear
  // the in-memory route param so re-entering Home (e.g. switching tabs and back)
  // doesn't re-fire it. setParams (not router.replace) is used on purpose: replace
  // would remount this screen and the toast would never render.
  useEffect(() => {
    if (cancelled !== '1') return;
    setShowCancelToast(true);
    router.setParams({ cancelled: undefined });
  }, [cancelled, router]);

  const handleToastDismiss = useCallback(() => setShowCancelToast(false), []);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 24, gap: 32 }}>
        <HomeHeader />
        <HeroSection />
        <BecomeHeroSection onPress={() => router.push('/hero')} />
      </ScrollView>
      {showCancelToast && (
        <Toast message="Request cancelled · 요청이 취소됐어요" onDismiss={handleToastDismiss} />
      )}
    </SafeAreaView>
  );
}
