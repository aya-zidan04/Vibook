import type { ExperienceItem } from '@/types';

export const MOCK_EXPERIENCES: ExperienceItem[] = [
  {
    id: 'xp1',
    title: 'Desert stargazing & astronomy',
    categoryId: 'cat7',
    cityId: 'c3',
    imageUrl:
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=85&auto=format&fit=crop',
    durationHours: 5,
    priceFrom: 420,
    currency: 'AED',
    rating: 4.95,
    badge: 'exclusive',
  },
  {
    id: 'xp2',
    title: 'Private yacht sunset cruise',
    categoryId: 'cat7',
    cityId: 'c2',
    imageUrl:
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=85&auto=format&fit=crop',
    durationHours: 3,
    priceFrom: 890,
    currency: 'SAR',
    rating: 4.8,
    badge: 'limited',
  },
];
