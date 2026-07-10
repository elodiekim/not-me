import { useQuery } from '@tanstack/react-query';
import { supabase } from '../services/supabase';
import { useAuthStore } from '../stores/useAuthStore';
import type { Profile } from '../types/Profile';

async function fetchProfile(userId: string): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, phone, avatar_url, hero_rating, hero_review_count, created_at, updated_at')
    .eq('id', userId)
    .single();

  if (error) throw error;

  return {
    id: data.id,
    name: data.name,
    phone: data.phone,
    avatarUrl: data.avatar_url,
    heroRating: data.hero_rating,
    heroReviewCount: data.hero_review_count,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export function useProfile() {
  const userId = useAuthStore((state) => state.session?.user.id);

  return useQuery({
    queryKey: ['profile', userId],
    queryFn: () => fetchProfile(userId as string),
    enabled: !!userId,
  });
}
