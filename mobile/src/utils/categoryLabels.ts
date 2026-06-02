import type { CategoryResponse, SubcategoryResponse } from '@/api/types';
import {
  EXPLORE_MAIN_CATEGORY_ORDER,
  EXPLORE_SUBCATEGORY_ORDER,
  exploreMainCategorySlugFromBackendName,
  exploreSubcategorySlugFromBackendName,
  isExploreMainCategorySlug,
  isExploreSubcategorySlug,
  mainCategoryIcon,
  mainCategoryLabel,
  sortExploreMainCategorySlugs,
  sortExploreSubcategorySlugs,
  subcategoryLabel,
  subcategoryParentSlug,
  type ExploreCategorySlug,
  type ExploreSubcategorySlug,
} from '@/constants/exploreCategoryTaxonomy';
import type { Category } from '@/types';
import { MOCK_CATEGORIES } from '@/mock/categories';

export function categoryFromApi(row: CategoryResponse): Category | null {
  const slug = isExploreMainCategorySlug(row.slug)
    ? row.slug
    : exploreMainCategorySlugFromBackendName(row.name);
  if (!slug) return null;
  return {
    id: String(row.id),
    slug,
    labelEn: mainCategoryLabel(slug, 'en'),
    labelAr: mainCategoryLabel(slug, 'ar'),
    icon: row.icon || mainCategoryIcon(slug),
  };
}

export function categoriesFromApi(rows: CategoryResponse[]): Category[] {
  const mapped = rows
    .filter((row) => row.active)
    .map(categoryFromApi)
    .filter((row): row is Category => row != null);

  const bySlug = new Map(mapped.map((row) => [row.slug, row]));
  const orderedSlugs = sortExploreMainCategorySlugs(
    EXPLORE_MAIN_CATEGORY_ORDER.filter((slug) => bySlug.has(slug)),
  );
  return orderedSlugs.map((slug) => bySlug.get(slug)!);
}

export type LocalizedSubcategory = {
  id: string;
  parentId: string;
  slug: ExploreSubcategorySlug;
  name: string;
  nameAr: string;
};

export function subcategoriesFromApi(
  parentCategoryId: string,
  parentSlug: ExploreCategorySlug,
  rows: SubcategoryResponse[],
): LocalizedSubcategory[] {
  const eligible = rows
    .filter((row) => row.active)
    .map((row) => {
      const slug = isExploreSubcategorySlug(row.slug)
        ? row.slug
        : exploreSubcategorySlugFromBackendName(row.name);
      if (!slug || subcategoryParentSlug(slug) !== parentSlug) return null;
      return {
        id: String(row.id),
        parentId: parentCategoryId,
        slug,
        name: subcategoryLabel(slug, 'en'),
        nameAr: subcategoryLabel(slug, 'ar'),
      };
    })
    .filter((row): row is LocalizedSubcategory => row != null);

  const order = sortExploreSubcategorySlugs(
    parentSlug,
    eligible.map((row) => row.slug),
  );
  const bySlug = new Map(eligible.map((row) => [row.slug, row]));
  return order.map((slug) => bySlug.get(slug)!);
}

/** Always returns all four Explore main categories (API rows override fallback by slug). */
export function mergeCategoriesWithFallback(apiCategories: Category[]): Category[] {
  const fallbackBySlug = new Map(MOCK_CATEGORIES.map((row) => [row.slug, row]));
  const apiBySlug = new Map(apiCategories.map((row) => [row.slug, row]));
  return EXPLORE_MAIN_CATEGORY_ORDER.map(
    (slug) => apiBySlug.get(slug) ?? fallbackBySlug.get(slug)!,
  );
}

export function fallbackCategories(): Category[] {
  return [...MOCK_CATEGORIES];
}

export function fallbackSubcategoriesForParent(
  parentCategoryId: string,
  parentSlug: ExploreCategorySlug,
): LocalizedSubcategory[] {
  return EXPLORE_SUBCATEGORY_ORDER[parentSlug].map((subSlug) => ({
    id: subSlug,
    parentId: parentCategoryId,
    slug: subSlug,
    name: subcategoryLabel(subSlug, 'en'),
    nameAr: subcategoryLabel(subSlug, 'ar'),
  }));
}

export {
  localizedMainCategoryName,
  localizedSubcategoryName,
  mainCategoryLabel,
  subcategoryLabel,
} from '@/constants/exploreCategoryTaxonomy';
