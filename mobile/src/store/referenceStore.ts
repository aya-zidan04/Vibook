import { create } from 'zustand';
import { isApiConfigured } from '@/config/api';
import { referenceApi } from '@/services/api/referenceApi';
import {
  mapCategoryDto,
  mapCityDto,
} from '@/services/reference/mapReference';
import type { Category, City } from '@/types';
import { useAppStore } from '@/store/appStore';
import { formatApiErrorMessage } from '@/utils/apiError';

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
    setSelectedCityId(cities[0].id);
  }
}

export const useReferenceStore = create<ReferenceState>((set) => ({
  cities: [],
  categories: [],
  status: 'idle',
  errorMessage: null,
  load: async () => {
    if (!isApiConfigured()) {
      set({ status: 'idle', errorMessage: null });
      return;
    }
    set({ status: 'loading', errorMessage: null });
    try {
      const [cityDtos, categoryDtos] = await Promise.all([
        referenceApi.listCities(),
        referenceApi.listCategories(),
      ]);
      const cities = cityDtos.map(mapCityDto);
      const categories = categoryDtos.map(mapCategoryDto);
      ensureValidSelectedCity(cities);
      set({
        cities,
        categories,
        status: 'ready',
        errorMessage: null,
      });
    } catch (e) {
      set({
        status: 'error',
        errorMessage: formatApiErrorMessage(e),
        cities: [],
        categories: [],
      });
    }
  },
}));

export function loadReferenceData(): Promise<void> {
  return useReferenceStore.getState().load();
}
