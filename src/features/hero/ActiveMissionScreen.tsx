import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, LoadingIndicator, MissionCard } from '../../components/ui';
import { useCancelAcceptedMission } from '../../hooks/useCancelAcceptedMission';
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
  const cancelMission = useCancelAcceptedMission();
  const [cancelError, setCancelError] = useState<string | null>(null);

  if (isLoading) {
    return <LoadingIndicator message="Loading mission..." />;
  }

  if (isError || !mission) {
    return <MissionNotFound onRetry={refetch} />;
  }

  const category = getCategoryInfo(mission.category);
  const onTheWay = mission.status === 'on_the_way';
  const arrived = mission.status === 'arrived';

  const handleOnTheWay = () => {
    updateStatus.mutate({ missionId: mission.id, status: 'on_the_way', fromStatus: 'accepted' });
  };

  const handleArrived = () => {
    updateStatus.mutate({ missionId: mission.id, status: 'arrived', fromStatus: 'on_the_way' });
  };

  const handleComplete = async () => {
    await updateStatus.mutateAsync({
      missionId: mission.id,
      status: 'completed',
      fromStatus: 'arrived',
    });
    router.replace({ pathname: '/hero/reward', params: { amount: String(mission.rewardAmount) } });
  };

  const handleCancel = async () => {
    setCancelError(null);
    try {
      await cancelMission.mutateAsync(mission.id);
      router.replace('/');
    } catch {
      setCancelError('Something went wrong. Please try again.\n문제가 발생했어요. 다시 시도해주세요.');
    }
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
          statusLabel={arrived ? 'Arrived' : onTheWay ? 'On my way' : 'Accepted'}
          statusVariant={arrived ? 'success' : 'info'}
        />
        <LocationCard address={mission.address} />
      </View>
      <View className="gap-3 px-6 pb-6">
        {cancelError && (
          <Text className="text-center text-sm text-danger">{cancelError}</Text>
        )}
        {arrived ? (
          <Button
            label="Complete Mission"
            variant="primary"
            loading={updateStatus.isPending}
            onPress={handleComplete}
          />
        ) : onTheWay ? (
          <Button
            label="I've Arrived"
            variant="secondary"
            loading={updateStatus.isPending}
            onPress={handleArrived}
          />
        ) : (
          <Button
            label="On my way · 이동중이에요"
            variant="secondary"
            loading={updateStatus.isPending}
            onPress={handleOnTheWay}
          />
        )}
        <Button
          label="Cancel · 취소할게요"
          variant="ghost"
          loading={cancelMission.isPending}
          disabled={updateStatus.isPending || cancelMission.isPending}
          onPress={handleCancel}
        />
      </View>
    </SafeAreaView>
  );
}
