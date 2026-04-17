import { JORDAN_GOVERNORATES, type JordanGovernorateSlug } from '@/constants/jordanGovernorates';
import type { BusinessEventRecord } from '@/types/businessHub';

function isSlug(s: string): s is JordanGovernorateSlug {
  return JORDAN_GOVERNORATES.some((g) => g.slug === s);
}

function parsePriceJod(e: Record<string, unknown>): number {
  if (typeof e.priceJod === 'number' && Number.isFinite(e.priceJod)) {
    return Math.max(0, e.priceJod);
  }
  const legacy = String(e.price ?? '').replace(/[^\d.]/g, '');
  const n = parseFloat(legacy);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

function parseCapacityGuests(e: Record<string, unknown>): number {
  if (typeof e.capacityGuests === 'number' && Number.isFinite(e.capacityGuests)) {
    return Math.max(0, Math.floor(e.capacityGuests));
  }
  const legacy = String(e.capacity ?? '').replace(/\D/g, '');
  const n = parseInt(legacy, 10);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

/** Maps persisted events (including legacy `location` / string price / capacity) to {@link BusinessEventRecord}. */
export function migrateBusinessEventRecord(raw: unknown): BusinessEventRecord {
  const e = raw as Record<string, unknown>;
  const currencyRaw = e.currency;
  const currency =
    typeof currencyRaw === 'string' && currencyRaw.trim().length > 0 ? currencyRaw.trim() : 'JOD';

  const shared = {
    id: String(e.id ?? ''),
    title: String(e.title ?? ''),
    category: String(e.category ?? ''),
    description: String(e.description ?? ''),
    date: String(e.date ?? ''),
    time: String(e.time ?? ''),
    priceJod: parsePriceJod(e),
    currency,
    capacityGuests: parseCapacityGuests(e),
    images: String(e.images ?? ''),
    listingId: (e.listingId as string | null | undefined) ?? null,
    hidden: Boolean(e.hidden),
  };
  const mapsUrlField = typeof e.mapsUrl === 'string' ? e.mapsUrl : '';
  const slugRaw = e.governorateSlug;
  if (typeof slugRaw === 'string' && isSlug(slugRaw)) {
    return { ...shared, governorateSlug: slugRaw, mapsUrl: mapsUrlField };
  }
  const legacyLocation = typeof e.location === 'string' ? e.location.trim() : '';
  return {
    ...shared,
    governorateSlug: 'amman',
    mapsUrl: mapsUrlField || legacyLocation,
  };
}
