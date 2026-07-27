import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card } from '../../components/ui';
import { COLORS } from '../../constants/colors';
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

export function SettingsScreen() {
  const router = useRouter();

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

      <ScrollView contentContainerStyle={{ padding: 24, gap: 32 }}>
        <Card>
          <View className="gap-4">
            {SETTINGS_ITEMS.map((item, index) => (
              <Pressable
                key={item.label}
                accessibilityRole="button"
                accessibilityLabel={item.label}
                onPress={item.label === 'Account' ? () => router.push('/edit-profile') : undefined}
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
