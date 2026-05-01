import type {
  BookingResponse,
  BookingStatusApi,
  BusinessEventResponse,
  BusinessEventSummaryResponse,
} from '@/api/types';
import { JORDAN_GOVERNORATES, type JordanGovernorateSlug } from '@/constants/jordanGovernorates';
import { resolveBackendMediaUrl } from '@/api/env';
import type {
  BusinessBookingRecord,
  BusinessBookingStatus,
  BusinessEventRecord,
  BusinessTicketOption,
} from '@/types/businessHub';

const BACKEND_TO_MOBILE_GOV: Record<string, string> = {
  Maan: "Ma'an",
};

export function governorateNameToSlug(name: string | null | undefined): JordanGovernorateSlug {
  const n = (name ?? '').trim();
  if (!n) return 'amman';
  const mapped = BACKEND_TO_MOBILE_GOV[n] ?? n;
  const row = JORDAN_GOVERNORATES.find((g) => g.en === mapped);
  return row?.slug ?? 'amman';
}

/** Only server-storable URLs (paths or absolute). Skips `file://` local picks. */
export function photoUrlsForApi(imageUris: string[]): string[] {
  const out: string[] = [];
  for (const raw of imageUris) {
    const u = raw.trim();
    if (!u || u.startsWith('file:')) continue;
    if (u.startsWith('http://') || u.startsWith('https://')) {
      out.push(u);
      continue;
    }
    out.push(u);
  }
  return out;
}

export function displayPhotoUrisFromResponse(photoUrls: string[] | null | undefined): string[] {
  if (!photoUrls?.length) return [];
  return photoUrls.map((p) => resolveBackendMediaUrl(p) ?? p).filter(Boolean);
}

export function businessEventSummaryToRecord(row: BusinessEventSummaryResponse): BusinessEventRecord {
  const price = parseFloat(row.priceJod);
  const ticketOptions: BusinessTicketOption[] = [
    {
      id: 'api-general',
      name: 'General',
      priceJod: Number.isFinite(price) ? price : 0,
      currency: row.currency || 'JOD',
    },
  ];
  return {
    id: String(row.id),
    title: row.title,
    category: row.subcategoryName ?? '',
    description: '',
    date: row.eventDate,
    time: '',
    governorateSlug: governorateNameToSlug(row.governorateName),
    mapsUrl: '',
    ticketOptions,
    currency: row.currency || 'JOD',
    capacityGuests: row.capacityGuests,
    images: row.primaryPhotoUrl ? row.primaryPhotoUrl : '',
    listingId: null,
    hidden: row.hidden,
  };
}

export function businessEventResponseToRecord(r: BusinessEventResponse): BusinessEventRecord {
  const price = parseFloat(r.priceJod);
  const ticketOptions: BusinessTicketOption[] = [
    {
      id: 'api-general',
      name: 'General',
      priceJod: Number.isFinite(price) ? price : 0,
      currency: r.currency || 'JOD',
    },
  ];
  const categoryLabel =
    r.categoryName && r.subcategoryName ? `${r.categoryName} · ${r.subcategoryName}` : (r.subcategoryName ?? '');
  return {
    id: String(r.id),
    apiSubcategoryId: r.subcategoryId,
    title: r.title,
    category: categoryLabel,
    description: r.description ?? '',
    date: r.eventDate,
    time: (r.timeSlots ?? []).join(', '),
    governorateSlug: governorateNameToSlug(r.governorateName),
    mapsUrl: r.googleMapsUrl ?? '',
    ticketOptions,
    currency: r.currency || 'JOD',
    capacityGuests: r.capacityGuests,
    images: (r.photoUrls ?? []).map((p) => resolveBackendMediaUrl(p) ?? p).join('\n'),
    listingId: null,
    hidden: r.hidden,
  };
}

export function bookingStatusToLocal(s: BookingStatusApi): BusinessBookingStatus {
  switch (s) {
    case 'PENDING':
      return 'pending';
    case 'CONFIRMED':
      return 'confirmed';
    case 'COMPLETED':
      return 'completed';
    case 'CANCELLED':
      return 'cancelled';
    default:
      return 'pending';
  }
}

export function businessBookingResponseToRecord(b: BookingResponse): BusinessBookingRecord {
  return {
    id: String(b.id),
    guestEmail: b.userEmail,
    partySize: b.guestsCount,
    status: bookingStatusToLocal(b.status),
    serverStatus: b.status,
    listingTitle: b.eventTitle,
    createdAt: b.createdAt,
  };
}

export function localBookingStatusToApi(s: BusinessBookingStatus): BookingStatusApi {
  switch (s) {
    case 'pending':
      return 'PENDING';
    case 'confirmed':
      return 'CONFIRMED';
    case 'completed':
      return 'COMPLETED';
    case 'cancelled':
      return 'CANCELLED';
    default:
      return 'PENDING';
  }
}

/** Next status when partner taps a booking card (allowed by API). */
export function nextPartnerBookingStatus(current: BookingStatusApi): BookingStatusApi | null {
  switch (current) {
    case 'PENDING':
      return 'CONFIRMED';
    case 'CONFIRMED':
      return 'COMPLETED';
    case 'COMPLETED':
    case 'CANCELLED':
    default:
      return null;
  }
}
