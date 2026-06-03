import { useEffect, useState } from 'react';
import { listSubcategories } from '@/api/categoriesApi';
import type { Category } from '@/types';
import { subcategoriesFromApi, type LocalizedSubcategory } from '@/utils/categoryLabels';

export function useCatalogSubcategories(
  categories: Category[],
): Record<string, LocalizedSubcategory[]> {
  const [subsByParent, setSubsByParent] = useState<Record<string, LocalizedSubcategory[]>>({});

  useEffect(() => {
    if (categories.length === 0) {
      setSubsByParent({});
      return;
    }

    let cancelled = false;
    void (async () => {
      const next: Record<string, LocalizedSubcategory[]> = {};
      for (const c of categories) {
        const categoryIdNum = Number(c.id);
        if (!Number.isFinite(categoryIdNum)) {
          next[c.id] = [];
          continue;
        }
        try {
          const subs = await listSubcategories(categoryIdNum);
          if (cancelled) return;
          next[c.id] = subcategoriesFromApi(c.id, subs);
        } catch {
          next[c.id] = [];
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
