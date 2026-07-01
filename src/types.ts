export type Screen =
  | 'home'
  | 'location'
  | 'canFly'
  | 'reward'
  | 'loading'
  | 'accepted'
  | 'complete'
  | 'cancelled'
  | 'review';

export type Location = 'Kitchen' | 'Bathroom' | 'Bedroom' | 'Other';
export type CanFly = 'Yes' | 'No' | "I don't know";
export type Reward = 10 | 20 | number;

export type Mission = {
  location: Location;
  canFly: CanFly;
  reward: Reward;
  helperName: string;
  helperLevel: string;
};

export const HELPER_LEVELS = [
  'Rookie',
  'Roach Hunter',
  'Bug Slayer',
  'Legend',
  'Grandma',
] as const;

export const COMING_SOON = [
  { emoji: '💡', label: 'Light Bulb' },
  { emoji: '🕷️', label: 'Spider' },
  { emoji: '🐝', label: 'Bee' },
  { emoji: '📦', label: 'Heavy Box' },
  { emoji: '🪜', label: 'Reach High Places' },
];
