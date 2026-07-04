import { Feather } from '@expo/vector-icons';
import { Image, Text, View } from 'react-native';
import { WeirdProblemCategory } from '../data/categories';

interface CategoryTileProps {
  category: WeirdProblemCategory;
}

export function CategoryTile({ category }: CategoryTileProps) {
  return (
    <View className="w-[23%] items-center gap-2 rounded-card bg-surface p-3">
      {category.icon ? (
        <Image source={category.icon} style={{ width: 28, height: 28 }} resizeMode="contain" />
      ) : (
        <Feather name="more-horizontal" size={28} color="#111111" />
      )}
      <View className="items-center">
        <Text className="text-center text-xs font-sans-semibold text-text-primary">{category.label}</Text>
        <Text className="font-sans text-center text-[11px] text-text-secondary">{category.koLabel}</Text>
      </View>
    </View>
  );
}
