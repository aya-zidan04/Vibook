import type { GovernorateResponse } from '@/api/types';
import type { City } from '@/types';

/** Backend seed names → slug for legacy `gov-{slug}` persisted city ids. */
const BACKEND_NAME_TO_SLUG: Record<string, string> = {
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
): string | undefined {
  const trimmed = (name ?? '').trim();
  if (!trimmed) return undefined;
  const mapped = BACKEND_NAME_TO_SLUG[trimmed];
  if (mapped) return mapped;
  return trimmed.toLowerCase().replace(/\s+/g, '-');
}

export function cityIdToGovernorateSlug(cityId: string): string | undefined {
  const trimmed = cityId.trim();
  if (!trimmed) return undefined;
  if (trimmed.startsWith('gov-')) {
    return trimmed.slice(4);
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
  return cityId;
}

/** Map one API governorate row → UI city. */
export function governorateFromApiRow(row: GovernorateResponse): City {
  const slug = backendGovernorateNameToSlug(row.name);
  const nameEn = row.name.trim();
  return {
    id: String(row.id),
    slug: slug ?? undefined,
    nameEn,
    /** Backend gap: governorates have no `nameAr`; mirror English until API adds it. */
    nameAr: nameEn,
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

