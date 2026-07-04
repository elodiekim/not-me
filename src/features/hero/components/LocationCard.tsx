import { Text, View } from 'react-native';

interface LocationCardProps {
  address: string;
  koAddress: string;
}

export function LocationCard({ address, koAddress }: LocationCardProps) {
  return (
    <View className="gap-1 rounded-card bg-surface p-4">
      <Text className="font-sans text-xs text-text-secondary">Location · 위치</Text>
      <Text className="text-base font-sans-semibold text-text-primary">{address}</Text>
      <Text className="font-sans text-sm text-text-secondary">{koAddress}</Text>
    </View>
  );
}
