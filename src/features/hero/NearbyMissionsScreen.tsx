import { useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MissionCard } from '../../components/ui';
import { NEARBY_MISSIONS } from './data/nearbyMissions';

export function NearbyMissionsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="px-6 py-4">
        <Text className="text-lg font-sans-semibold text-text-primary">Nearby Missions</Text>
        <Text className="text-sm text-text-secondary">근처 요청 목록</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 24, gap: 16 }}>
        {NEARBY_MISSIONS.map((mission) => (
          <Pressable
            key={mission.id}
            accessibilityRole="button"
            accessibilityLabel={`View ${mission.title} mission`}
            onPress={() => router.push(`/hero/${mission.id}`)}
          >
            <MissionCard
              avatar={mission.icon}
              title={mission.title}
              subtitle={mission.distance}
              statusLabel={`$${mission.reward}`}
              statusVariant="success"
            />
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
