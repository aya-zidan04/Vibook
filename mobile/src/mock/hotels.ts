import type { Hotel } from '@/types';

export const MOCK_HOTELS: Hotel[] = [
  {
    id: 'h1',
    name: 'Velvet Sky Hotel',
    cityId: 'c3',
    imageUrl:
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=85&auto=format&fit=crop',
    stars: 5,
    priceFrom: 890,
    currency: 'AED',
    rating: 4.85,
    badge: 'popular',
  },
  {
    id: 'h2',
    name: 'Oasis Boutique',
    cityId: 'c1',
    imageUrl:
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=85&auto=format&fit=crop',
    stars: 4,
    priceFrom: 520,
    currency: 'SAR',
    rating: 4.6,
  },
];
