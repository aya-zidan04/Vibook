import type { TravelPackage } from '@/types';

export const MOCK_PACKAGES: TravelPackage[] = [
  {
    id: 'p1',
    title: 'Maldives 5★ — 4 nights',
    cityIds: ['c3'],
    imageUrl:
      'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=800&q=85&auto=format&fit=crop',
    nights: 4,
    priceFrom: 6890,
    currency: 'USD',
    badge: 'limited',
  },
  {
    id: 'p2',
    title: 'AlUla heritage escape',
    cityIds: ['c1'],
    imageUrl:
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=85&auto=format&fit=crop',
    nights: 3,
    priceFrom: 2100,
    currency: 'SAR',
    badge: 'exclusive',
  },
];
