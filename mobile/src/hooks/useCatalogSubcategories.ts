import { useEffect, useState } from 'react';
import { listSubcategories } from '@/api/categoriesApi';
import { isExploreMainCategorySlug } from '@/constants/exploreCategoryTaxonomy';
import type { Category } from '@/types';
import {
  fallbackSubcategoriesForParent,
  subcategoriesFromApi,
  type LocalizedSubcategory,
} from '@/utils/categoryLabels';

export function useCatalogSubcategories(
  categories: Category[],
): Record<string, LocalizedSubcategory[]> {
  const [subsByParent, setSubsByParent] = useState<Record<string, LocalizedSubcategory[]>>({});

  useEffect(() => {
    if (categories.length === 0) {
      setSubsByParent({});
      return;
    }

    const seedFromTaxonomy = () => {
      const next: Record<string, LocalizedSubcategory[]> = {};
      for (const c of categories) {
        if (!isExploreMainCategorySlug(c.slug)) continue;
        next[c.id] = fallbackSubcategoriesForParent(c.id, c.slug);
      }
      setSubsByParent(next);
    };

    seedFromTaxonomy();

    let cancelled = false;
    void (async () => {
      const next: Record<string, LocalizedSubcategory[]> = {};
      for (const c of categories) {
        if (!isExploreMainCategorySlug(c.slug)) continue;
        const categoryIdNum = Number(c.id);
        if (!Number.isFinite(categoryIdNum)) {
          next[c.id] = fallbackSubcategoriesForParent(c.id, c.slug);
          continue;
        }
        try {
          const subs = await listSubcategories(categoryIdNum);
          if (cancelled) return;
          const fromApi = subcategoriesFromApi(c.id, c.slug, subs);
          next[c.id] =
            fromApi.length > 0
              ? fromApi
              : fallbackSubcategoriesForParent(c.id, c.slug);
        } catch {
          next[c.id] = fallbackSubcategoriesForParent(c.id, c.slug);
        }
      }
      if (!cancelled) setSubsByParent(next);
    })();

    return () => {
      cancelled = true;
    };
  }, [categories]);

  return subsByParent;
}
