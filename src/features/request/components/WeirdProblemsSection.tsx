import { ScrollView, View } from 'react-native';
import { SectionHeader } from '../../../components/ui';
import { WEIRD_PROBLEM_CATEGORIES } from '../data/categories';
import { CategoryTile } from './CategoryTile';

export function WeirdProblemsSection() {
  return (
    <View className="gap-3">
      <SectionHeader title="Coming Soon" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
        {WEIRD_PROBLEM_CATEGORIES.map((category) => (
          <CategoryTile key={category.id} category={category} />
        ))}
      </ScrollView>
    </View>
  );
}
