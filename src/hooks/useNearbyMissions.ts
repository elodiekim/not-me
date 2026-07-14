import { useQuery } from '@tanstack/react-query';
import { supabase } from '../services/supabase';
import { useAuthStore } from '../stores/useAuthStore';
import { MISSION_WITH_REQUESTER_SELECT, mapMissionWithRequester } from './useMission';

async function fetchNearbyMissions(userId?: string) {
  let query = supabase
    .from('missions')
    .select(MISSION_WITH_REQUESTER_SELECT)
    .eq('status', 'requested')
    .order('created_at', { ascending: false });

  if (userId) query = query.neq('requester_id', userId);

  const { data, error } = await query;

  if (error) throw error;

  return data.map(mapMissionWithRequester);
}

export function useNearbyMissions() {
  const userId = useAuthStore((state) => state.session?.user.id);

  return useQuery({
    queryKey: ['nearbyMissions', userId],
    queryFn: () => fetchNearbyMissions(userId),
  });
}
