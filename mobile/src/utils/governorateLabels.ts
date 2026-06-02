import type { GovernorateResponse } from '@/api/types';
import { JORDAN_GOVERNORATES, type JordanGovernorateSlug } from '@/constants/jordanGovernorates';
import { MOCK_CITIES } from '@/mock/cities';
import type { City } from '@/types';

/** Backend seed names → mobile slug (English canonical on server). */
const BACKEND_NAME_TO_SLUG: Record<string, JordanGovernorateSlug> = {
  Irbid: 'irbid',
  Ajloun: 'ajloun',
  Jerash: 'jerash',
  Mafraq: 'mafraq',
  Amman: 'amman',
  Zarqa: 'zarqa',
  Balqa: 'balqa',
  Madaba: 'madaba',
  Karak: 'karak',
  Tafileh: 'tafileh',
  Maan: 'maan',
  "Ma'an": 'maan',
  Aqaba: 'aqaba',
};

export function backendGovernorateNameToSlug(
  name: string | null | undefined,
): JordanGovernorateSlug | undefined {
  const trimmed = (name ?? '').trim();
  if (!trimmed) return undefined;
  const mapped = BACKEND_NAME_TO_SLUG[trimmed];
  if (mapped) return mapped;
  const byEn = JORDAN_GOVERNORATES.find((g) => g.en === trimmed);
  if (byEn) return byEn.slug;
  const bySlug = JORDAN_GOVERNORATES.find((g) => g.slug === trimmed.toLowerCase());
  return bySlug?.slug;
}

export function governorateLabel(slug: JordanGovernorateSlug, locale: 'en' | 'ar'): string {
  const row = JORDAN_GOVERNORATES.find((g) => g.slug === slug);
  if (!row) return slug;
  return locale === 'ar' ? row.ar : row.en;
}

export function localizedGovernorateName(
  backendName: string | null | undefined,
  locale: 'en' | 'ar',
): string {
  const slug = backendGovernorateNameToSlug(backendName);
  if (slug) return governorateLabel(slug, locale);
  return (backendName ?? '').trim();
}

export function cityIdToGovernorateSlug(cityId: string): JordanGovernorateSlug | undefined {
  const trimmed = cityId.trim();
  if (!trimmed) return undefined;
  if (trimmed.startsWith('gov-')) {
    const slug = trimmed.slice(4) as JordanGovernorateSlug;
    return JORDAN_GOVERNORATES.some((g) => g.slug === slug) ? slug : undefined;
  }
  if (/^\d+$/.test(trimmed)) return undefined;
  return backendGovernorateNameToSlug(trimmed);
}

export function localizedCityLabel(
  cityId: string,
  locale: 'en' | 'ar',
  cities?: City[],
): string {
  if (!cityId) return '';
  const fromCatalog = cities?.find((c) => c.id === cityId);
  if (fromCatalog) {
    return locale === 'ar' ? fromCatalog.nameAr : fromCatalog.nameEn;
  }
  const slug = cityIdToGovernorateSlug(cityId);
  if (slug) return governorateLabel(slug, locale);
  return localizedGovernorateName(cityId, locale);
}

/** Map one API governorate row → UI city (English from DB, Arabic from taxonomy). */
export function governorateFromApiRow(row: GovernorateResponse): City {
  const slug = backendGovernorateNameToSlug(row.name);
  const nameEn = row.name.trim();
  const nameAr = slug ? governorateLabel(slug, 'ar') : nameEn;
  return {
    id: String(row.id),
    slug: slug ?? undefined,
    nameEn,
    nameAr,
    country: 'Jordan',
    displayOrder: row.displayOrder,
    active: row.active,
  };
}

/** Active governorates sorted by backend {@code displayOrder}. */
export function governoratesFromApiRows(rows: GovernorateResponse[]): City[] {
  return rows
    .filter((row) => row.active)
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map(governorateFromApiRow);
}

export function fallbackGovernorateCities(): City[] {
  return [...MOCK_CITIES];
}

/** @deprecated Use {@link governorateFromApiRow}. */
export function governorateCityFromApi(id: number, backendName: string): City {
  return governorateFromApiRow({
    id,
    name: backendName,
    displayOrder: 0,
    active: true,
  });
}
