import { ImageSourcePropType } from 'react-native';

export interface NearbyMission {
  id: string;
  title: string;
  koTitle: string;
  distance: string;
  reward: number;
  requesterName: string;
  address: string;
  koAddress: string;
  icon: ImageSourcePropType;
}

export const NEARBY_MISSIONS: NearbyMission[] = [
  {
    id: 'roach-1',
    title: 'Roach Catcher',
    koTitle: '바퀴잡이',
    distance: '0.3 km away',
    reward: 20,
    requesterName: 'Jiwoo',
    address: '123 Seocho-daero',
    koAddress: '서초대로 123',
    icon: require('../../../../assets/bugs/cockroach.png'),
  },
  {
    id: 'spider-1',
    title: 'Spider Squad',
    koTitle: '거미 헌터',
    distance: '0.8 km away',
    reward: 15,
    requesterName: 'Hana',
    address: '45 Gangnam-daero',
    koAddress: '강남대로 45',
    icon: require('../../../../assets/icons/spider.png'),
  },
  {
    id: 'bee-1',
    title: 'Buzz Off',
    koTitle: '붕붕이 아웃',
    distance: '1.2 km away',
    reward: 25,
    requesterName: 'Seojun',
    address: '9 Yeoksam-ro',
    koAddress: '역삼로 9',
    icon: require('../../../../assets/icons/bee.png'),
  },
];
