import type { Booking } from '@/types';

/** Deep link to the booked listing when refId is present. */
export function hrefForBookingRef(b: Booking): string | null {
  if (!b.refId) return null;
  switch (b.type) {
    case 'event':
      return `/event/${b.refId}`;
    case 'restaurant':
      return `/restaurant/${b.refId}`;
    case 'hotel':
      return `/stay/${b.refId}`;
    case 'experience':
      return `/experience/${b.refId}`;
    case 'package':
      return `/package/${b.refId}`;
    case 'flight':
      return `/flight/${b.refId}`;
    default:
      return null;
  }
}
