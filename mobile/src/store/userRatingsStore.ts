import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { isApiConfigured } from '@/config/api';
import { useAppStore } from '@/store/appStore';
import { meRatingsApi } from '@/services/api/meRatingsApi';

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

function refIdFromRatingKey(key: string): string {
  const colon = key.indexOf(':');
  return colon >= 0 ? key.slice(colon + 1) : '';
}

function scheduleRatingSync(key: string, stars: number | null): void {
  if (!isApiConfigured() || !useAppStore.getState().isAuthenticated) return;
  const colon = key.indexOf(':');
  if (colon <= 0) return;
  const vertical = key.slice(0, colon);
  const refId = Number(key.slice(colon + 1));
  if (!Number.isFinite(refId)) return;
  void meRatingsApi.put(vertical, refId, stars).catch(() => {});
}

type State = {
  /** User’s 1–5 star ratings per listing (persisted; synced when API is configured). */
  ratings: Record<string, number>;
  setRating: (key: string, stars: number | null) => void;
  /**
   * Merge server ratings with local entries whose ref id is non-numeric (mock routes like `e1`)
   * so mock-only ratings survive login hydration.
   */
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
        queueMicrotask(() => scheduleRatingSync(key, stars == null || stars < 1 ? null : Math.min(5, Math.max(1, Math.round(stars)))));
      },
      mergeServerRatings: (server) =>
        set((s) => {
          const kept: Record<string, number> = {};
          for (const [k, v] of Object.entries(s.ratings)) {
            if (!/^\d+$/.test(refIdFromRatingKey(k))) kept[k] = v;
          }
          return { ratings: { ...kept, ...server } };
        }),
    }),
    {
      name: 'vibook-user-ratings',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ ratings: s.ratings }),
    },
  ),
);
