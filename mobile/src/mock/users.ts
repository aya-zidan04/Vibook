import type { User } from '@/types';

export const MOCK_USERS: User[] = [
  {
    id: 'u1',
    name: 'Layla Al-Harbi',
    nameAr: 'ليلى الحربي',
    email: 'layla.h@email.com',
    phone: '+962791234567',
    avatarUrl:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80&auto=format&fit=crop',
    cityId: 'gov-amman',
    membershipTier: 'gold',
    walletBalance: 450,
    preferredLanguage: 'en',
  },
];

export const CURRENT_USER = MOCK_USERS[0];
