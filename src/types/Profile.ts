export interface Profile {
  id: string;
  name: string;
  avatarUrl: string | null;
  heroRating: number | null;
  heroReviewCount: number;
  createdAt: string;
  updatedAt: string;
}
