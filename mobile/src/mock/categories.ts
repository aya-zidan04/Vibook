import {
  EXPLORE_MAIN_CATEGORY_ORDER,
  EXPLORE_SUBCATEGORY_ORDER,
  mainCategoryIcon,
  mainCategoryLabel,
  subcategoryLabel,
  type ExploreCategorySlug,
  type ExploreSubcategorySlug,
} from '@/constants/exploreCategoryTaxonomy';
import type { Category } from '@/types';

/** Mock reference catalog aligned with backend Explore taxonomy (slug ids). */
export const MOCK_CATEGORIES: Category[] = EXPLORE_MAIN_CATEGORY_ORDER.map((slug) => ({
  id: slug,
  slug,
  labelEn: mainCategoryLabel(slug, 'en'),
  labelAr: mainCategoryLabel(slug, 'ar'),
  icon: mainCategoryIcon(slug),
}));

function mockSubcategory(subSlug: ExploreSubcategorySlug, parentSlug: ExploreCategorySlug) {
  return {
    id: subSlug,
    parentId: parentSlug,
    name: subcategoryLabel(subSlug, 'en'),
    nameAr: subcategoryLabel(subSlug, 'ar'),
  };
}

export function buildMockExploreCategories() {
  return EXPLORE_MAIN_CATEGORY_ORDER.map((slug) => ({
    id: slug,
    name: mainCategoryLabel(slug, 'en'),
    nameAr: mainCategoryLabel(slug, 'ar'),
    icon: mainCategoryIcon(slug),
    subcategories: EXPLORE_SUBCATEGORY_ORDER[slug].map((subSlug) =>
      mockSubcategory(subSlug, slug),
    ),
  }));
}
