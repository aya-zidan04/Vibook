import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppText } from '@/components/ui/AppText';
import { CategoryChip } from '@/components/ui/CategoryChip';
import { DetailHeader } from '@/components/layout/DetailHeader';
import { Screen } from '@/components/layout/Screen';
import { useCatalogSubcategories } from '@/hooks/useCatalogSubcategories';
import { useTranslation } from '@/i18n/useTranslation';
import { isExploreMainCategorySlug } from '@/constants/exploreCategoryTaxonomy';
import { backendIconToOutline } from '@/services/reference/mapReference';
import { loadReferenceData, useReferenceStore } from '@/store/referenceStore';
import { useSearchStore } from '@/store/searchStore';
import { radii, spacing, useThemeColors } from '@/theme';
import type { ThemeColors } from '@/theme/palettes';

export default function FiltersScreen() {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const { t, locale } = useTranslation();
  const categories = useReferenceStore((s) => s.categories);
  const refStatus = useReferenceStore((s) => s.status);
  const filters = useSearchStore((s) => s.filters);
  const setFilters = useSearchStore((s) => s.setFilters);

  const exploreCategories = useMemo(
    () => categories.filter((c) => isExploreMainCategorySlug(c.slug)),
    [categories],
  );
  const subsByParent = useCatalogSubcategories(exploreCategories);

  const [selectedCategoryIds, setSelectedCategoryIds] = useState<Set<string>>(
    () => new Set(filters.categoryIds),
  );
  const [selectedSubcategoryIds, setSelectedSubcategoryIds] = useState<Set<string>>(
    () => new Set(filters.subcategoryIds),
  );

  useEffect(() => {
    if (refStatus === 'idle') void loadReferenceData();
  }, [refStatus]);

  const toggleCategory = (id: string) => {
    setSelectedCategoryIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSubcategory = (id: string) => {
    setSelectedSubcategoryIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const apply = () => {
    setFilters({
      categoryIds: [...selectedCategoryIds],
      subcategoryIds: [...selectedSubcategoryIds],
    });
    router.back();
  };

  const clearAll = () => {
    setSelectedCategoryIds(new Set());
    setSelectedSubcategoryIds(new Set());
  };

  return (
    <Screen scroll contentStyle={styles.pad} header={<DetailHeader title={t('filters.title')} />}>
      <AppText variant="body" color="textSecondary">
        {t('filters.body')}
      </AppText>
      <View style={styles.refBlock}>
        <AppText variant="h3" color="text" style={styles.refTitle}>
          {t('filters.categoriesFromCatalog')}
        </AppText>
        {exploreCategories.length === 0 ? (
          <AppText variant="caption" color="textMuted">
            {refStatus === 'loading' ? t('common.loading') : t('filters.noCategories')}
          </AppText>
        ) : (
          <View style={styles.chips}>
            {exploreCategories.map((c) => (
              <CategoryChip
                key={c.id}
                label={locale === 'ar' ? c.labelAr : c.labelEn}
                icon={backendIconToOutline(c.icon)}
                selected={selectedCategoryIds.has(c.id)}
                onPress={() => toggleCategory(c.id)}
              />
            ))}
          </View>
        )}
      </View>
      {exploreCategories.some((c) => (subsByParent[c.id] ?? []).length > 0) ? (
        <View style={styles.refBlock}>
          <AppText variant="h3" color="text" style={styles.refTitle}>
            {t('filters.subcategoriesFromCatalog')}
          </AppText>
          {exploreCategories.map((c) => {
            const subs = subsByParent[c.id] ?? [];
            if (subs.length === 0) return null;
            return (
              <View key={c.id} style={styles.subGroup}>
                <AppText variant="label" color="textMuted">
                  {locale === 'ar' ? c.labelAr : c.labelEn}
                </AppText>
                <View style={styles.chips}>
                  {subs.map((sub) => (
                    <CategoryChip
                      key={sub.id}
                      label={locale === 'ar' ? sub.nameAr : sub.name}
                      selected={selectedSubcategoryIds.has(sub.id)}
                      onPress={() => toggleSubcategory(sub.id)}
                    />
                  ))}
                </View>
              </View>
            );
          })}
        </View>
      ) : null}
      <View style={styles.actions}>
        <Pressable onPress={clearAll} style={styles.clearBtn}>
          <AppText variant="body-em" color="textMuted">
            {t('filters.clear')}
          </AppText>
        </Pressable>
        <Pressable style={styles.done} onPress={apply}>
          <AppText variant="body-em" color="accentText">
            {t('filters.done')}
          </AppText>
        </Pressable>
      </View>
    </Screen>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    pad: { paddingTop: spacing.md, gap: spacing.md },
    refBlock: { gap: spacing.sm },
    refTitle: { marginBottom: spacing.xs },
    subGroup: { gap: spacing.sm, marginTop: spacing.xs },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
    actions: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: spacing.md,
    },
    clearBtn: { paddingVertical: spacing.md },
    done: {
      alignSelf: 'flex-end',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      borderRadius: radii.full,
      backgroundColor: colors.primaryMuted,
    },
  });
}
