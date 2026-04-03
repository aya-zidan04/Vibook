/** User listing ratings (1–5 stars), persisted locally via `userRatingsStore`. */
import { ratingKey, useUserRatingsStore, type RatingVertical } from '@/store/userRatingsStore';

export type { RatingVertical };
export { ratingKey };

export function useUserListingRating(vertical: RatingVertical, refId: string) {
  const key = ratingKey(vertical, refId);
  const value = useUserRatingsStore((s) => s.ratings[key] ?? 0);
  const setRating = useUserRatingsStore((s) => s.setRating);

  return {
    value,
    setStars: (stars: number | null) => setRating(key, stars),
  } as const;
}
