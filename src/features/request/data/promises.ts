import { ImageSourcePropType } from 'react-native';

export interface PromiseItem {
  id: string;
  title: string;
  koDescription: string;
  icon: ImageSourcePropType;
}

export const PROMISE_ITEMS: PromiseItem[] = [
  {
    id: 'no-judgment',
    title: 'No judgment. Ever.',
    koDescription: '판단하지 않아요.',
    icon: require('../../../../assets/icons/shield.png'),
  },
  {
    id: 'got-your-back',
    title: "We've got your back.",
    koDescription: '우리가 대신 해결해요.',
    icon: require('../../../../assets/icons/shield.png'),
  },
  {
    id: 'relax',
    title: 'You relax, we handle it.',
    koDescription: '당신은 편하게, 우리는 해결해요.',
    icon: require('../../../../assets/icons/shield.png'),
  },
];
