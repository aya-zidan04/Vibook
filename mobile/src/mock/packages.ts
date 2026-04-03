import type { TravelPackage } from '@/types';

export const MOCK_PACKAGES: TravelPackage[] = [
  {
    id: 'p1',
    title: 'Aqaba weekend — diving & reef',
    cityIds: ['gov-aqaba'],
    imageUrl:
      'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=800&q=85&auto=format&fit=crop',
    nights: 4,
    priceFrom: 320,
    currency: 'JOD',
    badge: 'limited',
  },
  {
    id: 'p2',
    title: 'Petra & Wadi Rum escape',
    cityIds: ['gov-maan'],
    imageUrl:
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=85&auto=format&fit=crop',
    nights: 3,
    priceFrom: 280,
    currency: 'JOD',
    badge: 'exclusive',
  },
];
