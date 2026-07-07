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
