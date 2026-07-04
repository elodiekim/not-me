import { Feather } from '@expo/vector-icons';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, RatingRow, SectionHeader } from '../../components/ui';
import { COLORS } from '../../constants/colors';
import { MISSION_HISTORY } from '../missions/data/missionHistory';

const SETTINGS_ITEMS: { icon: keyof typeof Feather.glyphMap; label: string; koLabel: string }[] = [
  { icon: 'user', label: 'Account', koLabel: '계정' },
  { icon: 'bell', label: 'Notifications', koLabel: '알림' },
  { icon: 'help-circle', label: 'Help', koLabel: '도움말' },
];

const HERO_RATING = { rating: 4.9, reviewCount: 128 };

export function ProfileScreen() {
  const requestedCount = MISSION_HISTORY.filter((item) => item.role === 'user').length;
  const helpedCount = MISSION_HISTORY.filter((item) => item.role === 'hero').length;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 24, gap: 32 }}>
        <View className="items-center gap-2">
          <Image
            source={require('../../../assets/characters/avatar-cat.png')}
            style={{ width: 88, height: 88, borderRadius: 44 }}
          />
          <Text className="text-xl font-sans-bold text-text-primary">Yuna</Text>
          {helpedCount > 0 ? (
            <RatingRow rating={HERO_RATING.rating} reviewCount={HERO_RATING.reviewCount} />
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
          <Text className="text-sm font-sans-semibold text-text-primary">Jan 2026</Text>
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

        <Button label="Sign Out" variant="ghost" />
      </ScrollView>
    </SafeAreaView>
  );
}
