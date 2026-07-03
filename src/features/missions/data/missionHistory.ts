import { ImageSourcePropType } from 'react-native';

export type MissionRole = 'user' | 'hero';

export interface MissionHistoryItem {
  id: string;
  role: MissionRole;
  title: string;
  koTitle: string;
  date: string;
  amount: number;
  icon: ImageSourcePropType;
}

export const MISSION_HISTORY: MissionHistoryItem[] = [
  {
    id: 'h1',
    role: 'user',
    title: 'Roach Catcher',
    koTitle: '바퀴잡이',
    date: 'Jul 2',
    amount: 20,
    icon: require('../../../../assets/bugs/cockroach.png'),
  },
  {
    id: 'h2',
    role: 'hero',
    title: 'Spider Squad',
    koTitle: '거미 헌터',
    date: 'Jun 28',
    amount: 15,
    icon: require('../../../../assets/icons/spider.png'),
  },
  {
    id: 'h3',
    role: 'user',
    title: 'Buzz Off',
    koTitle: '붕붕이 아웃',
    date: 'Jun 20',
    amount: 25,
    icon: require('../../../../assets/icons/bee.png'),
  },
];
