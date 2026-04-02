/**
 * User listing ratings (1–5 stars).
 *
 * Current implementation: device-local persistence via `userRatingsStore`.
 * For backend integration, keep `useUserListingRating` as the UI boundary and
 * either replace the hook body with API-backed state or sync the store from
 * `GET /me/ratings` and mirror writes to `POST`/`DELETE` as needed.
 */
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
