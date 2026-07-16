import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, LoadingIndicator } from '../../components/ui';
import { useCreateRequest } from '../../hooks/useCreateRequest';
import { useMission } from '../../hooks/useMission';
import { useUpdateMissionStatus } from '../../hooks/useUpdateMissionStatus';
import { millisUntilStale } from '../../utils/missionExpiry';

export function SearchingScreen() {
  const router = useRouter();
  const { missionId, amount } = useLocalSearchParams<{ missionId?: string; amount?: string }>();
  // Realtime pushes status changes instantly; this poll is only a safety net for
  // dropped sockets, so 30s is plenty (was 2s when polling was the primary path).
  const { data: mission } = useMission(missionId, { refetchInterval: 30000 });
  const updateStatus = useUpdateMissionStatus();
  const createRequest = useCreateRequest();
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    // 'cancelled' is excluded so the polling doesn't redirect to mission-status
    // right after the user cancels — handleCancel owns that navigation.
    if (mission && mission.status !== 'requested' && mission.status !== 'cancelled') {
      router.replace({ pathname: '/mission-status', params: { missionId: mission.id, amount } });
    }
  }, [mission, router, amount]);

  // Client-side expiry (no server cron): once SEARCH_TIMEOUT_MS has passed since
  // created_at, cancel the mission. fromStatus guards the race where a hero
  // accepts at the same moment — then this matches 0 rows and polling redirects.
  const { mutate: updateStatusMutate } = updateStatus;
  useEffect(() => {
    if (expired || !mission || mission.status !== 'requested') return;

    const remaining = millisUntilStale(mission.createdAt);
    const expire = () => {
      setExpired(true);
      updateStatusMutate({ missionId: mission.id, status: 'cancelled', fromStatus: 'requested' });
    };

    if (remaining <= 0) {
      expire();
      return;
    }
    const timer = setTimeout(expire, remaining);
    return () => clearTimeout(timer);
  }, [expired, mission, updateStatusMutate]);

  const handleCancel = async () => {
    if (missionId) {
      try {
        await updateStatus.mutateAsync({ missionId, status: 'cancelled', fromStatus: 'requested' });
      } catch {
        // Cancellation failed (e.g. offline) — never trap the user on this screen.
      }
    }
    router.replace('/');
  };

  const handleTryAgain = async () => {
    if (!mission) return;
    try {
      const newMission = await createRequest.mutateAsync({
        category: mission.category,
        rewardAmount: mission.rewardAmount,
        address: mission.address,
        latitude: mission.latitude,
        longitude: mission.longitude,
      });
      setExpired(false);
      router.setParams({ missionId: newMission.id });
    } catch {
      // createRequest.isError drives the friendly message below.
    }
  };

  if (expired) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={['top']}>
        <View className="flex-1 items-center justify-center gap-6 px-6">
          <Image
            source={require('../../../assets/characters/binoculars-cat.png')}
            style={{ width: 160, height: 160 }}
            resizeMode="contain"
          />
          <Text className="font-sans-semibold text-center text-lg text-text-primary">
            No heroes nearby right now.
          </Text>
          <Text className="font-sans text-center text-sm text-text-secondary">
            Want to try again?
          </Text>
          {createRequest.isError && (
            <Text className="font-sans text-center text-sm text-danger">
              Something went wrong. Please try again.
            </Text>
          )}
        </View>
        <View className="gap-3 px-6 pb-6">
          <Button label="Try Again" onPress={handleTryAgain} loading={createRequest.isPending} />
          <Button
            label="Back to Home"
            variant="ghost"
            onPress={() => router.replace('/')}
            disabled={createRequest.isPending}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="flex-row items-center justify-end px-6 py-4">
        <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={() => router.replace('/')}>
          <Feather name="x" size={24} color="#111111" />
        </Pressable>
      </View>
      <View className="flex-1 items-center justify-center gap-6 px-6">
        <Image
          source={require('../../../assets/characters/binoculars-cat.png')}
          style={{ width: 160, height: 160 }}
          resizeMode="contain"
        />
        <LoadingIndicator message="Looking for a hero..." />
        <Text className="font-sans text-center text-sm text-text-secondary">
          Stay calm. Help is on the way.
        </Text>
      </View>
      <View className="px-6 pb-6">
        <Button
          label="Cancel"
          variant="ghost"
          onPress={handleCancel}
          loading={updateStatus.isPending}
          disabled={updateStatus.isPending}
        />
      </View>
    </SafeAreaView>
  );
}
