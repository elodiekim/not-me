import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, MissionCard } from '../../components/ui';
import { StatusTimeline } from './components/StatusTimeline';

export function MissionScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="px-6 py-4">
        <Text className="text-lg font-sans-semibold text-text-primary">Mission Status</Text>
      </View>
      <View className="flex-1 gap-8 px-6">
        <MissionCard
          avatar={require('../../../assets/characters/avatar-cat.png')}
          title="Minjun is on the way"
          subtitle="Cockroach Removal · 바퀴벌레 제거"
          statusLabel="On the way"
          statusVariant="info"
        />

        <Text className="text-center text-sm text-text-secondary">
          Arriving in about 8 minutes{'\n'}약 8분 후 도착
        </Text>

        <StatusTimeline currentStep={2} />
      </View>
      <View className="px-6 pb-6">
        <Button label="Mission Complete" variant="secondary" />
      </View>
    </SafeAreaView>
  );
}
