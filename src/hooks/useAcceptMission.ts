import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../services/supabase';
import { useAuthStore } from '../stores/useAuthStore';

export function useAcceptMission() {
  const userId = useAuthStore((state) => state.session?.user.id);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (missionId: string) => {
      if (!userId) throw new Error('Not signed in.');

      const { error, count } = await supabase
        .from('missions')
        .update({ hero_id: userId, status: 'accepted' }, { count: 'exact' })
        .eq('id', missionId)
        .eq('status', 'requested');

      if (error) throw error;
      if (!count) throw new Error('This mission was already accepted by someone else.');
    },
    onSuccess: (_data, missionId) => {
      queryClient.invalidateQueries({ queryKey: ['mission', missionId] });
      queryClient.invalidateQueries({ queryKey: ['nearbyMissions'] });
    },
  });
}
