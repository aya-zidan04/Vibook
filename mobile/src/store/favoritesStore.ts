import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { isApiConfigured } from '@/config/api';
import { isNumericCatalogId } from '@/services/catalog/mapCatalog';
import { meFavoritesApi } from '@/services/api/meFavoritesApi';
import type { FavoriteResponseDto } from '@/services/api/types';
import { useAppStore } from '@/store/appStore';
import { ratingKey, type RatingVertical } from '@/store/userRatingsStore';

export type FavoriteListEntry = { type: string; refId: string };

function refIdFromKey(key: string): string {
  const i = key.indexOf(':');
  return i >= 0 ? key.slice(i + 1) : key;
}

function isNumericRefId(refId: string): boolean {
  return /^\d+$/.test(refId);
}

type FavoritesState = {
  /** Keys `{vertical}:{refId}` — same shape as {@link ratingKey}. */
  keys: Record<string, true>;
  /** True while first list fetch after login is in flight (favorites tab can show spinner). */
  listHydrating: boolean;
  /** Replace server-backed favorites (numeric ref ids) and keep mock-route keys (e.g. `event:e1`). */
  syncServerFavorites: (favorites: FavoriteResponseDto[]) => void;
  /** Optimistic toggle; syncs PUT/DELETE when API + numeric id. */
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
      syncServerFavorites: (favorites) => {
        set((s) => {
          const next: Record<string, true> = {};
          for (const k of Object.keys(s.keys)) {
            if (!isNumericCatalogId(refIdFromKey(k))) next[k] = true;
          }
          for (const f of favorites) {
            next[ratingKey(f.type as RatingVertical, String(f.refId))] = true;
          }
          return { keys: next };
        });
      },
      toggleFavorite: async (type, refId) => {
        const key = ratingKey(type, refId);
        const was = !!get().keys[key];
        const canRemote =
          isApiConfigured() && useAppStore.getState().isAuthenticated && isNumericCatalogId(refId);

        if (canRemote) {
          const id = Number(refId);
          set((s) => {
            const k = { ...s.keys };
            if (was) delete k[key];
            else k[key] = true;
            return { keys: k };
          });
          try {
            if (was) await meFavoritesApi.remove(type, id);
            else await meFavoritesApi.put(type, id);
          } catch {
            set((s) => {
              const k = { ...s.keys };
              if (was) k[key] = true;
              else delete k[key];
              return { keys: k };
            });
          }
          return;
        }

        set((s) => {
          const k = { ...s.keys };
          if (was) delete k[key];
          else k[key] = true;
          return { keys: k };
        });
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

export async function hydrateFavoritesFromApi(): Promise<void> {
  if (!isApiConfigured() || !useAppStore.getState().isAuthenticated) return;
  useFavoritesStore.getState().setListHydrating(true);
  try {
    const { favorites } = await meFavoritesApi.list();
    useFavoritesStore.getState().syncServerFavorites(favorites);
  } catch {
    /* keep merged local + any prior server keys */
  } finally {
    useFavoritesStore.getState().setListHydrating(false);
  }
}
