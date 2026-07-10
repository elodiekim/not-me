import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../services/supabase';
import type { MissionStatus } from '../types/Mission';

export function useUpdateMissionStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      missionId,
      status,
      fromStatus,
    }: {
      missionId: string;
      status: MissionStatus;
      // Only update while the mission is still in this status — matches 0 rows
      // (no error) if it changed in the meantime, same guard as useAcceptMission.
      fromStatus?: MissionStatus;
    }) => {
      let query = supabase.from('missions').update({ status }).eq('id', missionId);
      if (fromStatus) query = query.eq('status', fromStatus);
      const { error } = await query;
      if (error) throw error;
    },
    onSuccess: (_data, { missionId }) => {
      queryClient.invalidateQueries({ queryKey: ['mission', missionId] });
    },
  });
}
