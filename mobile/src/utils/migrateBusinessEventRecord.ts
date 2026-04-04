import { JORDAN_GOVERNORATES, type JordanGovernorateSlug } from '@/constants/jordanGovernorates';
import type { BusinessEventRecord } from '@/types/businessHub';

function isSlug(s: string): s is JordanGovernorateSlug {
  return JORDAN_GOVERNORATES.some((g) => g.slug === s);
}

/** Maps persisted events (including legacy `location` only) to `BusinessEventRecord`. */
export function migrateBusinessEventRecord(raw: unknown): BusinessEventRecord {
  const e = raw as Record<string, unknown>;
  const shared = {
    id: String(e.id ?? ''),
    title: String(e.title ?? ''),
    category: String(e.category ?? ''),
    description: String(e.description ?? ''),
    date: String(e.date ?? ''),
    time: String(e.time ?? ''),
    price: String(e.price ?? ''),
    capacity: String(e.capacity ?? ''),
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
