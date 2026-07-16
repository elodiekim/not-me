import { useQuery } from '@tanstack/react-query';
import { supabase } from '../services/supabase';
import { useAuthStore } from '../stores/useAuthStore';
import type { MissionStatus } from '../types/Mission';

// A requester's mission is "active" while it's still in flight — one of these.
// Used to block a second request while one is already going (see RequestScreen).
const ACTIVE_STATUSES: MissionStatus[] = ['requested', 'accepted', 'on_the_way'];

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
