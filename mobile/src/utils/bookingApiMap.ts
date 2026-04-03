import type { BookingDraft } from '@/store/bookingDraftStore';
import type { Booking, BookingStatus } from '@/types';
import type { BookingResponseDto, CreateBookingRequestDto } from '@/services/api/types';
import { isNumericCatalogId } from '@/services/catalog/mapCatalog';
import { useLocaleStore } from '@/store/localeStore';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isBookingUuid(id: string): boolean {
  return UUID_RE.test(id.trim());
}

/** Draft/listing ref id is a backend catalog id (digits only). */
export function isNumericCatalogRef(refId: string): boolean {
  return isNumericCatalogId(refId);
}

/** Draft `stay` maps to backend booking type `hotel`. */
export function draftVerticalToApiType(vertical: BookingDraft['vertical']): string {
  return vertical === 'stay' ? 'hotel' : vertical;
}

export function apiBookingTypeToUiType(type: string): Booking['type'] {
  const t = type.trim().toLowerCase();
  if (t === 'hotel') return 'hotel';
  if (t === 'event') return 'event';
  if (t === 'restaurant') return 'restaurant';
  if (t === 'flight') return 'flight';
  if (t === 'experience') return 'experience';
  if (t === 'package') return 'package';
  return 'event';
}

export function normalizeCurrencyForApi(
  code: string | undefined,
  fallback: 'JOD' | 'USD',
): 'JOD' | 'USD' {
  const u = (code ?? '').trim().toUpperCase();
  if (u === 'JOD' || u === 'USD') return u;
  return fallback;
}

function toNumber(v: number | string | null | undefined): number {
  if (v == null) return 0;
  if (typeof v === 'number') return v;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function assertBookingStatus(s: string): BookingStatus {
  if (
    s === 'upcoming' ||
    s === 'past' ||
    s === 'cancelled' ||
    s === 'pending_payment'
  ) {
    return s;
  }
  return 'upcoming';
}

export function bookingResponseDtoToBooking(d: BookingResponseDto): Booking {
  return {
    id: d.id,
    userId: d.userId,
    type: apiBookingTypeToUiType(d.type),
    refId: String(d.refId),
    refTitle: d.refTitle,
    refTitleAr: d.refTitleAr ?? undefined,
    imageUrl: d.imageUrl,
    status: assertBookingStatus(d.status.trim().toLowerCase()),
    startsAt: d.startsAt,
    cityName: d.cityName,
    cityNameAr: d.cityNameAr ?? undefined,
    totalPaid: toNumber(d.totalPaid),
    currency: d.currency.trim().toUpperCase(),
  };
}

const FALLBACK_START_MS = 3 * 24 * 60 * 60 * 1000;

export function resolveDraftStartsAtIso(draft: BookingDraft): string {
  if (draft.startsAt && draft.startsAt.length > 0) {
    const t = Date.parse(draft.startsAt);
    if (!Number.isNaN(t)) return new Date(t).toISOString();
  }
  return new Date(Date.now() + FALLBACK_START_MS).toISOString();
}

export function resolveDraftCityNames(draft: BookingDraft): { cityName: string; cityNameAr?: string } {
  const region = useLocaleStore.getState().regionLabel?.trim() || 'Amman';
  const cityName = (draft.cityName?.trim() || region).slice(0, 200);
  const cityNameAr = draft.cityNameAr?.trim()
    ? draft.cityNameAr.trim().slice(0, 200)
    : undefined;
  return { cityName, cityNameAr };
}

export function buildCreateBookingRequestFromDraft(draft: BookingDraft): CreateBookingRequestDto {
  const refId = Number(draft.refId.trim());
  const fallbackCur = useLocaleStore.getState().currency;
  const currency = normalizeCurrencyForApi(draft.currency, fallbackCur);
  const { cityName, cityNameAr } = resolveDraftCityNames(draft);
  const quantity = draft.quantity;
  const unitPrice = draft.unitPrice;
  const fees = draft.fees;
  const totalPaid = unitPrice * quantity + fees;

  return {
    type: draftVerticalToApiType(draft.vertical),
    refId,
    refTitle: draft.title.trim().slice(0, 500),
    refTitleAr: draft.refTitleAr?.trim() ? draft.refTitleAr.trim().slice(0, 500) : undefined,
    imageUrl: draft.imageUrl.trim().slice(0, 1024),
    startsAt: resolveDraftStartsAtIso(draft),
    cityName,
    cityNameAr: cityNameAr ?? null,
    quantity,
    unitPrice,
    fees,
    totalPaid,
    currency,
    paymentReference: 'MOCK_CHECKOUT_4242',
  };
}

export function canCancelBookingStatus(status: BookingStatus): boolean {
  return status === 'upcoming' || status === 'pending_payment';
}
