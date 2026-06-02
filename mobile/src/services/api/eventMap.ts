import { resolveBackendMediaUrl } from '@/api/env';
import type { BusinessEventResponse, BusinessEventSummaryResponse, FavoriteEventResponse } from '@/api/types';
import type { EventItem, TicketTier } from '@/types';

function numPrice(v: string | number | undefined): number {
  if (v == null) return 0;
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

/** YYYY-MM-DD + first time slot → ISO start; fallback noon UTC on event date. */
function startIsoFromEventDateAndSlots(eventDate: string, timeSlots: string[]): string {
  const d = (eventDate || '').slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) {
    return new Date().toISOString();
  }
  const slot = timeSlots.find((s) => s?.trim());
  if (slot) {
    const m = slot.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (m) {
      let h = parseInt(m[1], 10);
      const min = parseInt(m[2], 10);
      const ap = m[3].toUpperCase();
      if (ap === 'PM' && h !== 12) h += 12;
      if (ap === 'AM' && h === 12) h = 0;
      const iso = new Date(`${d}T${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}:00.000Z`);
      if (!Number.isNaN(iso.getTime())) return iso.toISOString();
    }
  }
  const noon = new Date(`${d}T12:00:00.000Z`);
  return Number.isNaN(noon.getTime()) ? new Date().toISOString() : noon.toISOString();
}

export function businessEventSummaryToEventItem(row: BusinessEventSummaryResponse): EventItem {
  const startAt = startIsoFromEventDateAndSlots(row.eventDate, []);
  const end = new Date(startAt);
  end.setUTCHours(end.getUTCHours() + 2);
  const img = resolveBackendMediaUrl(row.primaryPhotoUrl) ?? '';
  const currency = row.currency?.trim() || 'JOD';
  return {
    id: String(row.id),
    title: row.title,
    categoryId: String(row.subcategoryName || 'event'),
    cityId: String(row.governorateName || 'unknown'),
    organizerId: 'api',
    imageUrl: img || 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&q=80',
    gallery: img ? [img] : [],
    startAt,
    endAt: end.toISOString(),
    venueName: row.subcategoryName || '',
    address: '',
    description: '',
    priceFrom: numPrice(row.priceJod),
    currency,
    rating: row.averageRating ?? 0,
    reviewCount: row.reviewCount ?? 0,
    badge: undefined,
  };
}

export function businessEventDetailToEventItem(row: BusinessEventResponse): EventItem {
  const startAt = startIsoFromEventDateAndSlots(row.eventDate, row.timeSlots ?? []);
  const end = new Date(startAt);
  end.setUTCHours(end.getUTCHours() + 2);
  const urls = (row.photoUrls ?? []).map((p) => resolveBackendMediaUrl(p) ?? p).filter(Boolean);
  const img = urls[0] ?? '';
  const currency = row.currency?.trim() || 'JOD';
  return {
    id: String(row.id),
    title: row.title,
    categoryId: String(row.categoryId),
    cityId: String(row.governorateId),
    organizerId: String(row.businessProfileId),
    imageUrl: img || 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&q=80',
    gallery: urls.length > 0 ? urls : img ? [img] : [],
    startAt,
    endAt: end.toISOString(),
    venueName: row.subcategoryName || '',
    address: row.googleMapsUrl || '',
    description: row.description ?? '',
    priceFrom: numPrice(row.priceJod),
    currency,
    rating: row.averageRating ?? 0,
    reviewCount: row.reviewCount ?? 0,
    badge: undefined,
  };
}

export function tiersFromBusinessEvent(row: BusinessEventResponse): TicketTier[] {
  const price = numPrice(row.priceJod);
  const currency = row.currency?.trim() || 'JOD';
  const slots = row.timeSlots?.length ? row.timeSlots : ['General'];
  return slots.map((label, i) => ({
    id: `slot-${row.id}-${i}`,
    eventId: String(row.id),
    name: label,
    price,
    currency,
    benefits: [],
    description: undefined,
  }));
}

export function favoriteEventRowToEventItem(row: FavoriteEventResponse): EventItem {
  const startAt = startIsoFromEventDateAndSlots(row.eventDate, row.timeSlots ?? []);
  const end = new Date(startAt);
  end.setUTCHours(end.getUTCHours() + 2);
  const img = resolveBackendMediaUrl(row.coverPhotoUrl) ?? '';
  const currency = row.currency?.trim() || 'JOD';
  return {
    id: String(row.id),
    title: row.title,
    categoryId: row.subcategoryName || 'event',
    cityId: row.governorateName || 'unknown',
    organizerId: 'api',
    imageUrl: img || 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&q=80',
    gallery: img ? [img] : [],
    startAt,
    endAt: end.toISOString(),
    venueName: row.subcategoryName || '',
    address: '',
    description: row.description ?? '',
    priceFrom: numPrice(row.priceJod),
    currency,
    rating: row.averageRating ?? 0,
    reviewCount: row.reviewCount ?? 0,
    badge: undefined,
  };
}
