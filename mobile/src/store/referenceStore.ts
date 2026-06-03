import { create } from 'zustand';
import { listCategories } from '@/api/categoriesApi';
import { listActiveGovernorates } from '@/api/governoratesApi';
import type { Category } from '@/types';
import type { City } from '@/types';
import { useAppStore } from '@/store/appStore';
import { categoriesFromApi } from '@/utils/categoryLabels';
import {
  cityIdToGovernorateSlug,
  governoratesFromApiRows,
} from '@/utils/governorateLabels';

type ReferenceStatus = 'idle' | 'loading' | 'ready' | 'error';

type ReferenceState = {
  /** Governorates from API (same as {@link cities}). */
  governorates: City[];
  cities: City[];
  categories: Category[];
  status: ReferenceStatus;
  governoratesFromApi: boolean;
  categoriesFromApi: boolean;
  /** True when both governorates and categories loaded from API. */
  catalogFromApi: boolean;
  load: () => Promise<void>;
};

function ensureValidSelectedCity(cities: City[]): void {
  if (cities.length === 0) return;
  const { selectedCityId, setSelectedCityId } = useAppStore.getState();
  if (cities.some((c) => c.id === selectedCityId)) return;

  const slug = cityIdToGovernorateSlug(selectedCityId);
  if (slug) {
    const bySlug = cities.find((c) => c.slug === slug);
    if (bySlug) {
      setSelectedCityId(bySlug.id);
      return;
    }
  }

  setSelectedCityId(cities[0]?.id ?? '');
}

function applyGovernorates(cities: City[]): Pick<ReferenceState, 'governorates' | 'cities'> {
  return { governorates: cities, cities };
}

export const useReferenceStore = create<ReferenceState>((set, get) => ({
  ...applyGovernorates([]),
  categories: [],
  status: 'idle',
  governoratesFromApi: false,
  categoriesFromApi: false,
  catalogFromApi: false,
  load: async () => {
    if (get().status === 'loading') return;
    set({ status: 'loading' });

    let governorates: City[] = [];
    let categories: Category[] = [];
    let governoratesFromApiFlag = false;
    let categoriesFromApiFlag = false;
    let hadError = false;

    const [govsResult, catsResult] = await Promise.allSettled([
      listActiveGovernorates(),
      listCategories(),
    ]);

    if (govsResult.status === 'fulfilled') {
      const fromApi = governoratesFromApiRows(govsResult.value);
      governorates = fromApi;
      governoratesFromApiFlag = fromApi.length > 0;
      if (fromApi.length > 0) {
        ensureValidSelectedCity(governorates);
      } else {
        hadError = true;
      }
      if (__DEV__) {
        console.log('[referenceStore] governorates from API:', fromApi.length);
      }
    } else {
      hadError = true;
      if (__DEV__) {
        console.warn('[referenceStore] governorates API failed', govsResult.reason);
      }
    }

    if (catsResult.status === 'fulfilled') {
      categories = categoriesFromApi(catsResult.value);
      categoriesFromApiFlag = categories.length > 0;
      if (categories.length === 0) {
        hadError = true;
      }
      if (__DEV__) {
        console.log('[referenceStore] categories from API:', categories.length);
      }
    } else {
      hadError = true;
      if (__DEV__) {
        console.warn('[referenceStore] categories API failed', catsResult.reason);
      }
    }

    const catalogFromApi = governoratesFromApiFlag && categoriesFromApiFlag;

    set({
      ...applyGovernorates(governorates),
      categories,
      governoratesFromApi: governoratesFromApiFlag,
      categoriesFromApi: categoriesFromApiFlag,
      catalogFromApi,
      status: hadError ? 'error' : 'ready',
    });
  },
}));

export function loadReferenceData(): Promise<void> {
  return useReferenceStore.getState().load();
}
