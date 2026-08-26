import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../services/supabase';
import type { MissionCancelledReason, MissionStatus } from '../types/Mission';

export function useUpdateMissionStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      missionId,
      status,
      fromStatus,
      cancelledReason,
    }: {
      missionId: string;
      status: MissionStatus;
      // Only update while the mission is still in this status — matches 0 rows
      // (no error) if it changed in the meantime, same guard as useAcceptMission.
      fromStatus?: MissionStatus;
      // Required in practice whenever status is 'cancelled' — see 0018. Not typed
      // as conditionally required so every existing call site isn't forced to
      // handle a type error at once; MissionScreen/SearchingScreen/
      // MissionsTabScreen all pass it now.
      cancelledReason?: Exclude<MissionCancelledReason, null>;
    }) => {
      const update: { status: MissionStatus; cancelled_reason?: MissionCancelledReason } = {
        status,
      };
      if (cancelledReason) update.cancelled_reason = cancelledReason;
      let query = supabase.from('missions').update(update).eq('id', missionId);
      if (fromStatus) query = query.eq('status', fromStatus);
      const { error } = await query;
      if (error) throw error;
    },
    onSuccess: (_data, { missionId }) => {
      queryClient.invalidateQueries({ queryKey: ['mission', missionId] });
      queryClient.invalidateQueries({ queryKey: ['missionHistory'] });
    },
  });
}
