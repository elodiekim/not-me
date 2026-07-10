import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LoadingIndicator, MissionCard } from '../../components/ui';
import { useNearbyMissions } from '../../hooks/useNearbyMissions';
import { CATEGORY_INFO } from '../../constants/categoryInfo';

export function NearbyMissionsScreen() {
  const router = useRouter();
  const { data: missions, isLoading, isError } = useNearbyMissions();

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
                  subtitle={category.koTitle}
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
