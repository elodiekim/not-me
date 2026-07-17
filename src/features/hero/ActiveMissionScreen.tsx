import { useLocalSearchParams, useRouter } from 'expo-router';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, LoadingIndicator, MissionCard } from '../../components/ui';
import { useMission } from '../../hooks/useMission';
import { useUpdateMissionStatus } from '../../hooks/useUpdateMissionStatus';
import { getCategoryInfo } from '../../constants/categoryInfo';
import { LocationCard } from './components/LocationCard';
import { MissionNotFound } from './components/MissionNotFound';

export function ActiveMissionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: mission, isLoading, isError, refetch } = useMission(id);
  const updateStatus = useUpdateMissionStatus();

  if (isLoading) {
    return <LoadingIndicator message="Loading mission..." />;
  }

  if (isError || !mission) {
    return <MissionNotFound onRetry={refetch} />;
  }

  const category = getCategoryInfo(mission.category);
  const arrived = mission.status === 'arrived';

  const handleArrived = () => {
    updateStatus.mutate({ missionId: mission.id, status: 'arrived' });
  };

  const handleComplete = async () => {
    await updateStatus.mutateAsync({ missionId: mission.id, status: 'completed' });
    router.replace({ pathname: '/hero/reward', params: { amount: String(mission.rewardAmount) } });
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="px-6 py-4">
        <Text className="text-lg font-sans-semibold text-text-primary">Active Mission</Text>
      </View>
      <View className="flex-1 gap-8 px-6">
        <MissionCard
          avatar={category.icon}
          title={mission.requesterName}
          subtitle={`${category.title} · ${category.koTitle}`}
          statusLabel={arrived ? 'Arrived' : 'On my way'}
          statusVariant={arrived ? 'success' : 'info'}
        />
        <LocationCard address={mission.address} />
      </View>
      <View className="px-6 pb-6">
        {arrived ? (
          <Button
            label="Complete Mission"
            variant="primary"
            loading={updateStatus.isPending}
            onPress={handleComplete}
          />
        ) : (
          <Button
            label="I've Arrived"
            variant="secondary"
            loading={updateStatus.isPending}
            onPress={handleArrived}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
