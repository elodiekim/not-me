import { useQuery } from '@tanstack/react-query';
import { supabase } from '../services/supabase';
import { MISSION_WITH_REQUESTER_SELECT, mapMissionWithRequester } from './useMission';

async function fetchNearbyMissions() {
  const { data, error } = await supabase
    .from('missions')
    .select(MISSION_WITH_REQUESTER_SELECT)
    .eq('status', 'requested')
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data.map(mapMissionWithRequester);
}

export function useNearbyMissions() {
  return useQuery({
    queryKey: ['nearbyMissions'],
    queryFn: fetchNearbyMissions,
  });
}
