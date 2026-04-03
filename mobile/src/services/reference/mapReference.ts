import Ionicons from '@expo/vector-icons/Ionicons';
import type { Category, City } from '@/types';

export type CityDto = {
  id: number;
  nameEn: string;
  nameAr: string;
  country: string;
  imageUrl?: string | null;
};

export type CategoryDto = {
  id: number;
  slug: string;
  labelEn: string;
  labelAr: string;
  icon: string;
};

export function mapCityDto(dto: CityDto): City {
  return {
    id: String(dto.id),
    nameEn: dto.nameEn,
    nameAr: dto.nameAr,
    country: dto.country,
    imageUrl: dto.imageUrl ?? undefined,
  };
}

export function mapCategoryDto(dto: CategoryDto): Category {
  return {
    id: String(dto.id),
    slug: dto.slug,
    labelEn: dto.labelEn,
    labelAr: dto.labelAr,
    icon: dto.icon,
  };
}

/** Backend seeds use short names (e.g. `calendar`); explore strip prefers `-outline` glyphs. */
export function backendIconToOutline(raw: string): keyof typeof Ionicons.glyphMap {
  const trimmed = raw.trim();
  if (!trimmed) return 'apps-outline';
  const base = trimmed.replace(/-outline$/i, '');
  const withOutline = `${base}-outline`;
  if (withOutline in Ionicons.glyphMap) {
    return withOutline as keyof typeof Ionicons.glyphMap;
  }
  if (trimmed in Ionicons.glyphMap) {
    return trimmed as keyof typeof Ionicons.glyphMap;
  }
  return 'apps-outline';
}
