import { JORDAN_GOVERNORATES, type JordanGovernorateSlug } from '@/constants/jordanGovernorates';
import type { BusinessEventRecord, BusinessTicketOption } from '@/types/businessHub';

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

function parseOneTicketPrice(raw: Record<string, unknown>): number {
  if (typeof raw.priceJod === 'number' && Number.isFinite(raw.priceJod)) {
    return Math.max(0, raw.priceJod);
  }
  const legacy = String(raw.price ?? '').replace(/[^\d.]/g, '');
  const n = parseFloat(legacy);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

function normalizeTicketOptionRow(
  raw: unknown,
  idx: number,
  eventId: string,
  defaultCurrency: string,
): BusinessTicketOption | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  const id =
    typeof o.id === 'string' && o.id.trim().length > 0 ? o.id.trim() : `${eventId}-ticket-${idx}`;
  const name = typeof o.name === 'string' ? o.name.trim() : '';
  const priceJod = parseOneTicketPrice(o);
  const currency =
    typeof o.currency === 'string' && o.currency.trim().length > 0 ? o.currency.trim() : defaultCurrency;
  const description =
    typeof o.description === 'string' && o.description.trim().length > 0 ? o.description.trim() : undefined;
  if (!name) return null;
  return { id, name, priceJod, currency, description };
}

function parseTicketOptions(
  e: Record<string, unknown>,
  eventId: string,
  defaultCurrency: string,
): BusinessTicketOption[] {
  const raw = e.ticketOptions;
  if (Array.isArray(raw) && raw.length > 0) {
    const out: BusinessTicketOption[] = [];
    raw.forEach((row, idx) => {
      const n = normalizeTicketOptionRow(row, idx, eventId, defaultCurrency);
      if (n) out.push(n);
    });
    if (out.length > 0) return out;
  }
  const legacyPrice = parsePriceJod(e);
  return [
    {
      id: `${eventId}-ticket-0`,
      name: 'General admission',
      priceJod: legacyPrice,
      currency: defaultCurrency,
    },
  ];
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

  const id = String(e.id ?? '');
  const ticketOptions = parseTicketOptions(e, id, currency);

  const shared = {
    id,
    title: String(e.title ?? ''),
    category: String(e.category ?? ''),
    description: String(e.description ?? ''),
    date: String(e.date ?? ''),
    time: String(e.time ?? ''),
    ticketOptions,
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
