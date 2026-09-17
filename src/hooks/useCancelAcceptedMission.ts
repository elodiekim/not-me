import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../services/supabase';
import { useAuthStore } from '../stores/useAuthStore';

// Lets a hero back out of a mission they already accepted — resets it back to an
// open request (status='requested', hero_id=null) so it re-enters the nearby pool
// for another hero. Enforced by the "Hero can back out of an accepted mission" RLS
// policy (0011); .eq('hero_id', userId) here is just a client-side guard, not the
// actual authorization boundary.
export function useCancelAcceptedMission() {
  const userId = useAuthStore((state) => state.session?.user.id);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (missionId: string) => {
      if (!userId) throw new Error('Not signed in.');

      const { error, count } = await supabase
        .from('missions')
        .update({ status: 'requested', hero_id: null }, { count: 'exact' })
        .eq('id', missionId)
        .eq('hero_id', userId);

      if (error) throw error;
      // 0 rows means the mission moved on before this landed — completed out from
      // under the hero, or already reset by something else. Silently "succeeding"
      // here was the other half of a race with ActiveMissionScreen's Complete
      // button: both this and the completion update could fire concurrently, and
      // without a count check either one looked like it worked regardless of
      // which the database actually kept.
      if (!count) {
        throw new Error('Mission could not be backed out of (it may have already finished).');
      }
    },
    onSuccess: (_data, missionId) => {
      queryClient.invalidateQueries({ queryKey: ['mission', missionId] });
      queryClient.invalidateQueries({ queryKey: ['missionHistory'] });
      queryClient.invalidateQueries({ queryKey: ['nearbyMissions'] });
    },
  });
}
