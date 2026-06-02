import { JORDAN_GOVERNORATES } from '@/constants/jordanGovernorates';
import type { City } from '@/types';

/** Offline fallback governorates (slug ids) when the API is unavailable. */
export const MOCK_CITIES: City[] = JORDAN_GOVERNORATES.map((g, index) => ({
  id: `gov-${g.slug}`,
  slug: g.slug,
  nameEn: g.en,
  nameAr: g.ar,
  country: 'Jordan',
  displayOrder: index + 1,
  active: true,
}));
