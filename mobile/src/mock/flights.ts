import type { Flight } from '@/types';

export const MOCK_FLIGHTS: Flight[] = [
  {
    id: 'f1',
    airline: 'Gulf Wings',
    from: 'RUH',
    to: 'DXB',
    departAt: '2026-08-12T08:15:00+03:00',
    arriveAt: '2026-08-12T10:45:00+04:00',
    durationMin: 90,
    stops: 0,
    price: 420,
    currency: 'SAR',
    cabin: 'economy',
  },
  {
    id: 'f2',
    airline: 'Red Sea Air',
    from: 'JED',
    to: 'DOH',
    departAt: '2026-08-15T14:20:00+03:00',
    arriveAt: '2026-08-15T17:05:00+03:00',
    durationMin: 165,
    stops: 1,
    price: 680,
    currency: 'SAR',
    cabin: 'business',
  },
];
