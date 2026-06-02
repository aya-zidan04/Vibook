import {
  EXPLORE_MAIN_CATEGORY_ORDER,
  EXPLORE_SUBCATEGORY_ORDER,
  mainCategoryIcon,
  mainCategoryLabel,
  subcategoryLabel,
  type ExploreCategorySlug,
} from '@/constants/exploreCategoryTaxonomy';

/**
 * Canonical partner verticals for business profile (stored `profile.category` = English `en` string).
 */
export const BUSINESS_PARTNER_CATEGORIES = EXPLORE_MAIN_CATEGORY_ORDER.map((slug) => ({
  slug,
  en: mainCategoryLabel(slug, 'en'),
  ar: mainCategoryLabel(slug, 'ar'),
  icon: mainCategoryIcon(slug),
  partsEn: EXPLORE_SUBCATEGORY_ORDER[slug].map((sub) => subcategoryLabel(sub, 'en')),
  partsAr: EXPLORE_SUBCATEGORY_ORDER[slug].map((sub) => subcategoryLabel(sub, 'ar')),
})) as ReadonlyArray<{
  slug: ExploreCategorySlug;
  en: string;
  ar: string;
  icon: ReturnType<typeof mainCategoryIcon>;
  partsEn: string[];
  partsAr: string[];
}>;

export type BusinessPartnerCategorySlug = (typeof BUSINESS_PARTNER_CATEGORIES)[number]['slug'];

export function partnerCategoryRowForStored(stored: string) {
  const t = stored.trim();
  return BUSINESS_PARTNER_CATEGORIES.find((c) => c.en === t);
}
