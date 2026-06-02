import type { Ionicons } from '@expo/vector-icons';

/** Canonical Explore main category slugs (matches backend seed). */
export const EXPLORE_MAIN_CATEGORY_SLUGS = [
  'entertainment',
  'dining',
  'sports',
  'learning',
] as const;

export type ExploreCategorySlug = (typeof EXPLORE_MAIN_CATEGORY_SLUGS)[number];

export const EXPLORE_SUBCATEGORY_SLUGS = [
  'matches',
  'fitness',
  'activities',
  'workshops',
  'courses',
  'conferences',
  'theater',
  'concerts',
  'comedy',
  'restaurants',
  'cafes',
] as const;

export type ExploreSubcategorySlug = (typeof EXPLORE_SUBCATEGORY_SLUGS)[number];

const MAIN_LABELS: Record<ExploreCategorySlug, { en: string; ar: string }> = {
  sports: { en: 'Sports', ar: 'رياضة' },
  learning: { en: 'Learning', ar: 'تعليم وتطوير' },
  entertainment: { en: 'Entertainment', ar: 'ترفيه' },
  dining: { en: 'Dining', ar: 'مطاعم' },
};

const MAIN_ICONS: Record<ExploreCategorySlug, keyof typeof Ionicons.glyphMap> = {
  entertainment: 'musical-notes-outline',
  dining: 'restaurant-outline',
  sports: 'football-outline',
  learning: 'school-outline',
};

const SUB_LABELS: Record<
  ExploreSubcategorySlug,
  { en: string; ar: string; parent: ExploreCategorySlug }
> = {
  matches: { en: 'Matches', ar: 'مباريات', parent: 'sports' },
  fitness: { en: 'Fitness', ar: 'لياقة', parent: 'sports' },
  activities: { en: 'Activities', ar: 'أنشطة', parent: 'sports' },
  workshops: { en: 'Workshops', ar: 'ورش عمل', parent: 'learning' },
  courses: { en: 'Courses', ar: 'دورات', parent: 'learning' },
  conferences: { en: 'Conferences', ar: 'مؤتمرات', parent: 'learning' },
  theater: { en: 'Theater', ar: 'مسرح', parent: 'entertainment' },
  concerts: { en: 'Concerts', ar: 'حفلات', parent: 'entertainment' },
  comedy: { en: 'Comedy', ar: 'كوميديا', parent: 'entertainment' },
  restaurants: { en: 'Restaurants', ar: 'مطاعم', parent: 'dining' },
  cafes: { en: 'Cafes', ar: 'مقاهي', parent: 'dining' },
};

/** Display order for main categories on Explore (matches current structure). */
export const EXPLORE_MAIN_CATEGORY_ORDER: ExploreCategorySlug[] = [
  'entertainment',
  'dining',
  'sports',
  'learning',
];

/** Subcategory display order under each parent. */
export const EXPLORE_SUBCATEGORY_ORDER: Record<ExploreCategorySlug, ExploreSubcategorySlug[]> = {
  sports: ['matches', 'fitness', 'activities'],
  learning: ['workshops', 'courses', 'conferences'],
  entertainment: ['theater', 'concerts', 'comedy'],
  dining: ['restaurants', 'cafes'],
};

const BACKEND_MAIN_NAME_TO_SLUG: Record<string, ExploreCategorySlug> = {
  Sports: 'sports',
  Learning: 'learning',
  Entertainment: 'entertainment',
  Dining: 'dining',
};

const BACKEND_SUB_NAME_TO_SLUG: Record<string, ExploreSubcategorySlug> = {
  Matches: 'matches',
  Fitness: 'fitness',
  Activities: 'activities',
  Workshops: 'workshops',
  Courses: 'courses',
  Conferences: 'conferences',
  Theater: 'theater',
  Concerts: 'concerts',
  Comedy: 'comedy',
  Restaurants: 'restaurants',
  Cafes: 'cafes',
};

export function isExploreMainCategorySlug(slug: string): slug is ExploreCategorySlug {
  return (EXPLORE_MAIN_CATEGORY_SLUGS as readonly string[]).includes(slug);
}

export function isExploreSubcategorySlug(slug: string): slug is ExploreSubcategorySlug {
  return (EXPLORE_SUBCATEGORY_SLUGS as readonly string[]).includes(slug);
}

export function exploreMainCategorySlugFromBackendName(name: string): ExploreCategorySlug | undefined {
  const trimmed = name.trim();
  if (!trimmed) return undefined;
  const mapped = BACKEND_MAIN_NAME_TO_SLUG[trimmed];
  if (mapped) return mapped;
  return isExploreMainCategorySlug(trimmed.toLowerCase()) ? (trimmed.toLowerCase() as ExploreCategorySlug) : undefined;
}

export function exploreSubcategorySlugFromBackendName(name: string): ExploreSubcategorySlug | undefined {
  const trimmed = name.trim();
  if (!trimmed) return undefined;
  const mapped = BACKEND_SUB_NAME_TO_SLUG[trimmed];
  if (mapped) return mapped;
  return isExploreSubcategorySlug(trimmed.toLowerCase())
    ? (trimmed.toLowerCase() as ExploreSubcategorySlug)
    : undefined;
}

export function mainCategoryLabel(slug: ExploreCategorySlug, locale: 'en' | 'ar'): string {
  const row = MAIN_LABELS[slug];
  return locale === 'ar' ? row.ar : row.en;
}

export function subcategoryLabel(slug: ExploreSubcategorySlug, locale: 'en' | 'ar'): string {
  const row = SUB_LABELS[slug];
  return locale === 'ar' ? row.ar : row.en;
}

export function subcategoryParentSlug(slug: ExploreSubcategorySlug): ExploreCategorySlug {
  return SUB_LABELS[slug].parent;
}

export function mainCategoryIcon(slug: ExploreCategorySlug): keyof typeof Ionicons.glyphMap {
  return MAIN_ICONS[slug];
}

export function localizedMainCategoryName(
  slugOrBackendName: string,
  locale: 'en' | 'ar',
): string {
  const slug = isExploreMainCategorySlug(slugOrBackendName)
    ? slugOrBackendName
    : exploreMainCategorySlugFromBackendName(slugOrBackendName);
  if (slug) return mainCategoryLabel(slug, locale);
  return slugOrBackendName.trim();
}

export function localizedSubcategoryName(
  slugOrBackendName: string,
  locale: 'en' | 'ar',
): string {
  const slug = isExploreSubcategorySlug(slugOrBackendName)
    ? slugOrBackendName
    : exploreSubcategorySlugFromBackendName(slugOrBackendName);
  if (slug) return subcategoryLabel(slug, locale);
  return slugOrBackendName.trim();
}

export function sortExploreMainCategorySlugs(slugs: ExploreCategorySlug[]): ExploreCategorySlug[] {
  const order = new Map(EXPLORE_MAIN_CATEGORY_ORDER.map((slug, index) => [slug, index]));
  return [...slugs].sort((a, b) => (order.get(a) ?? 99) - (order.get(b) ?? 99));
}

export function sortExploreSubcategorySlugs(
  parentSlug: ExploreCategorySlug,
  slugs: ExploreSubcategorySlug[],
): ExploreSubcategorySlug[] {
  const order = new Map(EXPLORE_SUBCATEGORY_ORDER[parentSlug].map((slug, index) => [slug, index]));
  return [...slugs].sort((a, b) => (order.get(a) ?? 99) - (order.get(b) ?? 99));
}
