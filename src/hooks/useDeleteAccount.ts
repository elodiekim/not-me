import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../services/supabase';
import { useAuthStore } from '../stores/useAuthStore';

// Soft-delete: sets is_active = false (see 0019). deactivated_reason is set
// server-side by the trigger, not sent from here — see that migration for why.
//
// Does NOT sign out here. AuthGate is the single place watching is_active
// globally (it has to be — an admin can disable someone mid-session too, not
// only in response to their own action) — an earlier version also signed out
// directly from this mutation, which raced ahead of AuthGate: the session
// went null before AuthGate ever got to see is_active = false with a session
// still attached, so its "you were deactivated" redirect to /account-deleted
// never fired — it just saw "no session" and bounced to the plain sign-in
// screen instead, one path silently overriding the other.
export function useDeleteAccount() {
  const userId = useAuthStore((state) => state.session?.user.id);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error('Not signed in.');

      const { error } = await supabase
        .from('profiles')
        .update({ is_active: false })
        .eq('id', userId);
      if (error) throw error;
    },
    onSuccess: () => {
      // So AuthGate's useProfile() sees the change immediately instead of
      // waiting for whatever incidentally triggers its next refetch.
      queryClient.invalidateQueries({ queryKey: ['profile', userId] });
    },
  });
}
