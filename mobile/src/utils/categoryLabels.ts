import type { CategoryResponse, SubcategoryResponse } from '@/api/types';
import type { Category } from '@/types';
import { localizedCategoryLabel, localizedSubcategoryLabel } from '@/utils/taxonomyLabels';

export function categoryFromApi(row: CategoryResponse): Category {
  const slug = row.slug;
  return {
    id: String(row.id),
    slug,
    labelEn: localizedCategoryLabel(slug, 'en', row.name),
    labelAr: localizedCategoryLabel(slug, 'ar', row.name),
    icon: row.icon || 'grid-outline',
  };
}

export function categoriesFromApi(rows: CategoryResponse[]): Category[] {
  return rows.filter((row) => row.active).map(categoryFromApi);
}

export type LocalizedSubcategory = {
  id: string;
  parentId: string;
  slug: string;
  name: string;
  nameAr: string;
};

export function subcategoriesFromApi(
  parentCategoryId: string,
  rows: SubcategoryResponse[],
): LocalizedSubcategory[] {
  const parentNum = Number(parentCategoryId);
  return rows
    .filter(
      (row) =>
        row.active &&
        (String(row.categoryId) === parentCategoryId ||
          (!Number.isNaN(parentNum) && row.categoryId === parentNum)),
    )
    .map((row) => ({
      id: String(row.id),
      parentId: parentCategoryId,
      slug: row.slug,
      name: localizedSubcategoryLabel(row.slug, 'en', row.name),
      nameAr: localizedSubcategoryLabel(row.slug, 'ar', row.name),
    }));
}
