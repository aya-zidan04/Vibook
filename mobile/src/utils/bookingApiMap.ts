import type { BookingDraft } from '@/store/bookingDraftStore';
import type { Booking, BookingStatus } from '@/types';
import { isNumericCatalogId } from '@/services/catalog/mapCatalog';
import { useLocaleStore } from '@/store/localeStore';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isBookingUuid(id: string): boolean {
  return UUID_RE.test(id.trim());
}

export function isNumericCatalogRef(refId: string): boolean {
  return isNumericCatalogId(refId);
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

export function canCancelBookingStatus(status: BookingStatus): boolean {
  return status === 'upcoming' || status === 'pending_payment';
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
