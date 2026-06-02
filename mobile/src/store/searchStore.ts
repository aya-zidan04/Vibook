import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

const MAX_RECENT = 8;

export type SearchFilters = {
  categoryIds: string[];
  subcategoryIds: string[];
};

export const EMPTY_SEARCH_FILTERS: SearchFilters = {
  categoryIds: [],
  subcategoryIds: [],
};

type PersistedSearchSlice = {
  recentQueries?: string[];
  filters?: Partial<SearchFilters> & { quickFilters?: unknown };
};

type SearchState = {
  recentQueries: string[];
  filters: SearchFilters;
  addRecentQuery: (query: string) => void;
  removeRecentQuery: (query: string) => void;
  clearRecentQueries: () => void;
  setFilters: (filters: SearchFilters) => void;
  patchFilters: (patch: Partial<SearchFilters>) => void;
  resetFilters: () => void;
};

function normalizeQuery(q: string): string {
  return q.trim().replace(/\s+/g, ' ');
}

function normalizeFilters(raw: PersistedSearchSlice['filters']): SearchFilters {
  return {
    categoryIds: Array.isArray(raw?.categoryIds) ? raw.categoryIds : [],
    subcategoryIds: Array.isArray(raw?.subcategoryIds) ? raw.subcategoryIds : [],
  };
}

export const useSearchStore = create<SearchState>()(
  persist(
    (set, get) => ({
      recentQueries: [],
      filters: { ...EMPTY_SEARCH_FILTERS },
      addRecentQuery: (raw) => {
        const q = normalizeQuery(raw);
        if (q.length < 2) return;
        const prev = get().recentQueries.filter((x) => x.toLowerCase() !== q.toLowerCase());
        set({ recentQueries: [q, ...prev].slice(0, MAX_RECENT) });
      },
      removeRecentQuery: (raw) => {
        const q = normalizeQuery(raw);
        set({ recentQueries: get().recentQueries.filter((x) => x !== q) });
      },
      clearRecentQueries: () => set({ recentQueries: [] }),
      setFilters: (filters) => set({ filters }),
      patchFilters: (patch) =>
        set({
          filters: {
            ...get().filters,
            ...patch,
          },
        }),
      resetFilters: () => set({ filters: { ...EMPTY_SEARCH_FILTERS } }),
    }),
    {
      name: 'vibook-search',
      version: 2,
      migrate: (persistedState, version) => {
        const s = persistedState as PersistedSearchSlice | undefined;
        if (!s) return persistedState;
        if (version < 2) {
          return {
            ...s,
            filters: normalizeFilters(s.filters),
          };
        }
        return {
          ...s,
          filters: normalizeFilters(s.filters),
        };
      },
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        recentQueries: s.recentQueries,
        filters: s.filters,
      }),
    },
  ),
);
