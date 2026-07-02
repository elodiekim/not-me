import { ActivityIndicator, Text, View } from 'react-native';

interface LoadingIndicatorProps {
  message?: string;
}

export function LoadingIndicator({ message }: LoadingIndicatorProps) {
  return (
    <View className="items-center justify-center gap-3 p-6">
      <ActivityIndicator size="large" color="#FFB400" />
      {message && <Text className="text-center text-sm text-text-secondary">{message}</Text>}
    </View>
  );
}
