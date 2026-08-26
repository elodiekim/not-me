export type MissionCategory = 'cockroach';

export type MissionStatus =
  'requested' | 'accepted' | 'on_the_way' | 'arrived' | 'completed' | 'cancelled';

// Only meaningful when status is 'cancelled'; null on missions cancelled before
// this field existed (see 0018) — there's no reliable way to backfill it.
export type MissionCancelledReason = 'requester' | 'timeout' | 'admin' | null;

export interface Mission {
  id: string;
  requesterId: string;
  heroId: string | null;
  category: MissionCategory;
  rewardAmount: number;
  status: MissionStatus;
  cancelledReason: MissionCancelledReason;
  address: string;
  latitude: number | null;
  longitude: number | null;
  createdAt: string;
  updatedAt: string;
}
