import { create } from 'zustand';
import { listCategories } from '@/api/categoriesApi';
import { listActiveGovernorates } from '@/api/governoratesApi';
import type { Category } from '@/types';
import type { City } from '@/types';
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
    const fallback = cities[0]?.id ?? '1';
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
      const [govs, cats] = await Promise.all([listActiveGovernorates(), listCategories()]);
      const cities: City[] = govs.map((g) => ({
        id: String(g.id),
        nameEn: g.name,
        nameAr: g.name,
        country: 'Jordan',
      }));
      const categories: Category[] = cats
        .filter((c) => c.active)
        .map((c) => ({
          id: String(c.id),
          slug: c.slug,
          labelEn: c.name,
          labelAr: c.name,
          icon: c.icon || 'pricetag-outline',
        }));
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
