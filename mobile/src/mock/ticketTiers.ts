import type { TicketTier } from '@/types';

export const MOCK_TICKET_TIERS: TicketTier[] = [
  {
    id: 'tt1',
    eventId: 'e1',
    name: 'Standard',
    price: 180,
    currency: 'SAR',
    benefits: ['General admission', 'Digital pass'],
    remaining: 420,
  },
  {
    id: 'tt2',
    eventId: 'e1',
    name: 'Premium',
    price: 350,
    currency: 'SAR',
    benefits: ['Closer seating', 'Lounge access pre-show'],
    remaining: 90,
  },
  {
    id: 'tt3',
    eventId: 'e1',
    name: 'VIP',
    price: 720,
    currency: 'SAR',
    benefits: ['Backstage meet', 'Premium parking', 'Complimentary drinks'],
    remaining: 24,
  },
  {
    id: 'tt4',
    eventId: 'e1',
    name: 'Family',
    price: 520,
    currency: 'SAR',
    benefits: ['4 seats', 'Kid-friendly zone'],
    remaining: 55,
  },
];
