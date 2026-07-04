import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';
import { COLORS } from '../../constants/colors';

interface RatingRowProps {
  rating: number;
  reviewCount?: number;
}

export function RatingRow({ rating, reviewCount }: RatingRowProps) {
  return (
    <View className="flex-row items-center gap-1">
      <Ionicons name="star" size={14} color={COLORS.primary} />
      <Text className="text-xs font-sans-semibold text-text-primary">{rating.toFixed(1)}</Text>
      {reviewCount !== undefined && <Text className="font-sans text-xs text-text-secondary">({reviewCount})</Text>}
    </View>
  );
}
