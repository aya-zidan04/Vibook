import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { addFavorite, removeFavorite } from '@/api/favoritesApi';
import { getTokensSync } from '@/api/authSession';
import { ratingKey, type RatingVertical } from '@/store/userRatingsStore';

export type FavoriteListEntry = { type: string; refId: string };

type FavoritesState = {
  /** Keys `{vertical}:{refId}` — same shape as {@link ratingKey}. */
  keys: Record<string, true>;
  listHydrating: boolean;
  toggleFavorite: (type: RatingVertical, refId: string) => Promise<void>;
  hasFavorite: (type: RatingVertical, refId: string) => boolean;
  listEntries: () => FavoriteListEntry[];
  setListHydrating: (v: boolean) => void;
  reset: () => void;
};

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      keys: {},
      listHydrating: false,
      toggleFavorite: async (type, refId) => {
        const key = ratingKey(type, refId);
        const was = !!get().keys[key];
        const numericEvent = type === 'event' && /^\d+$/.test(refId);
        if (!numericEvent || !getTokensSync()?.accessToken) {
          return;
        }
        const eventId = Number(refId);
        try {
          if (was) {
            await removeFavorite(eventId);
          } else {
            await addFavorite(eventId);
          }
          set((s) => {
            const k = { ...s.keys };
            if (was) delete k[key];
            else k[key] = true;
            return { keys: k };
          });
        } catch {
          /* leave state unchanged */
        }
      },
      hasFavorite: (type, refId) => !!get().keys[ratingKey(type, refId)],
      listEntries: () =>
        Object.keys(get().keys).map((key) => {
          const colon = key.indexOf(':');
          return {
            type: colon >= 0 ? key.slice(0, colon) : key,
            refId: colon >= 0 ? key.slice(colon + 1) : '',
          };
        }),
      setListHydrating: (v) => set({ listHydrating: v }),
      reset: () => set({ keys: {}, listHydrating: false }),
    }),
    {
      name: 'vibook-favorites',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ keys: s.keys }),
    },
  ),
);
