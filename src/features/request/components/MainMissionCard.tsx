import { Feather } from '@expo/vector-icons';
import { Image, Text, View } from 'react-native';
import { Card, SectionHeader } from '../../../components/ui';

export function MainMissionCard() {
  return (
    <View className="gap-3">
      <SectionHeader title="Main Mission" />
      <Card>
        <View className="flex-row items-center gap-4">
          <View className="items-center justify-center rounded-full bg-primary/20 p-2">
            <Image
              source={require('../../../../assets/characters/avatar-cat.png')}
              style={{ width: 48, height: 48 }}
              resizeMode="contain"
            />
          </View>
          <View className="flex-1 gap-1">
            <Text className="text-xl font-bold leading-tight text-text-primary">
              Cockroach{'\n'}Removal
            </Text>
            <Text className="text-sm text-text-secondary">바퀴벌레 제거</Text>
          </View>
          <Feather name="chevron-right" size={20} color="#AAAAAA" />
        </View>
      </Card>
    </View>
  );
}
