import type { Restaurant } from '@/types';

export const MOCK_RESTAURANTS: Restaurant[] = [
  {
    id: 'r1',
    name: 'Wild Jordan Café',
    cuisineIds: ['cat2'],
    cityId: 'gov-amman',
    imageUrl:
      'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=85&auto=format&fit=crop',
    priceLevel: 4,
    rating: 4.9,
    reviewCount: 2100,
    badge: 'popular',
  },
  {
    id: 'r2',
    name: 'Irbid House Kitchen',
    cuisineIds: ['cat2'],
    cityId: 'gov-irbid',
    imageUrl:
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db1?w=800&q=85&auto=format&fit=crop',
    priceLevel: 3,
    rating: 4.7,
    reviewCount: 980,
    badge: 'new',
  },
];
