import type { NotificationItem } from '@/types';

export const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n1',
    title: 'Booking confirmed',
    body: 'Amman Summer Sound — Premium tier. Add to calendar.',
    createdAt: '2026-03-28T10:00:00+03:00',
    read: false,
    kind: 'booking',
  },
  {
    id: 'n2',
    title: 'Price drop on flights to Aqaba',
    body: 'Royal Jordanian AMM→AQJ now from JOD 45.',
    createdAt: '2026-03-27T18:30:00+03:00',
    read: true,
    kind: 'price',
  },
  {
    id: 'n3',
    title: 'Limited drop: collector’s pass',
    body: 'New release in 2 hours — enable notifications.',
    createdAt: '2026-03-26T09:00:00+03:00',
    read: false,
    kind: 'wishlist',
  },
];
