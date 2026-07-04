import { useRouter } from 'expo-router';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BecomeHeroSection } from './components/BecomeHeroSection';
import { HeroSection } from './components/HeroSection';
import { HomeHeader } from './components/HomeHeader';

export function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 24, gap: 32 }}>
        <HomeHeader />
        <HeroSection />
        <BecomeHeroSection onPress={() => router.push('/hero')} />
      </ScrollView>
    </SafeAreaView>
  );
}
