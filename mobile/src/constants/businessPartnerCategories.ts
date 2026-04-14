/**
 * Canonical partner verticals for business profile (stored `profile.category` = English `en` string).
 */
export const BUSINESS_PARTNER_CATEGORIES = [
  {
    slug: 'entertainment',
    en: 'Entertainment',
    ar: 'ترفيه',
    icon: 'musical-notes-outline',
    partsEn: ['Comedy', 'Theater', 'Concerts'],
    partsAr: ['كوميديا', 'مسرح', 'حفلات'],
  },
  {
    slug: 'dining',
    en: 'Dining',
    ar: 'مطاعم ومقاهي',
    icon: 'restaurant-outline',
    partsEn: ['Restaurants', 'Cafes'],
    partsAr: ['مطاعم', 'مقاهي'],
  },
  {
    slug: 'sports',
    en: 'Sports',
    ar: 'رياضة',
    icon: 'football-outline',
    partsEn: ['Matches', 'Activities', 'Fitness'],
    partsAr: ['مباريات', 'أنشطة', 'لياقة'],
  },
  {
    slug: 'learning',
    en: 'Learning',
    ar: 'تعليم',
    icon: 'school-outline',
    partsEn: ['Conferences', 'Workshops', 'Courses'],
    partsAr: ['مؤتمرات', 'ورش عمل', 'دورات'],
  },
] as const;

export type BusinessPartnerCategorySlug = (typeof BUSINESS_PARTNER_CATEGORIES)[number]['slug'];

export function partnerCategoryRowForStored(stored: string) {
  const t = stored.trim();
  return BUSINESS_PARTNER_CATEGORIES.find((c) => c.en === t);
}
