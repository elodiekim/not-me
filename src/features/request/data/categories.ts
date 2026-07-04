import { ImageSourcePropType } from 'react-native';

export interface WeirdProblemCategory {
  id: string;
  label: string;
  koLabel: string;
  icon?: ImageSourcePropType;
}

export const WEIRD_PROBLEM_CATEGORIES: WeirdProblemCategory[] = [
  { id: 'lightbulb', label: 'Bright Fix', koLabel: '반짝 해결사', icon: require('../../../../assets/icons/lightbulb.png') },
  { id: 'spider', label: 'Spider Squad', koLabel: '거미 헌터', icon: require('../../../../assets/icons/spider.png') },
  { id: 'bee', label: 'Buzz Off', koLabel: '붕붕이 아웃', icon: require('../../../../assets/icons/bee.png') },
  { id: 'snake', label: 'Sneaky Snake', koLabel: '스르륵 아웃', icon: require('../../../../assets/icons/snake.png') },
  { id: 'heavy-lifting', label: 'Muscle Help', koLabel: '낑낑 대신', icon: require('../../../../assets/icons/box.png') },
  { id: 'reach-high', label: 'Tippy-Toe Rescue', koLabel: '까치발 해결사', icon: require('../../../../assets/icons/ladder.png') },
  { id: 'something-else', label: 'Anything Weird', koLabel: '이상한 건 다 콜', icon: require('../../../../assets/icons/question-mark.png') },
  { id: 'more', label: 'More Weirdness', koLabel: '더 있어요' },
];
