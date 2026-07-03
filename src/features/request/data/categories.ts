import { ImageSourcePropType } from 'react-native';

export interface WeirdProblemCategory {
  id: string;
  label: string;
  koLabel: string;
  icon?: ImageSourcePropType;
}

export const WEIRD_PROBLEM_CATEGORIES: WeirdProblemCategory[] = [
  { id: 'lightbulb', label: 'Light Bulb', koLabel: '전구 교체', icon: require('../../../../assets/icons/lightbulb.png') },
  { id: 'spider', label: 'Spider', koLabel: '거미 제거', icon: require('../../../../assets/icons/spider.png') },
  { id: 'bee', label: 'Bee', koLabel: '벌 제거', icon: require('../../../../assets/icons/bee.png') },
  { id: 'heavy-lifting', label: 'Heavy Lifting', koLabel: '짐 옮기기', icon: require('../../../../assets/icons/box.png') },
  { id: 'more', label: 'More', koLabel: '기타' },
];
