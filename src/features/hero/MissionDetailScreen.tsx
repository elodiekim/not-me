import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Badge, Button, LoadingIndicator } from '../../components/ui';
import { useAcceptMission } from '../../hooks/useAcceptMission';
import { useMission } from '../../hooks/useMission';
import { getCategoryInfo } from '../../constants/categoryInfo';
import { LocationCard } from './components/LocationCard';
import { MissionNotFound } from './components/MissionNotFound';

export function MissionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: mission, isLoading, isError } = useMission(id);
  const acceptMission = useAcceptMission();
  const [acceptError, setAcceptError] = useState<string | null>(null);

  if (isLoading) {
    return <LoadingIndicator message="Loading mission..." />;
  }

  if (isError || !mission) {
    return <MissionNotFound />;
  }

  const category = getCategoryInfo(mission.category);

  const handleAccept = async () => {
    setAcceptError(null);
    try {
      await acceptMission.mutateAsync(mission.id);
      router.replace({ pathname: '/hero/active', params: { id: mission.id } });
    } catch {
      setAcceptError('This mission was already taken by another hero.\n다른 히어로가 이미 수락했어요.');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="flex-row items-center px-6 py-4">
        <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color="#111111" />
        </Pressable>
        <Text className="ml-4 text-lg font-sans-semibold text-text-primary">Mission Detail</Text>
      </View>
      <View className="flex-1 gap-6 px-6">
        <View className="items-center gap-2">
          <Image source={category.icon} style={{ width: 80, height: 80 }} resizeMode="contain" />
          <Text className="text-2xl font-sans-bold text-text-primary">{category.title}</Text>
          <Text className="font-sans text-sm text-text-secondary">{category.koTitle}</Text>
          <Badge label={`Reward $${mission.rewardAmount}`} variant="success" />
        </View>

        <View className="gap-1 rounded-card bg-surface p-4">
          <Text className="font-sans text-xs text-text-secondary">Requester · 요청자</Text>
          <Text className="text-base font-sans-semibold text-text-primary">{mission.requesterName}</Text>
        </View>

        <LocationCard address={mission.address} />

        {acceptError && <Text className="text-center text-sm text-danger">{acceptError}</Text>}
      </View>
      <View className="px-6 pb-6">
        <Button
          label="Accept Mission"
          variant="primary"
          loading={acceptMission.isPending}
          disabled={acceptMission.isPending}
          onPress={handleAccept}
        />
      </View>
    </SafeAreaView>
  );
}
