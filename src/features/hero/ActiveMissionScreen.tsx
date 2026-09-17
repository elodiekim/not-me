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
  // Shared by every action below (not just Cancel) — see handleComplete's comment
  // for why these can no longer be fire-and-forget.
  const [actionError, setActionError] = useState<string | null>(null);

  if (isLoading) {
    return <LoadingIndicator message="Loading mission..." />;
  }

  if (isError || !mission) {
    return <MissionNotFound onRetry={refetch} />;
  }

  const category = getCategoryInfo(mission.category);
  const onTheWay = mission.status === 'on_the_way';
  const arrived = mission.status === 'arrived';
  // The requester can cancel at any point up to completion, and useMission's
  // realtime subscription delivers that here — but without this the screen kept
  // showing "On my way", so a hero could keep travelling to a mission that no
  // longer exists. Terminal state with an exit rather than an auto-redirect: a
  // hero who may be mid-journey should get to read what happened.
  const isCancelled = mission.status === 'cancelled';

  const handleOnTheWay = async () => {
    setActionError(null);
    try {
      await updateStatus.mutateAsync({
        missionId: mission.id,
        status: 'on_the_way',
        fromStatus: 'accepted',
      });
    } catch {
      setActionError(
        "That didn't go through — check the mission's current status.\n반영되지 않았어요. 미션 상태를 확인해주세요.",
      );
    }
  };

  const handleArrived = async () => {
    setActionError(null);
    try {
      await updateStatus.mutateAsync({
        missionId: mission.id,
        status: 'arrived',
        fromStatus: 'on_the_way',
      });
    } catch {
      setActionError(
        "That didn't go through — check the mission's current status.\n반영되지 않았어요. 미션 상태를 확인해주세요.",
      );
    }
  };

  // await + try/catch instead of fire-and-forget: this used to navigate to the
  // reward screen unconditionally as soon as mutateAsync resolved, without
  // checking whether the update actually matched a row. If a back-out
  // (handleCancel below) landed on the same mission first — e.g. tapped right
  // before this, network order not guaranteed — this update would match 0 rows
  // and previously resolved with no error at all (see useUpdateMissionStatus),
  // so the hero still saw "You earned $X!" while the mission had actually
  // reverted to an open, unassigned request.
  const handleComplete = async () => {
    setActionError(null);
    try {
      await updateStatus.mutateAsync({
        missionId: mission.id,
        status: 'completed',
        fromStatus: 'arrived',
      });
      router.replace({
        pathname: '/hero/reward',
        params: { amount: String(mission.rewardAmount) },
      });
    } catch {
      setActionError(
        "That didn't go through — check the mission's current status.\n반영되지 않았어요. 미션 상태를 확인해주세요.",
      );
    }
  };

  const handleCancel = async () => {
    setActionError(null);
    try {
      await cancelMission.mutateAsync(mission.id);
      router.replace('/');
    } catch {
      setActionError(
        'Something went wrong. Please try again.\n문제가 발생했어요. 다시 시도해주세요.',
      );
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
          statusLabel={
            isCancelled ? 'Cancelled' : arrived ? 'Arrived' : onTheWay ? 'On my way' : 'Accepted'
          }
          statusVariant={isCancelled ? 'neutral' : arrived ? 'success' : 'info'}
        />
        {isCancelled ? (
          <Text className="text-center font-sans text-sm text-text-secondary">
            The requester cancelled this mission.{'\n'}요청자가 미션을 취소했어요.
          </Text>
        ) : (
          <LocationCard address={mission.address} />
        )}
      </View>
      <View className="gap-3 px-6 pb-6">
        {actionError && <Text className="text-center text-sm text-danger">{actionError}</Text>}
        {isCancelled ? (
          <Button label="Back to Home" variant="secondary" onPress={() => router.replace('/')} />
        ) : arrived ? (
          <Button
            label="Complete Mission"
            variant="primary"
            loading={updateStatus.isPending}
            disabled={updateStatus.isPending || cancelMission.isPending}
            onPress={handleComplete}
          />
        ) : onTheWay ? (
          <Button
            label="I've Arrived"
            variant="secondary"
            loading={updateStatus.isPending}
            disabled={updateStatus.isPending || cancelMission.isPending}
            onPress={handleArrived}
          />
        ) : (
          <Button
            label="On my way · 이동중이에요"
            variant="secondary"
            loading={updateStatus.isPending}
            disabled={updateStatus.isPending || cancelMission.isPending}
            onPress={handleOnTheWay}
          />
        )}
        {!isCancelled && (
          <Button
            label="Cancel · 취소할게요"
            variant="ghost"
            loading={cancelMission.isPending}
            disabled={updateStatus.isPending || cancelMission.isPending}
            onPress={handleCancel}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
