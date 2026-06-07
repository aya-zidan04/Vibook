import { resolveBackendMediaUrl } from '@/api/env';
import type { BusinessEventResponse, BusinessEventSummaryResponse, FavoriteEventResponse } from '@/api/types';
import type { EventItem, TicketTier } from '@/types';
import { backendGovernorateNameToSlug } from '@/utils/governorateLabels';

function numPrice(v: string | number | undefined): number {
  if (v == null) return 0;
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

/** YYYY-MM-DD + first time slot → ISO start; fallback noon UTC on event date. */
export function startIsoFromEventDateAndSlots(eventDate: string, timeSlots: string[]): string {
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
      // Slot labels are local Jordan time — parse without Z so device locale shows the saved hour.
      const iso = new Date(`${d}T${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}:00`);
      if (!Number.isNaN(iso.getTime())) return iso.toISOString();
    }
  }
  const noon = new Date(`${d}T12:00:00.000Z`);
  return Number.isNaN(noon.getTime()) ? new Date().toISOString() : noon.toISOString();
}

function resolveCityIdFromSummary(row: {
  governorateId?: number | null;
  governorateName?: string | null;
}): string {
  if (row.governorateId != null) return String(row.governorateId);
  const slug = backendGovernorateNameToSlug(row.governorateName);
  return slug ? `gov-${slug}` : '';
}

function resolveVenueName(row: { businessName?: string | null; title?: string | null }): string {
  const business = row.businessName?.trim();
  if (business) return business;
  const title = (row.title ?? '').trim();
  const enDash = title.lastIndexOf(' – ');
  if (enDash >= 0) return title.slice(enDash + 3).trim();
  const hyphen = title.lastIndexOf(' - ');
  if (hyphen >= 0) return title.slice(hyphen + 3).trim();
  return '';
}

function resolveGalleryFromUrls(urls: string[]): { imageUrl: string; gallery: string[] } {
  const gallery = urls
    .map((p) => resolveBackendMediaUrl(p) ?? p)
    .filter((url): url is string => Boolean(url));
  return { imageUrl: gallery[0] ?? '', gallery };
}

export function businessEventSummaryToEventItem(row: BusinessEventSummaryResponse): EventItem {
  const startAt = startIsoFromEventDateAndSlots(row.eventDate, row.timeSlots ?? []);
  const end = new Date(startAt);
  end.setUTCHours(end.getUTCHours() + 2);
  const { imageUrl, gallery } = resolveGalleryFromUrls(
    row.primaryPhotoUrl ? [row.primaryPhotoUrl] : [],
  );
  const currency = row.currency?.trim() || 'JOD';
  return {
    id: String(row.id),
    title: row.title ?? '',
    categoryId: String(row.categoryId ?? row.subcategoryId ?? ''),
    cityId: resolveCityIdFromSummary(row),
    organizerId: 'api',
    imageUrl,
    gallery,
    startAt,
    endAt: end.toISOString(),
    venueName: resolveVenueName(row),
    address: '',
    description: row.description ?? '',
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
  const { imageUrl, gallery } = resolveGalleryFromUrls(row.photoUrls ?? []);
  const currency = row.currency?.trim() || 'JOD';
  return {
    id: String(row.id),
    title: row.title ?? '',
    categoryId: String(row.categoryId),
    cityId: String(row.governorateId),
    organizerId: String(row.businessProfileId),
    imageUrl,
    gallery,
    startAt,
    endAt: end.toISOString(),
    venueName: resolveVenueName(row),
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
  const { imageUrl, gallery } = resolveGalleryFromUrls(row.coverPhotoUrl ? [row.coverPhotoUrl] : []);
  const currency = row.currency?.trim() || 'JOD';
  return {
    id: String(row.id),
    title: row.title ?? '',
    categoryId: row.categoryName || row.subcategoryName || 'event',
    cityId: row.governorateName || 'unknown',
    organizerId: 'api',
    imageUrl,
    gallery,
    startAt,
    endAt: end.toISOString(),
    venueName: row.businessName || '',
    address: '',
    description: row.description ?? '',
    priceFrom: numPrice(row.priceJod),
    currency,
    rating: row.averageRating ?? 0,
    reviewCount: row.reviewCount ?? 0,
    badge: undefined,
  };
}
