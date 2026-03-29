import type { Offer } from '@/types';

export const MOCK_OFFERS: Offer[] = [
  {
    id: 'o1',
    title: 'Weekend dining — 20% off',
    subtitle: 'Selected tables in Riyadh & Jeddah',
    imageUrl:
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=85&auto=format&fit=crop',
    discountPercent: 20,
    endsAt: '2026-04-15T23:59:59+03:00',
  },
  {
    id: 'o2',
    title: 'Early bird flights',
    subtitle: 'Book 21+ days ahead',
    imageUrl:
      'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&q=85&auto=format&fit=crop',
    discountPercent: 15,
    endsAt: '2026-05-01T23:59:59+03:00',
  },
];
