import { Ionicons } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';

const STAR_COUNT = 5;

interface StarRatingProps {
  rating: number;
  onChange: (rating: number) => void;
}

export function StarRating({ rating, onChange }: StarRatingProps) {
  return (
    <View className="flex-row justify-center gap-2">
      {Array.from({ length: STAR_COUNT }, (_, index) => {
        const starValue = index + 1;
        const filled = starValue <= rating;

        return (
          <Pressable
            key={starValue}
            accessibilityRole="button"
            accessibilityLabel={`Rate ${starValue} star`}
            onPress={() => onChange(starValue)}
          >
            <Ionicons name={filled ? 'star' : 'star-outline'} size={32} color={filled ? '#FFB400' : '#AAAAAA'} />
          </Pressable>
        );
      })}
    </View>
  );
}
