import { Text, View } from 'react-native';
import { Button } from '../../../components/ui';

export function BecomeHeroSection() {
  return (
    <View className="items-center gap-2 border-t border-surface pt-6">
      <Text className="text-base font-semibold text-text-secondary">Want to become a Hero?</Text>
      <Text className="text-center text-sm text-text-secondary">
        Help people nearby solve weird problems and earn rewards.
      </Text>
      <View className="mt-2 w-full">
        <Button label="Become a Hero" variant="secondary" />
      </View>
    </View>
  );
}
