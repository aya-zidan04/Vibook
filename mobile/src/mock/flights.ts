import type { Flight } from '@/types';

export const MOCK_FLIGHTS: Flight[] = [
  {
    id: 'f1',
    airline: 'Royal Jordanian',
    from: 'AMM',
    to: 'AQJ',
    departAt: '2026-08-12T08:15:00+03:00',
    arriveAt: '2026-08-12T09:20:00+03:00',
    durationMin: 65,
    stops: 0,
    price: 45,
    currency: 'JOD',
    cabin: 'economy',
  },
  {
    id: 'f2',
    airline: 'Royal Jordanian',
    from: 'AMM',
    to: 'DXB',
    departAt: '2026-08-15T14:20:00+03:00',
    arriveAt: '2026-08-15T17:05:00+04:00',
    durationMin: 165,
    stops: 0,
    price: 180,
    currency: 'JOD',
    cabin: 'business',
  },
];
