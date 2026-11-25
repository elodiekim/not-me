import { useQuery } from '@tanstack/react-query';
import { supabase } from '../services/supabase';
import { useAuthStore } from '../stores/useAuthStore';
import type { Profile } from '../types/Profile';

async function fetchProfile(userId: string): Promise<Profile> {
  // phone lives in profile_private (0035) — any authenticated user could
  // read any other user's phone when it was a plain profiles column, since
  // RLS can't restrict one column out of an otherwise-public row.
  // profile_private.id is a real FK to profiles.id, so this embeds cleanly;
  // it's a single object (or null), not an array, for the same reason the
  // reviews embed elsewhere is — a primary-key FK is inherently one-to-one.
  const { data, error } = await supabase
    .from('profiles')
    .select(
      'id, name, avatar_url, hero_rating, hero_review_count, is_active, hero_approved, created_at, updated_at, profile_private(phone)',
    )
    .eq('id', userId)
    .single();

  if (error) throw error;

  // Supabase's untyped client infers every embed as an array by default —
  // it has no way to know profile_private.id is a unique FK (same reason
  // the reviews embed elsewhere needs the same kind of cast).
  const profilePrivate = data.profile_private as unknown as { phone: string | null } | null;

  return {
    id: data.id,
    name: data.name,
    phone: profilePrivate?.phone ?? null,
    avatarUrl: data.avatar_url,
    heroRating: data.hero_rating,
    heroReviewCount: data.hero_review_count,
    isActive: data.is_active,
    heroApproved: data.hero_approved,
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
