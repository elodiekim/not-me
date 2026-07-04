import { Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function MissionNotFound() {
  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-background">
      <Text className="font-sans text-text-secondary">Mission not found.</Text>
    </SafeAreaView>
  );
}
