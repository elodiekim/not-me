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
      // Only update while the mission is still in this status.
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
      let query = supabase.from('missions').update(update, { count: 'exact' }).eq('id', missionId);
      if (fromStatus) query = query.eq('status', fromStatus);
      const { error, count } = await query;
      if (error) throw error;
      // A fromStatus filter matching 0 rows isn't an error to Supabase — it just
      // means nothing matched (mission already moved on, or an RLS restrictive
      // policy silently rejected it). Left unchecked, every caller here awaiting
      // this mutation would treat that as success: ActiveMissionScreen's
      // handleComplete found this the hard way — a hero backing out at the same
      // moment as completing could land the DB on 'requested' while the client
      // still navigated to "You earned $X!". Same fromStatus-race class of bug
      // useAcceptMission already guards against with its own count check.
      if (fromStatus && !count) {
        throw new Error(`Mission was not in the expected status (${fromStatus}).`);
      }
    },
    onSuccess: (_data, { missionId }) => {
      queryClient.invalidateQueries({ queryKey: ['mission', missionId] });
      queryClient.invalidateQueries({ queryKey: ['missionHistory'] });
    },
  });
}
