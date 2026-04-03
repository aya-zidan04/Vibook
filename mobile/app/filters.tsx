import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppText } from '@/components/ui/AppText';
import { PrimaryButton } from '@/components/ui/Button';
import { CategoryChip } from '@/components/ui/CategoryChip';
import { DetailHeader } from '@/components/layout/DetailHeader';
import { Screen } from '@/components/layout/Screen';
import { useTranslation } from '@/i18n/useTranslation';
import { isApiConfigured } from '@/config/api';
import { backendIconToOutline } from '@/services/reference/mapReference';
import { loadReferenceData, useReferenceStore } from '@/store/referenceStore';
import { radii, spacing, useThemeColors } from '@/theme';
import type { ThemeColors } from '@/theme/palettes';

export default function FiltersScreen() {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const { t, locale } = useTranslation();
  const categories = useReferenceStore((s) => s.categories);
  const refStatus = useReferenceStore((s) => s.status);
  const refError = useReferenceStore((s) => s.errorMessage);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<Set<string>>(() => new Set());
  const CHIPS = ['filters.chipTonight', 'filters.chipBudget', 'filters.chipFamily', 'filters.chipOutdoor'] as const;

  const apiOn = isApiConfigured();
  const showRefCategories = apiOn && (categories.length > 0 || refStatus === 'loading' || refStatus === 'error');

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
      {showRefCategories ? (
        <View style={styles.refBlock}>
          <AppText variant="h3" color="text" style={styles.refTitle}>
            {t('filters.categoriesFromCatalog')}
          </AppText>
          {refStatus === 'loading' && categories.length === 0 ? (
            <ActivityIndicator color={colors.primary} style={styles.refSpinner} />
          ) : null}
          {refStatus === 'error' && refError ? (
            <AppText variant="caption" color="textMuted" style={styles.refError}>
              {refError}
            </AppText>
          ) : null}
          {refStatus === 'error' && categories.length === 0 ? (
            <PrimaryButton title={t('filters.retryReference')} onPress={() => void loadReferenceData()} />
          ) : null}
          <View style={styles.chips}>
            {categories.map((c) => (
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
      ) : null}
      <View style={styles.chips}>
        {CHIPS.map((key) => (
          <Pressable key={key} style={styles.chip}>
            <AppText variant="caption" color="textSecondary">
              {t(key)}
            </AppText>
          </Pressable>
        ))}
      </View>
      <PrimaryButton title={t('filters.done')} onPress={() => router.back()} />
    </Screen>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
  pad: { paddingTop: spacing.md, gap: spacing.lg },
  refBlock: { gap: spacing.sm },
  refTitle: { marginBottom: spacing.xs },
  refSpinner: { alignSelf: 'flex-start', marginVertical: spacing.sm },
  refError: { marginBottom: spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
});

}
