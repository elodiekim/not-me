import { useLocalSearchParams, useRouter } from 'expo-router';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, LoadingIndicator, MissionCard } from '../../components/ui';
import { CATEGORY_INFO } from '../../constants/categoryInfo';
import { useMission } from '../../hooks/useMission';
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
  const { missionId, amount } = useLocalSearchParams<{ missionId?: string; amount?: string }>();
  const { data: mission, isLoading, isError } = useMission(missionId, { refetchInterval: 3000 });

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

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="px-6 py-4">
        <Text className="text-lg font-sans-semibold text-text-primary">Mission Status</Text>
      </View>
      <View className="flex-1 gap-8 px-6">
        <MissionCard
          avatar={category.icon}
          title={mission.heroName ? `${mission.heroName} is on the way` : 'Looking for your hero'}
          subtitle={`${category.title} · ${category.koTitle} · $${mission.rewardAmount}`}
          statusLabel={isCompleted ? 'Completed' : 'On the way'}
          statusVariant={isCompleted ? 'success' : 'info'}
          rating={mission.heroRating ?? undefined}
          reviewCount={mission.heroReviewCount}
        />

        <Text className="font-sans text-center text-sm text-text-secondary">
          {isCompleted
            ? 'Your hero finished the mission.\n미션이 완료됐어요.'
            : 'Your hero is on the way.\n히어로가 오고 있어요.'}
        </Text>

        <StatusTimeline currentStep={STEP_BY_STATUS[mission.status] ?? 0} />
      </View>
      <View className="px-6 pb-6">
        <Button
          label={isCompleted ? 'Leave a Review' : 'Waiting for completion...'}
          variant={isCompleted ? 'primary' : 'secondary'}
          disabled={!isCompleted}
          onPress={() => router.replace({ pathname: '/complete', params: { amount } })}
        />
      </View>
    </SafeAreaView>
  );
}
