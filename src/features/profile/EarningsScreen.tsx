import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, LoadingIndicator } from '../../components/ui';
import { COLORS } from '../../constants/colors';
import { getCategoryInfo } from '../../constants/categoryInfo';
import { useMissionHistory, type MissionHistoryEntry } from '../../hooks/useMissionHistory';
import { formatEarned } from '../../utils/formatEarned';

function formatEarnedDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function EarningRow({ entry }: { entry: MissionHistoryEntry }) {
  const category = getCategoryInfo(entry.category);
  return (
    <Card>
      <View className="flex-row items-center gap-3">
        <Image source={category.icon} style={{ width: 40, height: 40 }} />
        <View className="flex-1">
          <Text className="text-sm font-sans-semibold text-text-primary">{category.title}</Text>
          <Text className="font-sans text-xs text-text-secondary">
            {formatEarnedDate(entry.updatedAt)}
          </Text>
        </View>
        <Text className="text-base font-sans-bold text-text-primary">
          {formatEarned(entry.rewardAmount)}
        </Text>
      </View>
    </Card>
  );
}

export function EarningsScreen() {
  const router = useRouter();
  const { data: missions, isLoading, isError, refetch } = useMissionHistory();

  const header = (
    <View className="px-6 py-4">
      <View className="flex-row items-center">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={() => router.back()}
        >
          <Feather name="arrow-left" size={24} color="#111111" />
        </Pressable>
        <Text className="ml-4 text-lg font-sans-semibold text-text-primary">Earnings</Text>
      </View>
      <Text className="ml-10 font-sans text-sm text-text-secondary">수익 내역</Text>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={['top']}>
        {header}
        <LoadingIndicator message="Loading earnings..." />
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={['top']}>
        {header}
        <View className="flex-1 items-center justify-center gap-4 px-6">
          <Text className="text-center text-sm text-text-secondary">
            Something went wrong.{'\n'}Please try again.
          </Text>
          <Button label="Try Again" variant="secondary" onPress={() => refetch()} />
        </View>
      </SafeAreaView>
    );
  }

  // Completed missions where I was the hero, most recently completed first.
  const earnings = (missions ?? [])
    .filter((item) => item.role === 'hero' && item.status === 'completed')
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  const total = earnings.reduce((sum, item) => sum + item.rewardAmount, 0);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {header}
      <ScrollView contentContainerStyle={{ padding: 24, gap: 24 }}>
        <Card>
          <Text className="text-2xl font-sans-bold text-text-primary">{formatEarned(total)}</Text>
          <Text className="font-sans text-xs text-text-secondary">Total Earned · 누적 수익</Text>
        </Card>

        {earnings.length === 0 ? (
          <View className="items-center gap-2 rounded-card bg-surface p-8">
            <Feather name="dollar-sign" size={28} color={COLORS.textDisabled} />
            <Text className="font-sans text-center text-sm text-text-secondary">
              No earnings yet.{'\n'}아직 수익이 없어요.
            </Text>
          </View>
        ) : (
          <View className="gap-3">
            {earnings.map((entry) => (
              <EarningRow key={entry.id} entry={entry} />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
