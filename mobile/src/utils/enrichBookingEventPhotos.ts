import { getEventById } from '@/api/eventsApi';
import { businessEventDetailToEventItem } from '@/services/api/eventMap';
import type { Booking } from '@/types';

async function fetchEventGallery(eventId: number): Promise<string[]> {
  try {
    const raw = await getEventById(eventId);
    return businessEventDetailToEventItem(raw).gallery;
  } catch {
    return [];
  }
}

/** Fills missing event cover photos from the public event endpoint (one fetch per event). */
export async function enrichBookingsWithEventPhotos(bookings: Booking[]): Promise<Booking[]> {
  const missingEventIds = [
    ...new Set(
      bookings
        .filter((b) => b.type === 'event' && b.gallery.length === 0 && b.refId)
        .map((b) => Number(b.refId))
        .filter((id) => Number.isFinite(id)),
    ),
  ];
  if (missingEventIds.length === 0) return bookings;

  const galleries = await Promise.all(
    missingEventIds.map(async (eventId) => [eventId, await fetchEventGallery(eventId)] as const),
  );
  const galleryByEventId = new Map(galleries);

  return bookings.map((booking) => {
    if (booking.gallery.length > 0) return booking;
    const eventId = Number(booking.refId);
    const gallery = galleryByEventId.get(eventId) ?? [];
    if (gallery.length === 0) return booking;
    return { ...booking, gallery, imageUrl: gallery[0] ?? booking.imageUrl };
  });
}
