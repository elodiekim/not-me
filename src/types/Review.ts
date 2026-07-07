/**
 * Reviews are one-directional (User -> Hero only). See PRODUCT.md "Trust & Reviews".
 */
export interface Review {
  id: string;
  missionId: string;
  reviewerId: string;
  heroId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
}
