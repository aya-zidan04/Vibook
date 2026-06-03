import type { CategoryResponse, SubcategoryResponse } from '@/api/types';
import type { Category } from '@/types';

export function categoryFromApi(row: CategoryResponse): Category {
  return {
    id: String(row.id),
    slug: row.slug,
    labelEn: row.name,
    /** Backend gap: categories have no `nameAr`; mirror English until API adds it. */
    labelAr: row.name,
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
      name: row.name,
      nameAr: row.name,
    }));
}
