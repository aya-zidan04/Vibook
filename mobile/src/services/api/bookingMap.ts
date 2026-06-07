import { resolveBackendMediaUrl } from '@/api/env';
import type { BookingResponse } from '@/api/types';
import type { Booking, BookingStatus } from '@/types';
import { startIsoFromEventDateAndSlots } from '@/services/api/eventMap';

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

function resolveEventPhotoUrls(row: BookingResponse): string[] {
  const fromList = (row.eventPhotoUrls ?? [])
    .map((url) => resolveBackendMediaUrl(url))
    .filter((url): url is string => Boolean(url));
  if (fromList.length > 0) return fromList;

  const primary = resolveBackendMediaUrl(row.eventPrimaryPhotoUrl);
  return primary ? [primary] : [];
}

export function bookingResponseToBooking(row: BookingResponse): Booking {
  const total = Number(row.totalPriceJod);
  const gallery = resolveEventPhotoUrls(row);
  return {
    id: String(row.id),
    userId: String(row.userId),
    type: 'event',
    refId: String(row.eventId),
    refTitle: row.eventTitle,
    refTitleAr: row.eventTitle,
    imageUrl: gallery[0] ?? '',
    gallery,
    status: mapStatus(row.status),
    startsAt: startIsoFromEventDateAndSlots(
      row.eventDate,
      row.timeSlotLabel?.trim() ? [row.timeSlotLabel.trim()] : [],
    ),
    cityName: '',
    cityNameAr: '',
    totalPaid: Number.isFinite(total) ? total : 0,
    currency: row.currency?.trim() || 'JOD',
  };
}
