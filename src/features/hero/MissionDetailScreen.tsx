import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Badge, Button } from '../../components/ui';
import { NEARBY_MISSIONS } from './data/nearbyMissions';

export function MissionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
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
        <Text className="text-lg font-sans-semibold text-text-primary">Mission Detail</Text>
      </View>
      <View className="flex-1 gap-6 px-6">
        <View className="items-center gap-2">
          <Image source={mission.icon} style={{ width: 80, height: 80 }} resizeMode="contain" />
          <Text className="text-2xl font-sans-bold text-text-primary">{mission.title}</Text>
          <Text className="text-sm text-text-secondary">{mission.koTitle}</Text>
          <Badge label={`Reward $${mission.reward}`} variant="success" />
        </View>

        <View className="gap-1 rounded-card bg-surface p-4">
          <Text className="text-xs text-text-secondary">Requester · 요청자</Text>
          <Text className="text-base font-sans-semibold text-text-primary">{mission.requesterName}</Text>
        </View>

        <View className="gap-1 rounded-card bg-surface p-4">
          <Text className="text-xs text-text-secondary">Location · 위치</Text>
          <Text className="text-base font-sans-semibold text-text-primary">{mission.address}</Text>
          <Text className="text-sm text-text-secondary">{mission.koAddress}</Text>
        </View>
      </View>
      <View className="px-6 pb-6">
        <Button
          label="Accept Mission"
          variant="primary"
          onPress={() => router.replace({ pathname: '/hero/active', params: { id: mission.id } })}
        />
      </View>
    </SafeAreaView>
  );
}
