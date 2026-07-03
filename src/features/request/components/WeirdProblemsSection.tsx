import { View } from 'react-native';
import { SectionHeader } from '../../../components/ui';
import { WEIRD_PROBLEM_CATEGORIES } from '../data/categories';
import { CategoryTile } from './CategoryTile';

export function WeirdProblemsSection() {
  return (
    <View className="gap-3">
      <SectionHeader title="Coming Soon" />
      <View className="flex-row flex-wrap justify-between gap-y-3">
        {WEIRD_PROBLEM_CATEGORIES.map((category) => (
          <CategoryTile key={category.id} category={category} />
        ))}
      </View>
    </View>
  );
}
