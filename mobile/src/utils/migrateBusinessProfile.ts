import { JORDAN_GOVERNORATES, type JordanGovernorateSlug } from '@/constants/jordanGovernorates';
import type { BusinessProfile } from '@/types/businessHub';

function isSlug(s: string): s is JordanGovernorateSlug {
  return JORDAN_GOVERNORATES.some((g) => g.slug === s);
}

/** Normalizes persisted profile (legacy `address` → `mapsUrl`). */
export function migrateBusinessProfile(raw: unknown): BusinessProfile {
  const r = raw as Record<string, unknown>;
  const base: BusinessProfile = {
    displayName: String(r.displayName ?? ''),
    tagline: String(r.tagline ?? ''),
    description: String(r.description ?? ''),
    category: String(r.category ?? ''),
    email: String(r.email ?? ''),
    phone: String(r.phone ?? ''),
    website: String(r.website ?? ''),
    coverImageUri: String(r.coverImageUri ?? ''),
    logoUri: String(r.logoUri ?? ''),
    governorateSlug: 'amman',
    mapsUrl: '',
  };
  const mapsNew = typeof r.mapsUrl === 'string' ? r.mapsUrl : '';
  const slugRaw = r.governorateSlug;
  if (typeof slugRaw === 'string' && isSlug(slugRaw)) {
    return { ...base, governorateSlug: slugRaw, mapsUrl: mapsNew };
  }
  const legacyAddress = typeof r.address === 'string' ? r.address.trim() : '';
  return {
    ...base,
    governorateSlug: 'amman',
    mapsUrl: mapsNew || legacyAddress,
  };
}
