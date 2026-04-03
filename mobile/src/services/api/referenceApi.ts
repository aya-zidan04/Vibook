import { apiRequest } from '@/services/api/http';

export type CityDto = {
  id: number;
  nameEn: string;
  nameAr: string;
  country: string;
  imageUrl?: string | null;
};

export type CategoryDto = {
  id: number;
  slug: string;
  labelEn: string;
  labelAr: string;
  icon: string;
};

/** Matches {@code CuisineResponse} — for future restaurant filters. */
export type CuisineDto = {
  id: number;
  slug: string;
  labelEn: string;
  labelAr: string;
  icon?: string | null;
};

/** Public reference endpoints — backend returns a JSON array. */
export const referenceApi = {
  async listCities(): Promise<CityDto[]> {
    return apiRequest<CityDto[]>('/api/v1/cities');
  },

  async listCategories(): Promise<CategoryDto[]> {
    return apiRequest<CategoryDto[]>('/api/v1/categories');
  },

  async listCuisines(): Promise<CuisineDto[]> {
    return apiRequest<CuisineDto[]>('/api/v1/cuisines');
  },
};
