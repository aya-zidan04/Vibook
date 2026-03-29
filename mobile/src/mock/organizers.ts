import type { Organizer } from '@/types';

export const MOCK_ORGANIZERS: Organizer[] = [
  {
    id: 'org1',
    name: 'Nebula Live',
    logoUrl:
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=200&q=80&auto=format&fit=crop',
    coverUrl:
      'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200&q=80&auto=format&fit=crop',
    verified: true,
    about: 'Regional promoter for immersive concerts and cultural festivals.',
    rating: 4.9,
    reviewCount: 12840,
  },
  {
    id: 'org2',
    name: 'Atlas Dining Group',
    logoUrl:
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=200&q=80&auto=format&fit=crop',
    coverUrl:
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80&auto=format&fit=crop',
    verified: true,
    about: 'Chef-led tables across GCC capitals.',
    rating: 4.8,
    reviewCount: 6200,
  },
];
