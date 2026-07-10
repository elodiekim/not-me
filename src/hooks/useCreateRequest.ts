import { useMutation } from '@tanstack/react-query';
import { supabase } from '../services/supabase';
import { useAuthStore } from '../stores/useAuthStore';
import type { Mission, MissionCategory } from '../types/Mission';

interface CreateRequestInput {
  category: MissionCategory;
  rewardAmount: number;
  address: string;
  latitude: number | null;
  longitude: number | null;
}

export function useCreateRequest() {
  const userId = useAuthStore((state) => state.session?.user.id);

  return useMutation({
    mutationFn: async ({
      category,
      rewardAmount,
      address,
      latitude,
      longitude,
    }: CreateRequestInput): Promise<Mission> => {
      if (!userId) throw new Error('Not signed in.');

      const { data, error } = await supabase
        .from('missions')
        .insert({
          requester_id: userId,
          category,
          reward_amount: rewardAmount,
          address,
          latitude,
          longitude,
        })
        .select(
          'id, requester_id, hero_id, category, reward_amount, status, address, latitude, longitude, created_at, updated_at'
        )
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
        latitude: data.latitude,
        longitude: data.longitude,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    },
  });
}
