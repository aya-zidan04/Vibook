import { useMemo } from 'react';
import type { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '@/i18n/useTranslation';
import { backendIconToOutline } from '@/services/reference/mapReference';
import { useCatalogSubcategories } from '@/hooks/useCatalogSubcategories';
import { useReferenceStore } from '@/store/referenceStore';
import { localizedCategoryLabel, localizedSubcategoryLabel } from '@/utils/taxonomyLabels';

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
  const { locale } = useTranslation();

  return useMemo(() => {
    const groups: EventCategoryGroup[] = categories.map((c) => {
      const subs = subsByParent[c.id] ?? [];
      const icon = backendIconToOutline(c.icon);
      const catEn = localizedCategoryLabel(c.slug, 'en', c.labelEn);
      const catAr = localizedCategoryLabel(c.slug, 'ar', c.labelAr);
      return {
        slug: c.slug,
        nameEn: catEn,
        nameAr: catAr,
        icon,
        options: subs.map((sub) => {
          const subEn = localizedSubcategoryLabel(sub.slug, 'en', sub.name);
          const subAr = localizedSubcategoryLabel(sub.slug, 'ar', sub.nameAr);
          return {
            id: sub.id,
            valueEn: `${catEn} · ${subEn}`,
            labelEn: `${catEn} · ${subEn}`,
            labelAr: `${catAr} · ${subAr}`,
            icon,
            parentSlug: c.slug,
          };
        }),
      };
    });
    return {
      groups,
      options: groups.flatMap((group) => group.options),
    };
  }, [categories, subsByParent, locale]);
}
