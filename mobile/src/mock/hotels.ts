import type { Hotel } from '@/types';

export const MOCK_HOTELS: Hotel[] = [
  {
    id: 'h1',
    name: 'Ayla Lagoon Suites',
    cityId: 'gov-aqaba',
    imageUrl:
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=85&auto=format&fit=crop',
    stars: 5,
    priceFrom: 120,
    currency: 'JOD',
    rating: 4.85,
    badge: 'popular',
  },
  {
    id: 'h2',
    name: 'Rainbow Street Inn',
    cityId: 'gov-amman',
    imageUrl:
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=85&auto=format&fit=crop',
    stars: 4,
    priceFrom: 75,
    currency: 'JOD',
    rating: 4.6,
  },
];
