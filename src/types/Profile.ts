export interface Profile {
  id: string;
  name: string;
  phone: string | null;
  avatarUrl: string | null;
  heroRating: number | null;
  heroReviewCount: number;
  isActive: boolean;
  heroApproved: boolean;
  createdAt: string;
  updatedAt: string;
}
