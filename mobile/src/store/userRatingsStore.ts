import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type RatingVertical =
  | 'event'
  | 'restaurant'
  | 'experience'
  | 'stay'
  | 'organizer'
  | 'package'
  | 'flight';

export function ratingKey(vertical: RatingVertical, id: string): string {
  return `${vertical}:${id}`;
}

type State = {
  /** User’s 1–5 star ratings per listing (persisted locally). */
  ratings: Record<string, number>;
  setRating: (key: string, stars: number | null) => void;
  mergeServerRatings: (server: Record<string, number>) => void;
};

export const useUserRatingsStore = create<State>()(
  persist(
    (set) => ({
      ratings: {},
      setRating: (key, stars) => {
        set((s) => {
          const next = { ...s.ratings };
          if (stars == null || stars < 1) {
            delete next[key];
          } else {
            next[key] = Math.min(5, Math.max(1, Math.round(stars)));
          }
          return { ratings: next };
        });
      },
      mergeServerRatings: (server) =>
        set((s) => ({
          ratings: { ...s.ratings, ...server },
        })),
    }),
    {
      name: 'vibook-user-ratings',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ ratings: s.ratings }),
    },
  ),
);
