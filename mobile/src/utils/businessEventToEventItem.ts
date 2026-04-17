import { eventTimeSlotToMinutes } from '@/constants/eventTimeSlots';
import type { BusinessEventRecord } from '@/types/businessHub';
import type { EventItem } from '@/types';

function parseTimeSlotsFromStored(timeRaw: string): string[] {
  return String(timeRaw ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Loose 12h parse for legacy single times not in EVENT_TIME_OPTIONS. */
function parseLoose12hMinutes(raw: string): number | null {
  const t = raw.trim();
  const m = t.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!m) return null;
  let h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  const ap = m[3].toUpperCase();
  if (h < 1 || h > 12 || min > 59) return null;
  if (ap === 'PM' && h !== 12) h += 12;
  if (ap === 'AM' && h === 12) h = 0;
  return h * 60 + min;
}

/**
 * First comma-separated slot that yields a valid time (canonical label, else loose 12h for that token).
 * Invalid tokens are skipped; order is preserved.
 */
function firstResolvedMinutesFromSlotsInOrder(slots: string[]): number | null {
  for (const s of slots) {
    const c = eventTimeSlotToMinutes(s);
    if (c != null && Number.isFinite(c)) return c;
    const loose = parseLoose12hMinutes(s);
    if (loose != null && Number.isFinite(loose)) return loose;
  }
  return null;
}

const FALLBACK_MINUTES_FROM_MIDNIGHT = 12 * 60;
const MS_TWO_HOURS = 2 * 60 * 60 * 1000;
/** ECMAScript approximate time range; avoids RangeError in toISOString(). */
const MS_MIN_SAFE = -8640000000000000;
const MS_MAX_SAFE = 8640000000000000;

function parseYyyyMmDdParts(raw: string): { y: number; m: number; d: number } | null {
  const d = String(raw ?? '').trim().slice(0, 10);
  const m = d.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const y = parseInt(m[1], 10);
  const mo = parseInt(m[2], 10);
  const day = parseInt(m[3], 10);
  if (!Number.isFinite(y) || !Number.isFinite(mo) || !Number.isFinite(day)) return null;
  if (mo < 1 || mo > 12 || day < 1 || day > 31) return null;
  return { y, m: mo, d: day };
}

/** Valid calendar YYYY-MM-DD using UTC noon; otherwise today's UTC date. No Date.parse on arbitrary strings. */
function safeEventDateYyyyMmDd(raw: string): string {
  const parts = parseYyyyMmDdParts(raw);
  if (!parts) {
    return new Date().toISOString().slice(0, 10);
  }
  const probe = Date.UTC(parts.y, parts.m - 1, parts.d, 12, 0, 0, 0);
  if (!Number.isFinite(probe) || probe < MS_MIN_SAFE || probe > MS_MAX_SAFE) {
    return new Date().toISOString().slice(0, 10);
  }
  const dt = new Date(probe);
  if (
    dt.getUTCFullYear() !== parts.y ||
    dt.getUTCMonth() + 1 !== parts.m ||
    dt.getUTCDate() !== parts.d
  ) {
    return new Date().toISOString().slice(0, 10);
  }
  return `${String(parts.y).padStart(4, '0')}-${String(parts.m).padStart(2, '0')}-${String(parts.d).padStart(2, '0')}`;
}

function utcMsAtStartOfDayWithClock(y: number, monthIndex: number, day: number, hour: number, minute: number): number | null {
  if (![y, monthIndex, day, hour, minute].every((n) => Number.isFinite(n))) return null;
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;
  const ms = Date.UTC(y, monthIndex, day, hour, minute, 0, 0);
  if (!Number.isFinite(ms) || ms < MS_MIN_SAFE || ms > MS_MAX_SAFE) return null;
  return ms;
}

function toIsoStringSafe(ms: number): string | null {
  if (!Number.isFinite(ms) || ms < MS_MIN_SAFE || ms > MS_MAX_SAFE) return null;
  try {
    const d = new Date(ms);
    if (Number.isNaN(d.getTime())) return null;
    return d.toISOString();
  } catch {
    return null;
  }
}

function startEndIsoForBusinessEvent(e: BusinessEventRecord): { startAt: string; endAt: string } {
  const dateStr = safeEventDateYyyyMmDd(e.date);
  const dateParts = parseYyyyMmDdParts(dateStr);
  const slots = parseTimeSlotsFromStored(e.time);

  let minutes = firstResolvedMinutesFromSlotsInOrder(slots);
  if (minutes == null || !Number.isFinite(minutes)) {
    minutes = FALLBACK_MINUTES_FROM_MIDNIGHT;
  }
  minutes = Math.trunc(minutes);
  minutes = Math.min(Math.max(minutes, 0), 24 * 60 - 1);

  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;

  let startMs: number | null = null;
  if (dateParts) {
    startMs = utcMsAtStartOfDayWithClock(dateParts.y, dateParts.m - 1, dateParts.d, hour, minute);
  }

  if (startMs == null) {
    const now = Date.now();
    const s = toIsoStringSafe(now);
    const t = toIsoStringSafe(now + MS_TWO_HOURS);
    if (s && t) return { startAt: s, endAt: t };
    return { startAt: '1970-01-01T12:00:00.000Z', endAt: '1970-01-01T14:00:00.000Z' };
  }

  const endMs = startMs + MS_TWO_HOURS;
  const startAt = toIsoStringSafe(startMs);
  const endAt = toIsoStringSafe(endMs);
  if (startAt && endAt) {
    return { startAt, endAt };
  }

  const now = Date.now();
  const s = toIsoStringSafe(now);
  const t = toIsoStringSafe(now + MS_TWO_HOURS);
  if (s && t) return { startAt: s, endAt: t };
  return { startAt: '1970-01-01T12:00:00.000Z', endAt: '1970-01-01T14:00:00.000Z' };
}

function galleryFromImages(images: string): string[] {
  return images
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);
}

function descriptionWithSlots(base: string, timeRaw: string): string {
  const slots = parseTimeSlotsFromStored(timeRaw);
  if (slots.length <= 1) return base.trim();
  const tail = `\n\n${slots.join(' · ')}`;
  const b = base.trim();
  return b ? `${b}${tail}` : slots.join(' · ');
}

/**
 * Maps a persisted business event to the public {@link EventItem} shape.
 * Call only for non-hidden events shown in explore / PDP.
 */
export function businessEventToEventItem(e: BusinessEventRecord): EventItem {
  const { startAt, endAt } = startEndIsoForBusinessEvent(e);
  const gallery = galleryFromImages(e.images);
  const imageUrl = gallery[0] ?? 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&q=80';
  const priceFrom = Number.isFinite(e.priceJod) ? e.priceJod : 0;
  const currency = e.currency?.trim() || 'JOD';

  return {
    id: e.id,
    title: e.title.trim() || 'Event',
    categoryId: 'cat1',
    cityId: `gov-${e.governorateSlug}`,
    organizerId: 'org1',
    imageUrl,
    gallery: gallery.length > 0 ? gallery : [],
    startAt,
    endAt,
    venueName: e.title.trim() || 'Venue',
    address: e.mapsUrl.trim() || '',
    description: descriptionWithSlots(e.description, e.time),
    priceFrom,
    currency,
    rating: 0,
    reviewCount: 0,
    badge: undefined,
  };
}
