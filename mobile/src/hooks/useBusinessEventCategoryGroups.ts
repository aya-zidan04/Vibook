import { useMemo } from 'react';
import type { Ionicons } from '@expo/vector-icons';
import { backendIconToOutline } from '@/services/reference/mapReference';
import { useCatalogSubcategories } from '@/hooks/useCatalogSubcategories';
import { useReferenceStore } from '@/store/referenceStore';

export type EventCategoryOption = {
  id: string;
  valueEn: string;
  labelEn: string;
  labelAr: string;
  icon: keyof typeof Ionicons.glyphMap;
  parentSlug: string;
};

export type EventCategoryGroup = {
  slug: string;
  nameEn: string;
  nameAr: string;
  icon: keyof typeof Ionicons.glyphMap;
  options: EventCategoryOption[];
};

export function useBusinessEventCategoryGroups(): {
  groups: EventCategoryGroup[];
  options: EventCategoryOption[];
} {
  const categories = useReferenceStore((s) => s.categories);
  const subsByParent = useCatalogSubcategories(categories);

  return useMemo(() => {
    const groups: EventCategoryGroup[] = categories.map((c) => {
      const subs = subsByParent[c.id] ?? [];
      const icon = backendIconToOutline(c.icon);
      return {
        slug: c.slug,
        nameEn: c.labelEn,
        nameAr: c.labelAr,
        icon,
        options: subs.map((sub) => ({
          id: sub.id,
          valueEn: `${c.labelEn} · ${sub.name}`,
          labelEn: `${c.labelEn} · ${sub.name}`,
          labelAr: `${c.labelAr} · ${sub.nameAr}`,
          icon,
          parentSlug: c.slug,
        })),
      };
    });
    return {
      groups,
      options: groups.flatMap((group) => group.options),
    };
  }, [categories, subsByParent]);
}
