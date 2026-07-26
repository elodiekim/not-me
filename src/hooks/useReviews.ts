import { useQuery } from '@tanstack/react-query';
import { supabase } from '../services/supabase';

export interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  // The other party relative to the current view: the reviewer for a received
  // review, the hero for a written one.
  counterpartName: string;
}

// Same FK-embed pattern as useMission's join: reviews_*_id_fkey are the auto-named
// constraints from the reviews table's reviewer_id/hero_id references.
const REVIEW_SELECT =
  'id, rating, comment, created_at, ' +
  'reviewer:profiles!reviews_reviewer_id_fkey(name), ' +
  'hero:profiles!reviews_hero_id_fkey(name)';

function mapReview(row: any, counterpart: 'reviewer' | 'hero'): Review {
  return {
    id: row.id,
    rating: row.rating,
    comment: row.comment ?? null,
    createdAt: row.created_at,
    counterpartName: row[counterpart]?.name ?? 'Someone',
  };
}

async function fetchReceivedReviews(heroId: string): Promise<Review[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select(REVIEW_SELECT)
    .eq('hero_id', heroId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row) => mapReview(row, 'reviewer'));
}

async function fetchWrittenReviews(reviewerId: string): Promise<Review[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select(REVIEW_SELECT)
    .eq('reviewer_id', reviewerId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row) => mapReview(row, 'hero'));
}

// Reviews a hero has received (hero_id match). Used both for a specific hero's public
// trust page and for the current user's own "received" section.
export function useReceivedReviews(heroId: string | undefined) {
  return useQuery({
    queryKey: ['reviews', 'received', heroId],
    queryFn: () => fetchReceivedReviews(heroId as string),
    enabled: !!heroId,
  });
}

// Reviews the current user has written (reviewer_id match).
export function useWrittenReviews(reviewerId: string | undefined) {
  return useQuery({
    queryKey: ['reviews', 'written', reviewerId],
    queryFn: () => fetchWrittenReviews(reviewerId as string),
    enabled: !!reviewerId,
  });
}
