import type { useRouter } from 'expo-router';
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

// Both RequestScreen and ConfirmLocationScreen redirect here the same way, whenever
// their own useActiveMission guard finds a mission already in flight — which of the
// two catches it depends on how far the user got before the query resolved. A plain
// router.replace only swaps the current screen, so whichever one fires leaves
// whatever's still under it (Home, or Home -> Request -> Reward) in the back stack —
// back from Mission Status would land on Home in one case and Reward in the other.
// dismissTo('/') first collapses the whole Request flow down to Home regardless of
// how deep it was, then push lands on Mission Status on top of it — so back always
// goes to Home no matter which guard caught it.
export function goToActiveMission(router: ReturnType<typeof useRouter>, missionId: string) {
  router.dismissTo('/');
  router.push({ pathname: '/mission-status', params: { missionId } });
}
