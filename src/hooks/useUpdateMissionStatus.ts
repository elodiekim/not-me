import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../services/supabase';
import type { MissionStatus } from '../types/Mission';

export function useUpdateMissionStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ missionId, status }: { missionId: string; status: MissionStatus }) => {
      const { error } = await supabase.from('missions').update({ status }).eq('id', missionId);
      if (error) throw error;
    },
    onSuccess: (_data, { missionId }) => {
      queryClient.invalidateQueries({ queryKey: ['mission', missionId] });
    },
  });
}
