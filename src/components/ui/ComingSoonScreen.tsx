import { Feather } from '@expo/vector-icons';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';

interface ComingSoonScreenProps {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  koTitle: string;
  description: string;
}

export function ComingSoonScreen({ icon, title, koTitle, description }: ComingSoonScreenProps) {
  return (
    <SafeAreaView className="flex-1 items-center justify-center gap-3 bg-background px-6" edges={['top']}>
      <View className="items-center justify-center rounded-full bg-surface p-6">
        <Feather name={icon} size={32} color={COLORS.textDisabled} />
      </View>
      <Text className="text-lg font-sans-semibold text-text-primary">{title}</Text>
      <Text className="font-sans text-sm text-text-secondary">{koTitle}</Text>
      <Text className="font-sans text-center text-sm text-text-secondary">{description}</Text>
    </SafeAreaView>
  );
}
