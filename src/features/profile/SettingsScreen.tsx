import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomSheet, Button, Card, SectionHeader } from '../../components/ui';
import { COLORS } from '../../constants/colors';
import { useDeleteAccount } from '../../hooks/useDeleteAccount';
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
  { icon: 'info', label: 'About NotMe', koLabel: 'NotMe 소개' },
];

// Only Account and About NotMe are wired up so far — Notifications/Help have
// no destination yet, so they fall through to undefined (no-op tap).
const SETTINGS_ROUTES: Partial<Record<string, string>> = {
  Account: '/edit-profile',
  'About NotMe': '/about',
};

export function SettingsScreen() {
  const router = useRouter();
  const deleteAccount = useDeleteAccount();
  const [isDeleteSheetOpen, setIsDeleteSheetOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // AuthGate does the actual navigation once the session clears (it's watching
  // is_active globally) — this just fires the mutation and closes the sheet so
  // the user isn't left staring at a stale confirmation while that happens.
  // Unlike a mission cancel, a failure here has to actually be surfaced rather
  // than silently proceeding — nothing changed, so leaving the user thinking
  // their account is gone when it isn't would be the worse failure.
  const handleDeleteAccount = async () => {
    setDeleteError(null);
    try {
      await deleteAccount.mutateAsync();
      setIsDeleteSheetOpen(false);
    } catch {
      setDeleteError(
        'Something went wrong. Please try again.\n문제가 발생했어요. 다시 시도해주세요.',
      );
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="px-6 py-4">
        <View className="flex-row items-center">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back"
            onPress={() => router.back()}
          >
            <Feather name="arrow-left" size={24} color="#111111" />
          </Pressable>
          <Text className="ml-4 text-lg font-sans-semibold text-text-primary">Settings</Text>
        </View>
        <Text className="ml-10 font-sans text-sm text-text-secondary">설정</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 24, gap: 24 }}>
        <View className="gap-3">
          <SectionHeader title="Preferences" />
          <Card>
            <View className="gap-4">
              {SETTINGS_ITEMS.map((item, index) => (
                <Pressable
                  key={item.label}
                  accessibilityRole="button"
                  accessibilityLabel={item.label}
                  onPress={
                    SETTINGS_ROUTES[item.label]
                      ? () => router.push(SETTINGS_ROUTES[item.label] as never)
                      : undefined
                  }
                >
                  <View
                    className={`flex-row items-center gap-3 ${index > 0 ? 'border-t border-surface pt-4' : ''}`}
                  >
                    <Feather name={item.icon} size={18} color={COLORS.textSecondary} />
                    <View className="flex-1">
                      <Text className="text-sm font-sans-semibold text-text-primary">
                        {item.label}
                      </Text>
                      <Text className="font-sans text-xs text-text-secondary">{item.koLabel}</Text>
                    </View>
                    <Feather name="chevron-right" size={18} color={COLORS.textDisabled} />
                  </View>
                </Pressable>
              ))}
            </View>
          </Card>
        </View>

        <View className="gap-3">
          <SectionHeader title="Account" />
          <Card>
            <View className="gap-4">
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Sign Out"
                onPress={() => supabase.auth.signOut()}
              >
                <View className="flex-row items-center gap-3">
                  <Feather name="log-out" size={18} color={COLORS.textSecondary} />
                  <View className="flex-1">
                    <Text className="text-sm font-sans-semibold text-text-primary">Sign Out</Text>
                    <Text className="font-sans text-xs text-text-secondary">로그아웃</Text>
                  </View>
                </View>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Delete Account"
                onPress={() => setIsDeleteSheetOpen(true)}
              >
                <View className="flex-row items-center gap-3 border-t border-surface pt-4">
                  <Feather name="trash-2" size={18} color={COLORS.danger} />
                  <View className="flex-1">
                    <Text className="text-sm font-sans-semibold text-danger">Delete Account</Text>
                    <Text className="font-sans text-xs text-danger">계정 탈퇴</Text>
                  </View>
                </View>
              </Pressable>
            </View>
          </Card>
        </View>

        {__DEV__ && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Replay Onboarding (dev)"
            onPress={replayOnboarding}
          >
            <Text className="text-center font-sans text-xs text-text-disabled">
              Replay Onboarding · 온보딩 다시 보기 (dev)
            </Text>
          </Pressable>
        )}
      </ScrollView>

      <BottomSheet visible={isDeleteSheetOpen} onClose={() => setIsDeleteSheetOpen(false)}>
        <Text className="text-lg font-sans-semibold text-text-primary">
          Delete your account?{'\n'}계정을 삭제할까요?
        </Text>
        <Text className="font-sans text-sm text-text-secondary">
          This can&apos;t be undone. You&apos;ll be signed out and won&apos;t be able to sign back
          in with this account.{'\n'}이 작업은 되돌릴 수 없어요. 로그아웃되고, 이 계정으로 다시
          로그인할 수 없어요.
        </Text>
        {deleteError && <Text className="text-sm text-danger">{deleteError}</Text>}
        <Button
          label="Delete My Account · 삭제할게요"
          variant="danger"
          onPress={handleDeleteAccount}
          loading={deleteAccount.isPending}
          disabled={deleteAccount.isPending}
        />
        <Button
          label="Cancel · 취소"
          variant="ghost"
          onPress={() => setIsDeleteSheetOpen(false)}
          disabled={deleteAccount.isPending}
        />
      </BottomSheet>
    </SafeAreaView>
  );
}
