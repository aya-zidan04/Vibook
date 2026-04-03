import type { Booking } from '@/types';

export const MOCK_BOOKINGS: Booking[] = [
  {
    id: 'b1',
    userId: 'u1',
    type: 'event',
    refId: 'e1',
    refTitle: 'Amman Summer Sound',
    refTitleAr: 'أصوات عمّان الصيفية',
    cityNameAr: 'عمان',
    imageUrl:
      'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&q=80&auto=format&fit=crop',
    status: 'upcoming',
    startsAt: '2026-07-18T19:00:00+03:00',
    cityName: 'Amman',
    totalPaid: 350,
    currency: 'JOD',
  },
  {
    id: 'b2',
    userId: 'u1',
    type: 'restaurant',
    refId: 'r1',
    refTitle: 'Wild Jordan Café — Chef’s table',
    imageUrl:
      'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400&q=80&auto=format&fit=crop',
    status: 'past',
    startsAt: '2026-03-02T20:00:00+03:00',
    cityName: 'Amman',
    totalPaid: 890,
    currency: 'JOD',
  },
  {
    id: 'b3',
    userId: 'u1',
    type: 'hotel',
    refId: 'h1',
    refTitle: 'Ayla Lagoon Suites',
    refTitleAr: 'أيلة لاغون سويتس',
    cityNameAr: 'العقبة',
    imageUrl:
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80&auto=format&fit=crop',
    status: 'pending_payment',
    startsAt: '2026-09-01T15:00:00+03:00',
    cityName: 'Aqaba',
    totalPaid: 0,
    currency: 'JOD',
  },
];
