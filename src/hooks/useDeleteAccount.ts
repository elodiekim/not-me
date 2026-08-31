import { useMutation } from '@tanstack/react-query';
import { supabase } from '../services/supabase';
import { useAuthStore } from '../stores/useAuthStore';

// Soft-delete: sets is_active = false (see 0019). deactivated_reason is set
// server-side by the trigger, not sent from here — see that migration for why.
// Signs out immediately after so the app doesn't wait for AuthGate's own
// profile-refetch to notice; AuthGate still catches it independently if this
// signOut is ever interrupted (e.g. the app closing mid-flow).
export function useDeleteAccount() {
  const userId = useAuthStore((state) => state.session?.user.id);

  return useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error('Not signed in.');

      const { error } = await supabase
        .from('profiles')
        .update({ is_active: false })
        .eq('id', userId);
      if (error) throw error;

      await supabase.auth.signOut();
    },
  });
}
