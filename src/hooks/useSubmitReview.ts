import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../services/supabase';
import { useAuthStore } from '../stores/useAuthStore';

interface SubmitReviewInput {
  missionId: string;
  heroId: string;
  rating: number;
  comment: string;
}

export function useSubmitReview() {
  const userId = useAuthStore((state) => state.session?.user.id);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ missionId, heroId, rating, comment }: SubmitReviewInput) => {
      if (!userId) throw new Error('Not signed in.');

      const { error } = await supabase.from('reviews').insert({
        mission_id: missionId,
        reviewer_id: userId,
        hero_id: heroId,
        rating,
        comment: comment.trim() || null,
      });

      if (error) throw error;
    },
    onSuccess: (_data, { missionId, heroId }) => {
      queryClient.invalidateQueries({ queryKey: ['mission', missionId] });
      queryClient.invalidateQueries({ queryKey: ['missionHistory'] });
      queryClient.invalidateQueries({ queryKey: ['reviews', 'received', heroId] });
      // hero_rating/hero_review_count are recalculated server-side by a trigger
      // on insert, so the hero's own profile view is stale until this refetches.
      queryClient.invalidateQueries({ queryKey: ['profile', heroId] });
    },
  });
}
