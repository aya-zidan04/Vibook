import { create } from 'zustand';
import { listCategories } from '@/api/categoriesApi';
import { listActiveGovernorates } from '@/api/governoratesApi';
import { MOCK_CATEGORIES } from '@/mock/categories';
import type { Category } from '@/types';
import type { City } from '@/types';
import { useAppStore } from '@/store/appStore';
import {
  categoriesFromApi,
  fallbackCategories,
  mergeCategoriesWithFallback,
} from '@/utils/categoryLabels';
import {
  cityIdToGovernorateSlug,
  fallbackGovernorateCities,
  governoratesFromApiRows,
} from '@/utils/governorateLabels';

type ReferenceStatus = 'idle' | 'loading' | 'ready' | 'error';

type ReferenceState = {
  /** Governorates from API or fallback (same as {@link cities}). */
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

  setSelectedCityId(cities[0]?.id ?? '1');
}

function applyGovernorates(cities: City[]): Pick<ReferenceState, 'governorates' | 'cities'> {
  return { governorates: cities, cities };
}

const initialGovernorates = fallbackGovernorateCities();

export const useReferenceStore = create<ReferenceState>((set, get) => ({
  ...applyGovernorates(initialGovernorates),
  categories: fallbackCategories(),
  status: 'idle',
  governoratesFromApi: false,
  categoriesFromApi: false,
  catalogFromApi: false,
  load: async () => {
    if (get().status === 'loading') return;
    set({ status: 'loading' });

    const fallbackCats = fallbackCategories();
    let governorates = fallbackGovernorateCities();
    let categories: Category[] = fallbackCats;
    let governoratesFromApiFlag = false;
    let categoriesFromApiFlag = false;
    let hadError = false;

    const [govsResult, catsResult] = await Promise.allSettled([
      listActiveGovernorates(),
      listCategories(),
    ]);

    if (govsResult.status === 'fulfilled') {
      const fromApi = governoratesFromApiRows(govsResult.value);
      if (fromApi.length > 0) {
        governorates = fromApi;
        ensureValidSelectedCity(governorates);
        governoratesFromApiFlag = true;
        if (__DEV__) {
          console.log(
            '[referenceStore] governorates loaded from API:',
            fromApi.length,
            fromApi.map((g) => ({ id: g.id, nameEn: g.nameEn, nameAr: g.nameAr })),
          );
        }
      } else {
        hadError = true;
        if (__DEV__) {
          console.warn('[referenceStore] governorates API returned empty — using fallback');
        }
      }
    } else {
      hadError = true;
      if (__DEV__) {
        console.warn('[referenceStore] governorates API failed — using fallback', govsResult.reason);
      }
    }

    if (catsResult.status === 'fulfilled') {
      categories = mergeCategoriesWithFallback(categoriesFromApi(catsResult.value));
      categoriesFromApiFlag = categories.some((c) => /^\d+$/.test(c.id));
      if (__DEV__ && categoriesFromApiFlag) {
        console.log('[referenceStore] categories loaded from API:', categories.length);
      }
    } else {
      hadError = true;
      if (__DEV__) {
        console.warn('[referenceStore] categories API failed — using fallback', catsResult.reason);
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
