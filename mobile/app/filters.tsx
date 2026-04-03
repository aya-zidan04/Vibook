import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppText } from '@/components/ui/AppText';
import { CategoryChip } from '@/components/ui/CategoryChip';
import { DetailHeader } from '@/components/layout/DetailHeader';
import { Screen } from '@/components/layout/Screen';
import { useTranslation } from '@/i18n/useTranslation';
import { backendIconToOutline } from '@/services/reference/mapReference';
import { MOCK_CATEGORIES } from '@/services/mock';
import type { Category } from '@/types';
import { radii, spacing, useThemeColors } from '@/theme';
import type { ThemeColors } from '@/theme/palettes';

export default function FiltersScreen() {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const { t, locale } = useTranslation();
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<Set<string>>(() => new Set());
  const CHIPS = ['filters.chipTonight', 'filters.chipBudget', 'filters.chipFamily', 'filters.chipOutdoor'] as const;

  const toggleCategory = (id: string) => {
    setSelectedCategoryIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <Screen scroll contentStyle={styles.pad}>
      <DetailHeader title={t('filters.title')} />
      <AppText variant="body" color="textSecondary">
        {t('filters.body')}
      </AppText>
      <View style={styles.refBlock}>
        <AppText variant="h3" color="text" style={styles.refTitle}>
          {t('filters.categoriesFromCatalog')}
        </AppText>
        <View style={styles.chips}>
          {MOCK_CATEGORIES.map((c: Category) => (
            <CategoryChip
              key={c.id}
              label={locale === 'ar' ? c.labelAr : c.labelEn}
              icon={backendIconToOutline(c.icon)}
              selected={selectedCategoryIds.has(c.id)}
              onPress={() => toggleCategory(c.id)}
            />
          ))}
        </View>
      </View>
      <View style={styles.chips}>
        {CHIPS.map((key) => (
          <Pressable key={key} style={styles.chip}>
            <AppText variant="caption" color="textSecondary">
              {t(key)}
            </AppText>
          </Pressable>
        ))}
      </View>
      <Pressable style={styles.done} onPress={() => router.back()}>
        <AppText variant="bodyMedium" color="accent">
          {t('filters.done')}
        </AppText>
      </Pressable>
    </Screen>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    pad: { paddingTop: spacing.md, gap: spacing.md },
    refBlock: { gap: spacing.sm },
    refTitle: { marginBottom: spacing.xs },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
    chip: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: radii.full,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    done: { alignSelf: 'flex-end', paddingVertical: spacing.md },
  });
}
