import type {
  BookingResponse,
  BookingStatusApi,
  BusinessEventResponse,
  BusinessEventSummaryResponse,
  BusinessProfileResponseDto,
} from '@/api/types';
import { JORDAN_GOVERNORATES, type JordanGovernorateSlug } from '@/constants/jordanGovernorates';
import { backendGovernorateNameToSlug } from '@/utils/governorateLabels';
import { resolveBackendMediaUrl } from '@/api/env';
import type {
  BusinessBookingRecord,
  BusinessBookingStatus,
  BusinessEventRecord,
  BusinessProfile,
  BusinessTicketOption,
} from '@/types/businessHub';

const BACKEND_TO_MOBILE_GOV: Record<string, string> = {
  Maan: "Ma'an",
};

export function governorateNameToSlug(name: string | null | undefined): JordanGovernorateSlug {
  const slug = backendGovernorateNameToSlug(name);
  if (slug && JORDAN_GOVERNORATES.some((g) => g.slug === slug)) {
    return slug as JordanGovernorateSlug;
  }
  const n = (name ?? '').trim();
  if (!n) return 'amman';
  const mapped = BACKEND_TO_MOBILE_GOV[n] ?? n;
  const row = JORDAN_GOVERNORATES.find((g) => g.en === mapped);
  return row?.slug ?? 'amman';
}

export type EventEditorPhoto = { uri: string; photoId?: number };

export function editorPhotosFromApiResponse(r: BusinessEventResponse): EventEditorPhoto[] {
  if (r.photos?.length) {
    return r.photos.map((p) => ({
      uri: resolveBackendMediaUrl(p.url) ?? p.url,
      photoId: p.id,
    }));
  }
  return (r.photoUrls ?? []).map((url) => ({
    uri: resolveBackendMediaUrl(url) ?? url,
  }));
}

/** Stored photo paths from API (for upsert after multipart upload). */
export function photoUrlsFromApiResponse(r: BusinessEventResponse): string[] {
  if (r.photos?.length) {
    return r.photos.map((p) => p.url);
  }
  return r.photoUrls ?? [];
}

export function splitEditorPhotos(photos: EventEditorPhoto[]): {
  serverUrls: string[];
  localUris: string[];
} {
  const serverUrls: string[] = [];
  const localUris: string[] = [];
  for (const p of photos) {
    const u = p.uri.trim();
    if (!u) continue;
    if (u.startsWith('file:')) {
      localUris.push(u);
    } else {
      serverUrls.push(u);
    }
  }
  return { serverUrls, localUris };
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
  const time = row.timeSlots?.[0]?.trim() ?? '';
  return {
    id: String(row.id),
    title: row.title,
    category: row.subcategoryName ?? '',
    description: row.description ?? '',
    date: row.eventDate,
    time,
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
    images: editorPhotosFromApiResponse(r)
      .map((p) => p.uri)
      .join('\n'),
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

function resolveGuestName(b: BookingResponse): string | null {
  const full = b.userFullName?.trim();
  if (full) return full;
  const parts = [b.userFirstName, b.userLastName].map((p) => p?.trim()).filter(Boolean) as string[];
  return parts.length > 0 ? parts.join(' ') : null;
}

export function businessBookingResponseToRecord(b: BookingResponse): BusinessBookingRecord {
  return {
    id: String(b.id),
    guestName: resolveGuestName(b),
    guestPhone: b.userPhone?.trim() || null,
    partySize: b.guestsCount,
    status: bookingStatusToLocal(b.status),
    serverStatus: b.status,
    listingTitle: b.eventTitle,
    eventDate: b.eventDate,
    timeSlotLabel: b.timeSlotLabel,
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
export function hubProfilePatchFromApiDto(dto: BusinessProfileResponseDto): Partial<BusinessProfile> {
  return {
    displayName: dto.businessName ?? '',
    tagline: dto.tagline ?? '',
    description: dto.description ?? '',
    category: dto.primaryCategoryName ?? '',
    email: dto.workEmail ?? '',
    phone: dto.phone ?? '',
    governorateSlug: governorateNameToSlug(dto.governorateName),
    mapsUrl: dto.googleMapsUrl ?? '',
    website: dto.website ?? '',
    coverImageUri: resolveBackendMediaUrl(dto.bannerImageUrl) ?? '',
    logoUri: resolveBackendMediaUrl(dto.logoImageUrl) ?? '',
  };
}

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
