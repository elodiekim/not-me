import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, MissionCard, MissionCardSkeleton, SectionHeader } from '../../components/ui';
import { getCategoryInfo } from '../../constants/categoryInfo';
import { COLORS } from '../../constants/colors';
import { getMissionStatusLabel } from '../../constants/mission';
import { useMissionHistory, type MissionHistoryEntry } from '../../hooks/useMissionHistory';
import { useUpdateMissionStatus } from '../../hooks/useUpdateMissionStatus';
import { isRequestStale } from '../../utils/missionExpiry';

function formatMissionDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatMonthLabel(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function groupByMonth(missions: MissionHistoryEntry[]) {
  const groups: { monthKey: string; monthLabel: string; missions: MissionHistoryEntry[] }[] = [];
  for (const mission of missions) {
    const monthKey = mission.createdAt.slice(0, 7);
    const lastGroup = groups[groups.length - 1];
    if (lastGroup?.monthKey === monthKey) {
      lastGroup.missions.push(mission);
    } else {
      groups.push({
        monthKey,
        monthLabel: formatMonthLabel(mission.createdAt),
        missions: [mission],
      });
    }
  }
  return groups;
}

export function MissionsTabScreen() {
  const router = useRouter();
  const { data: missions, isLoading, isError, refetch } = useMissionHistory();
  const { mutate: updateStatusMutate } = useUpdateMissionStatus();
  // Tied to the pull gesture only — see ProfileScreen for why isRefetching isn't used here.
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsManualRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsManualRefreshing(false);
    }
  };

  // Manual fallback for cache invalidation gaps (e.g. a status change from the other
  // party) — same pattern as NearbyMissions/Inbox.
  const refreshControl = (
    <RefreshControl
      refreshing={isManualRefreshing}
      onRefresh={handleRefresh}
      tintColor={COLORS.primary}
      colors={[COLORS.primary]}
    />
  );

  // Opportunistic expiry: a pg_cron job (0017/0018) now also expires stale
  // 'requested' missions on a 5-minute cycle, but this gives the requester's own
  // screen instant feedback instead of waiting for the next tick. Same fromStatus
  // guard as SearchingScreen covers the hero-accepts-at-the-same-time race.
  useEffect(() => {
    (missions ?? [])
      .filter(
        (mission) =>
          mission.role === 'user' &&
          mission.status === 'requested' &&
          isRequestStale(mission.createdAt),
      )
      .forEach((mission) =>
        updateStatusMutate({
          missionId: mission.id,
          status: 'cancelled',
          fromStatus: 'requested',
          cancelledReason: 'timeout',
        }),
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
      <SafeAreaView
        className="flex-1 items-center justify-center gap-4 bg-background px-6"
        edges={['top']}
      >
        <Text className="text-center text-sm text-text-secondary">
          Something went wrong.{'\n'}Please try again.
        </Text>
        <Button label="Try Again" variant="secondary" onPress={() => refetch()} />
      </SafeAreaView>
    );
  }

  const activeMissions = (missions ?? []).filter(
    (mission) => mission.status !== 'completed' && mission.status !== 'cancelled',
  );
  const historyMissions = (missions ?? []).filter(
    (mission) => mission.status === 'completed' || mission.status === 'cancelled',
  );

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="px-6 py-4">
        <Text className="text-lg font-sans-semibold text-text-primary">My Missions</Text>
        <Text className="font-sans text-sm text-text-secondary">내 미션</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 24, gap: 32 }} refreshControl={refreshControl}>
        <View className="gap-3">
          <SectionHeader title="Active" />
          {activeMissions.length === 0 ? (
            <View className="items-center gap-3 rounded-card bg-surface p-8">
              <Feather name="check-circle" size={28} color={COLORS.textDisabled} />
              <Text className="text-sm font-sans-semibold text-text-primary">
                No active mission
              </Text>
              <Text className="font-sans text-center text-xs text-text-secondary">
                진행 중인 미션이 없어요.{'\n'}Request help or accept a nearby mission to get
                started.
              </Text>
              <Button
                label="Request Help"
                variant="secondary"
                onPress={() => router.push('/request')}
              />
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
                        ? router.push({
                            pathname: '/mission-status',
                            params: { missionId: mission.id },
                          })
                        : router.push({ pathname: '/hero/active', params: { id: mission.id } })
                    }
                  >
                    <MissionCard
                      avatar={category.icon}
                      title={category.title}
                      subtitle={`${mission.role === 'user' ? 'Requested' : 'Helping'} · ${formatMissionDate(mission.createdAt)}`}
                      statusLabel={getMissionStatusLabel(mission.status)}
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
              <Text className="font-sans text-sm text-text-secondary">
                No missions yet · 미션 기록이 없어요
              </Text>
            </View>
          ) : (
            <View className="gap-10">
              {groupByMonth(historyMissions).map((group) => (
                <View key={group.monthKey}>
                  <View className="mb-4 border-b border-surface pb-3">
                    <Text className="text-xl font-sans-bold text-text-primary">
                      {group.monthLabel}
                    </Text>
                  </View>
                  <View className="gap-4">
                    {group.missions.map((mission) => {
                      const category = getCategoryInfo(mission.category);
                      const isReviewable =
                        mission.role === 'user' &&
                        mission.status === 'completed' &&
                        !mission.hasReview;
                      const isReviewed =
                        mission.role === 'user' &&
                        mission.status === 'completed' &&
                        mission.hasReview;
                      const statusLabel =
                        mission.status === 'cancelled'
                          ? 'Cancelled'
                          : isReviewable
                            ? 'Leave a Review'
                            : isReviewed
                              ? 'Reviewed ✓'
                              : `$${mission.rewardAmount}`;
                      const statusVariant =
                        mission.status === 'cancelled'
                          ? 'neutral'
                          : isReviewable
                            ? 'info'
                            : 'success';
                      const card = (
                        <MissionCard
                          avatar={category.icon}
                          title={category.title}
                          subtitle={`${mission.role === 'user' ? 'Requested' : 'Helped'} · ${formatMissionDate(mission.createdAt)}`}
                          detail={mission.address}
                          statusLabel={statusLabel}
                          statusVariant={statusVariant}
                        />
                      );
                      return isReviewable ? (
                        <Pressable
                          key={mission.id}
                          accessibilityRole="button"
                          accessibilityLabel={`Leave a review for ${category.title}`}
                          onPress={() =>
                            router.push({
                              pathname: '/complete',
                              params: { missionId: mission.id },
                            })
                          }
                        >
                          {card}
                        </Pressable>
                      ) : (
                        <View key={mission.id}>{card}</View>
                      );
                    })}
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
