import { ActivityIndicator, Text, View } from 'react-native';
import { COLORS } from '../../constants/colors';

interface LoadingIndicatorProps {
  message?: string;
}

export function LoadingIndicator({ message }: LoadingIndicatorProps) {
  return (
    <View className="items-center justify-center gap-3 p-6">
      <ActivityIndicator size="large" color={COLORS.primary} />
      {message && <Text className="font-sans text-center text-sm text-text-secondary">{message}</Text>}
    </View>
  );
}
