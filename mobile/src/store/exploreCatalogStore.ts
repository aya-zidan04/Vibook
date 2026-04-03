import { create } from 'zustand';
import { isApiConfigured } from '@/config/api';
import { catalogReadApi } from '@/services/api/catalogReadApi';
import type { ExperienceDto, OfferDto, PackageDto } from '@/services/api/catalogReadApi';
import { eventDtoToEventItem, parseCityIdForCatalog } from '@/services/catalog/mapCatalog';
import type { EventItem } from '@/types';
import { useAppStore } from '@/store/appStore';
import { formatApiErrorMessage } from '@/utils/apiError';

type CatalogStatus = 'idle' | 'loading' | 'ready' | 'error';

type ExploreCatalogState = {
  status: CatalogStatus;
  errorMessage: string | null;
  events: EventItem[];
  offers: OfferDto[];
  experiences: ExperienceDto[];
  packages: PackageDto[];
  load: () => Promise<void>;
};

export const useExploreCatalogStore = create<ExploreCatalogState>((set) => ({
  status: 'idle',
  errorMessage: null,
  events: [],
  offers: [],
  experiences: [],
  packages: [],
  load: async () => {
    if (!isApiConfigured()) {
      set({ status: 'idle', errorMessage: null, events: [], offers: [], experiences: [], packages: [] });
      return;
    }
    const cityId = parseCityIdForCatalog(useAppStore.getState().selectedCityId);
    set({ status: 'loading', errorMessage: null });
    try {
      const [evPage, ofPage, exPage, pkPage] = await Promise.all([
        catalogReadApi.listEvents({ page: 0, size: 24, cityId, sort: 'start_at_asc' }),
        catalogReadApi.listOffers({ page: 0, size: 8, sort: 'ends_asc' }),
        catalogReadApi.listExperiences({ page: 0, size: 8, cityId, sort: 'rating_desc' }),
        catalogReadApi.listPackages({ page: 0, size: 8, cityId, sort: 'title_asc' }),
      ]);
      set({
        status: 'ready',
        errorMessage: null,
        events: evPage.content.map(eventDtoToEventItem),
        offers: ofPage.content,
        experiences: exPage.content,
        packages: pkPage.content,
      });
    } catch (e) {
      set({
        status: 'error',
        errorMessage: formatApiErrorMessage(e),
        events: [],
        offers: [],
        experiences: [],
        packages: [],
      });
    }
  },
}));

export function loadExploreCatalog(): Promise<void> {
  return useExploreCatalogStore.getState().load();
}
