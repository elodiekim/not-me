import { ImageSourcePropType } from 'react-native';
import type { MissionCategory } from '../types/Mission';

interface CategoryInfo {
  title: string;
  koTitle: string;
  icon: ImageSourcePropType;
}

export const CATEGORY_INFO: Record<MissionCategory, CategoryInfo> = {
  cockroach: {
    title: 'Roach Catcher',
    koTitle: '바퀴잡이',
    icon: require('../../assets/bugs/cockroach.png'),
  },
};

// The DB `category` column is free-form text (no enum/check), so a row can hold
// a value we don't have info for. Fall back to the only real category instead of
// crashing on `CATEGORY_INFO[unknown].icon`.
export function getCategoryInfo(category: string): CategoryInfo {
  return CATEGORY_INFO[category as MissionCategory] ?? CATEGORY_INFO.cockroach;
}
