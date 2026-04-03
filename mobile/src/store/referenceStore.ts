import { create } from 'zustand';
import { MOCK_CATEGORIES } from '@/mock/categories';
import { MOCK_CITIES } from '@/mock/cities';
import type { Category, City } from '@/types';
import { useAppStore } from '@/store/appStore';

type ReferenceStatus = 'idle' | 'loading' | 'ready' | 'error';

type ReferenceState = {
  cities: City[];
  categories: Category[];
  status: ReferenceStatus;
  errorMessage: string | null;
  load: () => Promise<void>;
};

function ensureValidSelectedCity(cities: City[]): void {
  if (cities.length === 0) return;
  const { selectedCityId, setSelectedCityId } = useAppStore.getState();
  const ok = cities.some((c) => c.id === selectedCityId);
  if (!ok) {
    const fallback =
      cities.find((c) => c.id === 'gov-amman')?.id ?? cities[0].id;
    setSelectedCityId(fallback);
  }
}

export const useReferenceStore = create<ReferenceState>((set) => ({
  cities: [],
  categories: [],
  status: 'idle',
  errorMessage: null,
  load: async () => {
    set({ status: 'loading', errorMessage: null });
    try {
      const cities = [...MOCK_CITIES];
      const categories = [...MOCK_CATEGORIES];
      ensureValidSelectedCity(cities);
      set({
        cities,
        categories,
        status: 'ready',
        errorMessage: null,
      });
    } catch {
      set({
        status: 'error',
        errorMessage: 'Failed to load reference data',
        cities: [],
        categories: [],
      });
    }
  },
}));

export function loadReferenceData(): Promise<void> {
  return useReferenceStore.getState().load();
}
