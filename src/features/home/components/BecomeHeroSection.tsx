import { Feather } from '@expo/vector-icons';
import { Image, Pressable, Text, View } from 'react-native';
import { Card } from '../../../components/ui';

interface BecomeHeroSectionProps {
  onPress?: () => void;
}

export function BecomeHeroSection({ onPress }: BecomeHeroSectionProps) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel="Become a Hero" onPress={onPress}>
      <Card>
        <View className="flex-row items-center gap-4">
          <View className="items-center justify-center rounded-full bg-primary/20 p-3">
            <Image source={require('../../../../assets/icons/star.png')} style={{ width: 32, height: 32 }} resizeMode="contain" />
          </View>
          <View className="flex-1 gap-1">
            <Text className="text-base font-sans-bold text-text-primary">Wanna be a Hero?</Text>
            <Text className="text-sm text-text-secondary">Nearby chaos? You got this.</Text>
          </View>
          <Feather name="chevron-right" size={20} color="#FFB400" />
        </View>
      </Card>
    </Pressable>
  );
}
