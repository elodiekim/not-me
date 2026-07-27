import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, LoadingIndicator, RatingRow } from '../../components/ui';
import { COLORS } from '../../constants/colors';
import { useMissionHistory } from '../../hooks/useMissionHistory';
import { useProfile } from '../../hooks/useProfile';
import { formatEarned } from '../../utils/formatEarned';

function formatMemberSince(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export function ProfileScreen() {
  const router = useRouter();
  const { data: profile, isLoading: isProfileLoading, isError, refetch } = useProfile();
  const { data: missions, isLoading: isHistoryLoading } = useMissionHistory();
  const requestedCount = (missions ?? []).filter((item) => item.role === 'user').length;
  const helpedCount = (missions ?? []).filter((item) => item.role === 'hero').length;
  const totalEarned = (missions ?? [])
    .filter((item) => item.role === 'hero' && item.status === 'completed')
    .reduce((sum, item) => sum + item.rewardAmount, 0);

  if (isProfileLoading || isHistoryLoading) {
    return <LoadingIndicator message="Loading your profile..." />;
  }

  if (isError || !profile) {
    return (
      <SafeAreaView
        className="flex-1 items-center justify-center gap-4 bg-background px-6"
        edges={['top']}
      >
        <Text className="text-sm text-text-secondary">
          Something went wrong.{'\n'}Please try again.
        </Text>
        <Button label="Try Again" variant="secondary" onPress={() => refetch()} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 24, gap: 32 }}>
        <View className="items-center gap-2">
          <Image
            source={
              profile.avatarUrl
                ? { uri: profile.avatarUrl }
                : require('../../../assets/characters/avatar-cat.png')
            }
            style={{ width: 88, height: 88, borderRadius: 44 }}
          />
          <Text className="text-xl font-sans-bold text-text-primary">{profile.name}</Text>
          {profile.heroReviewCount > 0 && profile.heroRating !== null ? (
            <RatingRow rating={profile.heroRating} reviewCount={profile.heroReviewCount} />
          ) : (
            <View className="items-center">
              <Text className="font-sans-semibold text-xs text-primary">
                The roach next door is waiting.
              </Text>
              <Text className="font-sans text-xs text-text-secondary">첫 출동 대기 중...</Text>
            </View>
          )}
        </View>

        <View className="flex-row gap-3">
          <Card style={{ flex: 1 }}>
            <Text className="text-2xl font-sans-bold text-text-primary">{requestedCount}</Text>
            <Text className="font-sans text-xs text-text-secondary">Requested · 요청</Text>
          </Card>
          <Card style={{ flex: 1 }}>
            <Text className="text-2xl font-sans-bold text-text-primary">{helpedCount}</Text>
            <Text className="font-sans text-xs text-text-secondary">Helped · 도움</Text>
          </Card>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Total Earned"
          onPress={() => router.push('/earnings')}
        >
          <Card>
            <View className="flex-row items-center gap-3">
              <View className="flex-1">
                <Text className="text-2xl font-sans-bold text-text-primary">
                  {formatEarned(totalEarned)}
                </Text>
                <Text className="font-sans text-xs text-text-secondary">
                  Total Earned · 누적 수익
                </Text>
              </View>
              <Feather name="chevron-right" size={18} color={COLORS.textDisabled} />
            </View>
          </Card>
        </Pressable>

        <Card>
          <View className="gap-4">
            <View>
              <Text className="text-sm font-sans-semibold text-text-primary">
                {formatMemberSince(profile.createdAt)}
              </Text>
              <Text className="font-sans text-xs text-text-secondary">Member since · 가입일</Text>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="My Reviews"
              onPress={() => router.push('/reviews')}
            >
              <View className="flex-row items-center gap-3 border-t border-surface pt-4">
                <Feather name="star" size={18} color={COLORS.textSecondary} />
                <View className="flex-1">
                  <Text className="text-sm font-sans-semibold text-text-primary">My Reviews</Text>
                  <Text className="font-sans text-xs text-text-secondary">내 리뷰</Text>
                </View>
                <Feather name="chevron-right" size={18} color={COLORS.textDisabled} />
              </View>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Settings"
              onPress={() => router.push('/settings')}
            >
              <View className="flex-row items-center gap-3 border-t border-surface pt-4">
                <Feather name="settings" size={18} color={COLORS.textSecondary} />
                <View className="flex-1">
                  <Text className="text-sm font-sans-semibold text-text-primary">Settings</Text>
                  <Text className="font-sans text-xs text-text-secondary">설정</Text>
                </View>
                <Feather name="chevron-right" size={18} color={COLORS.textDisabled} />
              </View>
            </Pressable>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
