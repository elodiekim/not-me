import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LoadingIndicator, MissionCard } from '../../components/ui';
import { useNearbyMissions } from '../../hooks/useNearbyMissions';
import { CATEGORY_INFO } from '../../constants/categoryInfo';
import { formatDistance, haversineDistanceKm } from '../../utils/distance';

// Best-effort: denied permission or location failure just means no distance
// label is shown — the mission list itself must still work.
function useCurrentCoords() {
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;

        const position = await Location.getCurrentPositionAsync();
        if (!cancelled) {
          setCoords({ latitude: position.coords.latitude, longitude: position.coords.longitude });
        }
      } catch {
        // no-op: distance label just stays hidden
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return coords;
}

export function NearbyMissionsScreen() {
  const router = useRouter();
  const { data: missions, isLoading, isError } = useNearbyMissions();
  const heroCoords = useCurrentCoords();

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="px-6 py-4">
        <View className="flex-row items-center">
          <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={() => router.back()}>
            <Feather name="arrow-left" size={24} color="#111111" />
          </Pressable>
          <Text className="ml-4 text-lg font-sans-semibold text-text-primary">Nearby Missions</Text>
        </View>
        <Text className="ml-10 font-sans text-sm text-text-secondary">근처 요청 목록</Text>
      </View>

      {isLoading ? (
        <LoadingIndicator message="Loading nearby missions..." />
      ) : isError ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center text-sm text-text-secondary">
            Something went wrong.{'\n'}Please try again.
          </Text>
        </View>
      ) : !missions || missions.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center text-sm text-text-secondary">
            No missions nearby right now.{'\n'}근처에 요청이 없어요. 곧 찾아올게요.
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 24, gap: 16 }}>
          {missions.map((mission) => {
            const category = CATEGORY_INFO[mission.category];
            const distanceLabel =
              heroCoords && mission.latitude != null && mission.longitude != null
                ? formatDistance(
                    haversineDistanceKm(heroCoords, {
                      latitude: mission.latitude,
                      longitude: mission.longitude,
                    })
                  )
                : null;
            const subtitle = distanceLabel ? `${category.koTitle} · ${distanceLabel}` : category.koTitle;
            return (
              <Pressable
                key={mission.id}
                accessibilityRole="button"
                accessibilityLabel={`View ${category.title} mission`}
                onPress={() => router.push(`/hero/${mission.id}`)}
              >
                <MissionCard
                  avatar={category.icon}
                  title={category.title}
                  subtitle={subtitle}
                  statusLabel={`$${mission.rewardAmount}`}
                  statusVariant="success"
                />
              </Pressable>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
