import { Feather } from '@expo/vector-icons';
import { Image, Pressable, Text, View } from 'react-native';
import { Card, SectionHeader } from '../../../components/ui';

interface MainMissionCardProps {
  onPress?: () => void;
}

export function MainMissionCard({ onPress }: MainMissionCardProps) {
  return (
    <View className="gap-3">
      <SectionHeader title="Get Help With" />
      <Pressable accessibilityRole="button" accessibilityLabel="Request Cockroach Removal" onPress={onPress}>
        <Card>
          <View className="flex-row items-center gap-4">
            <View className="items-center justify-center rounded-full bg-primary/20 p-2">
              <Image
                source={require('../../../../assets/icons/slipper.png')}
                style={{ width: 60, height: 60 }}
                resizeMode="contain"
              />
            </View>
            <View className="flex-1 gap-1">
              <Text className="text-xl font-sans-bold leading-tight text-text-primary">
                Roach{'\n'}Catcher
              </Text>
              <Text className="text-sm text-text-secondary">바퀴잡이</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#FFB400" />
          </View>
        </Card>
      </Pressable>
    </View>
  );
}
