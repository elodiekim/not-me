export interface Profile {
  id: string;
  name: string;
  phone: string | null;
  avatarUrl: string | null;
  heroRating: number | null;
  heroReviewCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
