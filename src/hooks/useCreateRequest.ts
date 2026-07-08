import { useMutation } from '@tanstack/react-query';
import { supabase } from '../services/supabase';
import { useAuthStore } from '../stores/useAuthStore';
import type { Mission, MissionCategory } from '../types/Mission';

interface CreateRequestInput {
  category: MissionCategory;
  rewardAmount: number;
}

export function useCreateRequest() {
  const userId = useAuthStore((state) => state.session?.user.id);

  return useMutation({
    mutationFn: async ({ category, rewardAmount }: CreateRequestInput): Promise<Mission> => {
      if (!userId) throw new Error('Not signed in.');

      const { data, error } = await supabase
        .from('missions')
        .insert({
          requester_id: userId,
          category,
          reward_amount: rewardAmount,
          // No address input in the app yet (P2 · location work) — placeholder until then.
          address: 'Address pending · 주소 입력 예정',
        })
        .select('id, requester_id, hero_id, category, reward_amount, status, address, created_at, updated_at')
        .single();

      if (error) throw error;

      return {
        id: data.id,
        requesterId: data.requester_id,
        heroId: data.hero_id,
        category: data.category,
        rewardAmount: data.reward_amount,
        status: data.status,
        address: data.address,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    },
  });
}
