export type MissionCategory = 'cockroach';

export type MissionStatus =
  | 'requested'
  | 'accepted'
  | 'on_the_way'
  | 'arrived'
  | 'completed'
  | 'cancelled';

export interface Mission {
  id: string;
  requesterId: string;
  heroId: string | null;
  category: MissionCategory;
  rewardAmount: number;
  status: MissionStatus;
  address: string;
  latitude: number | null;
  longitude: number | null;
  createdAt: string;
  updatedAt: string;
}
