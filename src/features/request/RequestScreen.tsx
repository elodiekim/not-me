import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MainMissionCard } from './components/MainMissionCard';
import { PromiseCard } from './components/PromiseCard';
import { WeirdProblemsSection } from './components/WeirdProblemsSection';

export function RequestScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="flex-row items-center px-6 py-4">
        <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color="#111111" />
        </Pressable>
        <Text className="ml-4 text-lg font-semibold text-text-primary">Request Help</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 24, gap: 32 }}>
        <MainMissionCard />
        <WeirdProblemsSection />
        <PromiseCard />
      </ScrollView>
    </SafeAreaView>
  );
}
