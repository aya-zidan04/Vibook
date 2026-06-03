import type { Category } from '@/types';
import { backendIconToOutline } from '@/services/reference/mapReference';
import type { LocalizedSubcategory } from '@/utils/categoryLabels';

export type BusinessPartnerCategoryRow = {
  slug: string;
  en: string;
  ar: string;
  icon: ReturnType<typeof backendIconToOutline>;
  partsEn: string[];
  partsAr: string[];
};

export function businessPartnerCategoriesFromCatalog(
  categories: Category[],
  subsByParent: Record<string, LocalizedSubcategory[]>,
): BusinessPartnerCategoryRow[] {
  return categories.map((c) => {
    const subs = subsByParent[c.id] ?? [];
    return {
      slug: c.slug,
      en: c.labelEn,
      ar: c.labelAr,
      icon: backendIconToOutline(c.icon),
      partsEn: subs.map((s) => s.name),
      partsAr: subs.map((s) => s.nameAr),
    };
  });
}

export function partnerCategoryRowForStored(
  stored: string,
  categories: Category[],
): BusinessPartnerCategoryRow | undefined {
  const t = stored.trim();
  const fromCatalog = businessPartnerCategoriesFromCatalog(categories, {});
  return fromCatalog.find((c) => c.en === t || c.slug === t);
}
