import { useQuery } from '@tanstack/react-query';
import { supabase } from '../services/supabase';
import { useAuthStore } from '../stores/useAuthStore';
import type { Mission } from '../types/Mission';

export type MissionRole = 'user' | 'hero';

export interface MissionHistoryEntry extends Mission {
  role: MissionRole;
  hasReview: boolean;
}

const MISSION_SELECT =
  'id, requester_id, hero_id, category, reward_amount, status, address, latitude, longitude, created_at, updated_at, reviews(id)';

function mapMissionHistoryEntry(row: any, userId: string): MissionHistoryEntry {
  return {
    id: row.id,
    requesterId: row.requester_id,
    heroId: row.hero_id,
    category: row.category,
    rewardAmount: row.reward_amount,
    status: row.status,
    address: row.address,
    latitude: row.latitude,
    longitude: row.longitude,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    role: row.requester_id === userId ? 'user' : 'hero',
    // reviews.mission_id is unique, so PostgREST embeds this as a single
    // object (or null), not an array, even though it reads like a to-many.
    hasReview: row.reviews != null,
  };
}

async function fetchMissionHistory(userId: string): Promise<MissionHistoryEntry[]> {
  const { data, error } = await supabase
    .from('missions')
    .select(MISSION_SELECT)
    .or(`requester_id.eq.${userId},hero_id.eq.${userId}`)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row) => mapMissionHistoryEntry(row, userId));
}

export function useMissionHistory() {
  const userId = useAuthStore((state) => state.session?.user.id);

  return useQuery({
    queryKey: ['missionHistory', userId],
    queryFn: () => fetchMissionHistory(userId as string),
    enabled: !!userId,
  });
}
