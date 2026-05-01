import type { BookingResponse } from '@/api/types';
import type { Booking, BookingStatus } from '@/types';

function mapStatus(s: BookingResponse['status']): BookingStatus {
  switch (s) {
    case 'CONFIRMED':
      return 'upcoming';
    case 'COMPLETED':
      return 'past';
    case 'CANCELLED':
      return 'cancelled';
    case 'PENDING':
    default:
      return 'pending_payment';
  }
}

function eventDateToStartsAtIso(eventDate: string): string {
  const d = (eventDate || '').slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return new Date().toISOString();
  const dt = new Date(`${d}T12:00:00.000Z`);
  return Number.isNaN(dt.getTime()) ? new Date().toISOString() : dt.toISOString();
}

export function bookingResponseToBooking(row: BookingResponse): Booking {
  const total = Number(row.totalPriceJod);
  return {
    id: String(row.id),
    userId: String(row.userId),
    type: 'event',
    refId: String(row.eventId),
    refTitle: row.eventTitle,
    refTitleAr: row.eventTitle,
    imageUrl: 'https://images.unsplash.com/photo-1540039155733-5bb30b53a388?w=800&q=80',
    status: mapStatus(row.status),
    startsAt: eventDateToStartsAtIso(row.eventDate),
    cityName: '',
    cityNameAr: '',
    totalPaid: Number.isFinite(total) ? total : 0,
    currency: 'JOD',
  };
}
