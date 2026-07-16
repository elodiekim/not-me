import { Feather } from '@expo/vector-icons';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, LoadingIndicator, RatingRow, SectionHeader } from '../../components/ui';
import { COLORS } from '../../constants/colors';
import { useMissionHistory } from '../../hooks/useMissionHistory';
import { useProfile } from '../../hooks/useProfile';
import { supabase } from '../../services/supabase';
import { useOnboardingStore } from '../../stores/useOnboardingStore';

// Dev-only: clear the onboarding flag and sign out so the gate routes back to
// the onboarding flow. Stripped from production builds via __DEV__.
async function replayOnboarding() {
  await useOnboardingStore.getState().reset();
  await supabase.auth.signOut();
}

const SETTINGS_ITEMS: { icon: keyof typeof Feather.glyphMap; label: string; koLabel: string }[] = [
  { icon: 'user', label: 'Account', koLabel: '계정' },
  { icon: 'bell', label: 'Notifications', koLabel: '알림' },
  { icon: 'help-circle', label: 'Help', koLabel: '도움말' },
];

function formatMemberSince(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export function ProfileScreen() {
  const { data: profile, isLoading: isProfileLoading, isError } = useProfile();
  const { data: missions, isLoading: isHistoryLoading } = useMissionHistory();
  const requestedCount = (missions ?? []).filter((item) => item.role === 'user').length;
  const helpedCount = (missions ?? []).filter((item) => item.role === 'hero').length;

  if (isProfileLoading || isHistoryLoading) {
    return <LoadingIndicator message="Loading your profile..." />;
  }

  if (isError || !profile) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center gap-2 bg-background px-6" edges={['top']}>
        <Text className="text-sm text-text-secondary">
          Something went wrong.{'\n'}Please try again.
        </Text>
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
              <Text className="font-sans-semibold text-xs text-primary">The roach next door is waiting.</Text>
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

        <Card>
          <Text className="text-sm font-sans-semibold text-text-primary">
            {formatMemberSince(profile.createdAt)}
          </Text>
          <Text className="font-sans text-xs text-text-secondary">Member since · 가입일</Text>
        </Card>

        <View className="gap-3">
          <SectionHeader title="Settings" />
          <Card>
            <View className="gap-4">
              {SETTINGS_ITEMS.map((item, index) => (
                <Pressable key={item.label} accessibilityRole="button" accessibilityLabel={item.label}>
                  <View
                    className={`flex-row items-center gap-3 ${index > 0 ? 'border-t border-surface pt-4' : ''}`}
                  >
                    <Feather name={item.icon} size={18} color={COLORS.textSecondary} />
                    <View className="flex-1">
                      <Text className="text-sm font-sans-semibold text-text-primary">{item.label}</Text>
                      <Text className="font-sans text-xs text-text-secondary">{item.koLabel}</Text>
                    </View>
                    <Feather name="chevron-right" size={18} color={COLORS.textDisabled} />
                  </View>
                </Pressable>
              ))}
            </View>
          </Card>
        </View>

        <Button label="Sign Out" variant="ghost" onPress={() => supabase.auth.signOut()} />

        {__DEV__ && (
          <Button
            label="Replay Onboarding · 온보딩 다시 보기 (dev)"
            variant="ghost"
            onPress={replayOnboarding}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
