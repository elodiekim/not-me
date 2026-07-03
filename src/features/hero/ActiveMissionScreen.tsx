import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, MissionCard } from '../../components/ui';
import { NEARBY_MISSIONS } from './data/nearbyMissions';

export function ActiveMissionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [arrived, setArrived] = useState(false);
  const mission = NEARBY_MISSIONS.find((item) => item.id === id);

  if (!mission) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <Text className="text-text-secondary">Mission not found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="px-6 py-4">
        <Text className="text-lg font-sans-semibold text-text-primary">Active Mission</Text>
      </View>
      <View className="flex-1 gap-8 px-6">
        <MissionCard
          avatar={mission.icon}
          title={mission.requesterName}
          subtitle={`${mission.title} · ${mission.koTitle}`}
          statusLabel={arrived ? 'Arrived' : 'On my way'}
          statusVariant={arrived ? 'success' : 'info'}
        />
        <View className="gap-1 rounded-card bg-surface p-4">
          <Text className="text-xs text-text-secondary">Location · 위치</Text>
          <Text className="text-base font-sans-semibold text-text-primary">{mission.address}</Text>
          <Text className="text-sm text-text-secondary">{mission.koAddress}</Text>
        </View>
      </View>
      <View className="px-6 pb-6">
        {arrived ? (
          <Button
            label="Complete Mission"
            variant="primary"
            onPress={() =>
              router.replace({ pathname: '/hero/reward', params: { amount: String(mission.reward) } })
            }
          />
        ) : (
          <Button label="I've Arrived" variant="secondary" onPress={() => setArrived(true)} />
        )}
      </View>
    </SafeAreaView>
  );
}
