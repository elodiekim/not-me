import { useQuery } from '@tanstack/react-query';
import { supabase } from '../services/supabase';
import { useAuthStore } from '../stores/useAuthStore';
import type { MissionStatus } from '../types/Mission';

// A requester's mission is "active" while it's still in flight — one of these.
// Used to block a second request while one is already going (RequestScreen and
// ConfirmLocationScreen). 'arrived' counts too: the hero is literally at the
// door, which is the last moment a second request would make sense.
const ACTIVE_STATUSES: MissionStatus[] = ['requested', 'accepted', 'on_the_way', 'arrived'];

export interface ActiveMission {
  id: string;
  status: MissionStatus;
}

async function fetchActiveMission(userId: string): Promise<ActiveMission | null> {
  const { data, error } = await supabase
    .from('missions')
    .select('id, status')
    .eq('requester_id', userId)
    .in('status', ACTIVE_STATUSES)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return { id: data.id, status: data.status };
}

export function useActiveMission() {
  const userId = useAuthStore((state) => state.session?.user.id);

  return useQuery({
    queryKey: ['activeMission', userId],
    queryFn: () => fetchActiveMission(userId as string),
    enabled: !!userId,
  });
}
