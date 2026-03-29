import type { Review } from '@/types';

export const MOCK_REVIEWS: Review[] = [
  {
    id: 'rv1',
    authorName: 'Omar K.',
    rating: 5,
    comment: 'Flawless entry, premium lounge was worth the upgrade.',
    createdAt: '2026-02-10T12:00:00+03:00',
    helpful: 124,
  },
  {
    id: 'rv2',
    authorName: 'Sara M.',
    rating: 4,
    comment: 'Great sound and visuals — bar queues were long.',
    createdAt: '2026-02-08T19:20:00+03:00',
    helpful: 56,
  },
];
