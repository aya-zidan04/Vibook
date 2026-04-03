import type { ExperienceItem } from '@/types';

export const MOCK_EXPERIENCES: ExperienceItem[] = [
  {
    id: 'xp1',
    title: 'Wadi Rum stargazing & camp',
    categoryId: 'cat7',
    cityId: 'gov-maan',
    imageUrl:
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=85&auto=format&fit=crop',
    durationHours: 5,
    priceFrom: 85,
    currency: 'JOD',
    rating: 4.95,
    badge: 'exclusive',
  },
  {
    id: 'xp2',
    title: 'Red Sea snorkel & boat trip',
    categoryId: 'cat7',
    cityId: 'gov-aqaba',
    imageUrl:
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=85&auto=format&fit=crop',
    durationHours: 3,
    priceFrom: 45,
    currency: 'JOD',
    rating: 4.8,
    badge: 'limited',
  },
];
