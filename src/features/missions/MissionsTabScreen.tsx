import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, MissionCard, MissionCardSkeleton, SectionHeader } from '../../components/ui';
import { getCategoryInfo } from '../../constants/categoryInfo';
import { COLORS } from '../../constants/colors';
import { useMissionHistory } from '../../hooks/useMissionHistory';
import { useUpdateMissionStatus } from '../../hooks/useUpdateMissionStatus';
import { isRequestStale } from '../../utils/missionExpiry';
import type { MissionStatus } from '../../types/Mission';

const ACTIVE_STATUS_LABELS: Partial<Record<MissionStatus, string>> = {
  requested: 'Requested',
  accepted: 'Accepted',
  on_the_way: 'On the way',
  arrived: 'Arrived',
};

function formatMissionDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function MissionsTabScreen() {
  const router = useRouter();
  const { data: missions, isLoading, isError, refetch } = useMissionHistory();
  const { mutate: updateStatusMutate } = useUpdateMissionStatus();

  // Opportunistic expiry: no server cron, so a stale 'requested' mission only
  // gets cancelled once someone looks at it — here, whenever this tab loads.
  // Same fromStatus guard as SearchingScreen covers the hero-accepts-at-the-same-time race.
  useEffect(() => {
    (missions ?? [])
      .filter((mission) => mission.role === 'user' && mission.status === 'requested' && isRequestStale(mission.createdAt))
      .forEach((mission) =>
        updateStatusMutate({ missionId: mission.id, status: 'cancelled', fromStatus: 'requested' })
      );
  }, [missions, updateStatusMutate]);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={['top']}>
        <View className="px-6 py-4">
          <Text className="text-lg font-sans-semibold text-text-primary">My Missions</Text>
          <Text className="font-sans text-sm text-text-secondary">내 미션</Text>
        </View>
        <ScrollView contentContainerStyle={{ padding: 24, gap: 32 }}>
          <View className="gap-3">
            <SectionHeader title="Active" />
            <View className="gap-3">
              <MissionCardSkeleton />
              <MissionCardSkeleton />
            </View>
          </View>
          <View className="gap-3">
            <SectionHeader title="History" />
            <View className="gap-3">
              <MissionCardSkeleton />
              <MissionCardSkeleton />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center gap-4 bg-background px-6" edges={['top']}>
        <Text className="text-center text-sm text-text-secondary">
          Something went wrong.{'\n'}Please try again.
        </Text>
        <Button label="Try Again" variant="secondary" onPress={() => refetch()} />
      </SafeAreaView>
    );
  }

  const activeMissions = (missions ?? []).filter(
    (mission) => mission.status !== 'completed' && mission.status !== 'cancelled'
  );
  const historyMissions = (missions ?? []).filter(
    (mission) => mission.status === 'completed' || mission.status === 'cancelled'
  );

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="px-6 py-4">
        <Text className="text-lg font-sans-semibold text-text-primary">My Missions</Text>
        <Text className="font-sans text-sm text-text-secondary">내 미션</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 24, gap: 32 }}>
        <View className="gap-3">
          <SectionHeader title="Active" />
          {activeMissions.length === 0 ? (
            <View className="items-center gap-3 rounded-card bg-surface p-8">
              <Feather name="check-circle" size={28} color={COLORS.textDisabled} />
              <Text className="text-sm font-sans-semibold text-text-primary">No active mission</Text>
              <Text className="font-sans text-center text-xs text-text-secondary">
                진행 중인 미션이 없어요.{'\n'}Request help or accept a nearby mission to get started.
              </Text>
              <Button label="Request Help" variant="secondary" onPress={() => router.push('/request')} />
            </View>
          ) : (
            <View className="gap-3">
              {activeMissions.map((mission) => {
                const category = getCategoryInfo(mission.category);
                return (
                  <Pressable
                    key={mission.id}
                    accessibilityRole="button"
                    accessibilityLabel={`Open active mission: ${category.title}`}
                    onPress={() =>
                      mission.role === 'user'
                        ? router.push({ pathname: '/mission-status', params: { missionId: mission.id } })
                        : router.push({ pathname: '/hero/active', params: { id: mission.id } })
                    }
                  >
                    <MissionCard
                      avatar={category.icon}
                      title={category.title}
                      subtitle={`${mission.role === 'user' ? 'Requested' : 'Helping'} · ${formatMissionDate(mission.createdAt)}`}
                      statusLabel={ACTIVE_STATUS_LABELS[mission.status] ?? 'In progress'}
                      statusVariant="info"
                    />
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>

        <View className="gap-3">
          <SectionHeader title="History" />
          {historyMissions.length === 0 ? (
            <View className="items-center gap-2 rounded-card bg-surface p-8">
              <Text className="font-sans text-sm text-text-secondary">No missions yet · 미션 기록이 없어요</Text>
            </View>
          ) : (
            <View className="gap-3">
              {historyMissions.map((mission) => {
                const category = getCategoryInfo(mission.category);
                return (
                  <MissionCard
                    key={mission.id}
                    avatar={category.icon}
                    title={category.title}
                    subtitle={`${mission.role === 'user' ? 'Requested' : 'Helped'} · ${formatMissionDate(mission.createdAt)}`}
                    detail={mission.address}
                    statusLabel={mission.status === 'cancelled' ? 'Cancelled · 취소됨' : `$${mission.rewardAmount}`}
                    statusVariant={mission.status === 'cancelled' ? 'neutral' : 'success'}
                  />
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
