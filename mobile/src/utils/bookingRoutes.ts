import type { Booking } from '@/types';

/** Deep link to the booked listing when refId is present. */
export function hrefForBookingRef(b: Booking): string | null {
  if (!b.refId || b.type !== 'event') return null;
  return `/event/${b.refId}`;
}
