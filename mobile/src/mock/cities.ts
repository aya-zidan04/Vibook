import { JORDAN_GOVERNORATES } from '@/constants/jordanGovernorates';
import type { City } from '@/types';

/** Mock reference catalog: Jordan governorates (ids `gov-{slug}`). */
export const MOCK_CITIES: City[] = JORDAN_GOVERNORATES.map((g) => ({
  id: `gov-${g.slug}`,
  nameEn: g.en,
  nameAr: g.ar,
  country: 'Jordan',
}));
