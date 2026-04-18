import type { TicketTier } from '@/types';

export const MOCK_TICKET_TIERS: TicketTier[] = [
  {
    id: 'tt1',
    eventId: 'e1',
    name: 'Standard',
    price: 34,
    currency: 'JOD',
    benefits: [],
    description: 'General admission · Digital pass',
    remaining: 420,
  },
  {
    id: 'tt2',
    eventId: 'e1',
    name: 'Premium',
    price: 66,
    currency: 'JOD',
    benefits: [],
    description: 'Closer seating · Lounge access pre-show',
    remaining: 90,
  },
  {
    id: 'tt3',
    eventId: 'e1',
    name: 'VIP',
    price: 136,
    currency: 'JOD',
    benefits: [],
    description: 'Backstage meet · Premium parking · Complimentary drinks',
    remaining: 24,
  },
  {
    id: 'tt4',
    eventId: 'e1',
    name: 'Family',
    price: 98,
    currency: 'JOD',
    benefits: [],
    description: '4 seats · Kid-friendly zone',
    remaining: 55,
  },
];
