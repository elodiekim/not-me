import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, MissionCard, SectionHeader } from '../../components/ui';
import { MISSION_HISTORY } from './data/missionHistory';

export function MissionsTabScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="px-6 py-4">
        <Text className="text-lg font-sans-semibold text-text-primary">My Missions</Text>
        <Text className="text-sm text-text-secondary">내 미션</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 24, gap: 32 }}>
        <View className="gap-3">
          <SectionHeader title="Active" />
          <View className="items-center gap-3 rounded-card bg-surface p-8">
            <Feather name="check-circle" size={28} color="#AAAAAA" />
            <Text className="text-sm font-sans-semibold text-text-primary">No active mission</Text>
            <Text className="text-center text-xs text-text-secondary">
              진행 중인 미션이 없어요.{'\n'}Request help or accept a nearby mission to get started.
            </Text>
            <Button label="Request Help" variant="secondary" onPress={() => router.push('/request')} />
          </View>
        </View>

        <View className="gap-3">
          <SectionHeader title="History" />
          {MISSION_HISTORY.length === 0 ? (
            <View className="items-center gap-2 rounded-card bg-surface p-8">
              <Text className="text-sm text-text-secondary">No missions yet · 미션 기록이 없어요</Text>
            </View>
          ) : (
            <View className="gap-3">
              {MISSION_HISTORY.map((item) => (
                <MissionCard
                  key={item.id}
                  avatar={item.icon}
                  title={item.title}
                  subtitle={`${item.role === 'user' ? 'Requested' : 'Helped'} · ${item.date}`}
                  statusLabel={`$${item.amount}`}
                  statusVariant="success"
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
