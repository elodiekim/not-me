import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BecomeHeroSection } from './components/BecomeHeroSection';
import { HeroSection } from './components/HeroSection';
import { HomeHeader } from './components/HomeHeader';

export function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 24, gap: 32 }}>
        <HomeHeader />
        <HeroSection />
        <BecomeHeroSection />
      </ScrollView>
    </SafeAreaView>
  );
}
