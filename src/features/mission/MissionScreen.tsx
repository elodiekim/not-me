import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, LoadingIndicator, MissionCard } from '../../components/ui';
import { CATEGORY_INFO } from '../../constants/categoryInfo';
import { useMission } from '../../hooks/useMission';
import { useUpdateMissionStatus } from '../../hooks/useUpdateMissionStatus';
import { isRequestStale } from '../../utils/missionExpiry';
import { StatusTimeline } from './components/StatusTimeline';

const STEP_BY_STATUS: Record<string, number> = {
  requested: 0,
  accepted: 1,
  on_the_way: 2,
  arrived: 2,
  completed: 3,
};

export function MissionScreen() {
  const router = useRouter();
  const { missionId } = useLocalSearchParams<{ missionId?: string }>();
  // Realtime pushes status changes instantly; this poll is only a safety net for
  // dropped sockets, so 30s is plenty (was 3s when polling was the primary path).
  const { data: mission, isLoading, isError } = useMission(missionId, { refetchInterval: 30000 });
  const { mutate: updateStatusMutate } = useUpdateMissionStatus();

  // Opportunistic expiry: no server cron, so a stale 'requested' mission only gets
  // cancelled once someone looks at it — here, whenever this screen loads/polls.
  // The 3s poll above then picks up the resulting 'cancelled' status.
  useEffect(() => {
    if (mission && mission.status === 'requested' && isRequestStale(mission.createdAt)) {
      updateStatusMutate({ missionId: mission.id, status: 'cancelled', fromStatus: 'requested' });
    }
  }, [mission, updateStatusMutate]);

  if (isLoading) {
    return <LoadingIndicator message="Loading mission..." />;
  }

  if (isError || !mission) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center gap-2 bg-background px-6" edges={['top']}>
        <Text className="text-sm text-text-secondary">
          Something went wrong.{'\n'}Please try again.
        </Text>
      </SafeAreaView>
    );
  }

  const category = CATEGORY_INFO[mission.category];
  const isCompleted = mission.status === 'completed';
  const isCancelled = mission.status === 'cancelled';

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="px-6 py-4">
        <Text className="text-lg font-sans-semibold text-text-primary">Mission Status</Text>
      </View>
      <View className="flex-1 gap-8 px-6">
        <MissionCard
          avatar={category.icon}
          title={
            isCancelled
              ? 'Request cancelled'
              : mission.heroName
                ? `${mission.heroName} is on the way`
                : 'Looking for your hero'
          }
          subtitle={`${category.title} · ${category.koTitle} · $${mission.rewardAmount}`}
          statusLabel={isCancelled ? 'Cancelled · 취소됨' : isCompleted ? 'Completed' : 'On the way'}
          statusVariant={isCancelled ? 'neutral' : isCompleted ? 'success' : 'info'}
          rating={mission.heroRating ?? undefined}
          reviewCount={mission.heroReviewCount}
        />

        <Text className="font-sans text-center text-sm text-text-secondary">
          {isCancelled
            ? 'This request was cancelled.\n요청이 취소됐어요.'
            : isCompleted
              ? 'Your hero finished the mission.\n미션이 완료됐어요.'
              : 'Your hero is on the way.\n히어로가 오고 있어요.'}
        </Text>

        {!isCancelled && <StatusTimeline currentStep={STEP_BY_STATUS[mission.status] ?? 0} />}
      </View>
      <View className="px-6 pb-6">
        {isCancelled ? (
          <Button label="Back to Home" variant="secondary" onPress={() => router.replace('/')} />
        ) : (
          <Button
            label={isCompleted ? 'Leave a Review' : 'Waiting for completion...'}
            variant={isCompleted ? 'primary' : 'secondary'}
            disabled={!isCompleted}
            onPress={() => router.replace({ pathname: '/complete', params: { missionId: mission.id } })}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
