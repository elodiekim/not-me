import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { supabase } from '../services/supabase';
import type { Mission } from '../types/Mission';

export interface MissionWithRequester extends Mission {
  requesterName: string;
  heroName: string | null;
  heroRating: number | null;
  heroReviewCount: number;
}

const MISSION_WITH_REQUESTER_SELECT =
  'id, requester_id, hero_id, category, reward_amount, status, address, created_at, updated_at, ' +
  'requester:profiles!missions_requester_id_fkey(name), ' +
  'hero:profiles!missions_hero_id_fkey(name, hero_rating, hero_review_count)';

function mapMissionWithRequester(row: any): MissionWithRequester {
  return {
    id: row.id,
    requesterId: row.requester_id,
    heroId: row.hero_id,
    category: row.category,
    rewardAmount: row.reward_amount,
    status: row.status,
    address: row.address,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    requesterName: row.requester?.name ?? 'Someone nearby',
    heroName: row.hero?.name ?? null,
    heroRating: row.hero?.hero_rating ?? null,
    heroReviewCount: row.hero?.hero_review_count ?? 0,
  };
}

async function fetchMission(id: string): Promise<MissionWithRequester> {
  const { data, error } = await supabase
    .from('missions')
    .select(MISSION_WITH_REQUESTER_SELECT)
    .eq('id', id)
    .single();

  if (error) throw error;

  return mapMissionWithRequester(data);
}

export function useMission(
  id: string | undefined,
  options?: Pick<UseQueryOptions<MissionWithRequester>, 'refetchInterval'>
) {
  return useQuery({
    queryKey: ['mission', id],
    queryFn: () => fetchMission(id as string),
    enabled: !!id,
    ...options,
  });
}

export { MISSION_WITH_REQUESTER_SELECT, mapMissionWithRequester };
