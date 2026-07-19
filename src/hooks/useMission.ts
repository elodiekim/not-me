import { useQuery, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '../services/supabase';
import type { Mission } from '../types/Mission';

export interface MissionWithRequester extends Mission {
  requesterName: string;
  heroName: string | null;
  heroAvatarUrl: string | null;
  heroRating: number | null;
  heroReviewCount: number;
  hasReview: boolean;
}

const MISSION_WITH_REQUESTER_SELECT =
  'id, requester_id, hero_id, category, reward_amount, status, address, latitude, longitude, created_at, updated_at, ' +
  'requester:profiles!missions_requester_id_fkey(name), ' +
  'hero:profiles!missions_hero_id_fkey(name, avatar_url, hero_rating, hero_review_count), ' +
  'reviews(id)';

function mapMissionWithRequester(row: any): MissionWithRequester {
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
    requesterName: row.requester?.name ?? 'Someone nearby',
    heroName: row.hero?.name ?? null,
    heroAvatarUrl: row.hero?.avatar_url ?? null,
    heroRating: row.hero?.hero_rating ?? null,
    heroReviewCount: row.hero?.hero_review_count ?? 0,
    // reviews.mission_id is unique, so PostgREST embeds this as a single
    // object (or null), not an array, even though it reads like a to-many.
    hasReview: row.reviews != null,
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
  const queryClient = useQueryClient();

  // Realtime: push-based updates via WebSocket. When this mission's row changes,
  // invalidate the query so fetchMission re-runs with the requester/hero joins
  // (the payload has no joined data, so we can't fill the cache from it directly).
  // Polling still runs via refetchInterval as a safety net if the socket drops.
  useEffect(() => {
    if (!id) return;

    const channel = supabase
      .channel(`mission-${id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'missions', filter: `id=eq.${id}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ['mission', id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, queryClient]);

  return useQuery({
    queryKey: ['mission', id],
    queryFn: () => fetchMission(id as string),
    enabled: !!id,
    ...options,
  });
}

export { MISSION_WITH_REQUESTER_SELECT, mapMissionWithRequester };
