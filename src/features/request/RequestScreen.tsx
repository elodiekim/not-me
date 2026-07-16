import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LoadingIndicator } from '../../components/ui';
import { useActiveMission } from '../../hooks/useActiveMission';
import { MainMissionCard } from './components/MainMissionCard';
import { PromiseCard } from './components/PromiseCard';
import { WeirdProblemsSection } from './components/WeirdProblemsSection';

export function RequestScreen() {
  const router = useRouter();
  const { data: activeMission, isLoading } = useActiveMission();

  // One request at a time: if the user already has a mission in flight, send them
  // to it instead of letting them create a duplicate (only one category exists,
  // so a second request is almost always an accident).
  useEffect(() => {
    if (activeMission) {
      router.replace({ pathname: '/mission-status', params: { missionId: activeMission.id } });
    }
  }, [activeMission, router]);

  if (isLoading || activeMission) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background" edges={['top']}>
        <LoadingIndicator />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="flex-row items-center px-6 py-4">
        <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color="#111111" />
        </Pressable>
        <Text className="ml-4 text-lg font-sans-semibold text-text-primary">Request Help</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 24, gap: 32 }}>
        <MainMissionCard onPress={() => router.push('/reward')} />
        <WeirdProblemsSection />
        <PromiseCard />
      </ScrollView>
    </SafeAreaView>
  );
}
