import { useMemo } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '@/components/ui/AppText';
import {
  businessPartnerCategoriesFromCatalog,
  type BusinessPartnerCategoryRow,
} from '@/constants/businessPartnerCategories';
import { useCatalogSubcategories } from '@/hooks/useCatalogSubcategories';
import { useTranslation } from '@/i18n/useTranslation';
import { useReferenceStore } from '@/store/referenceStore';
import { radii, spacing, useThemeColors } from '@/theme';
import type { ThemeColors } from '@/theme/palettes';

type Props = {
  visible: boolean;
  onClose: () => void;
  /** Canonical English category name from the API. */
  selectedEn: string;
  onSelect: (en: string) => void;
  title: string;
};

export function BusinessCategoryPickerSheet({ visible, onClose, selectedEn, onSelect, title }: Props) {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const { locale } = useTranslation();
  const categories = useReferenceStore((s) => s.categories);
  const subsByParent = useCatalogSubcategories(categories);
  const rows = useMemo(
    () => businessPartnerCategoriesFromCatalog(categories, subsByParent),
    [categories, subsByParent],
  );
  const styles = useMemo(
    () => createStyles(colors, insets.bottom),
    [colors, insets.bottom],
  );

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.modalRoot}>
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityRole="button" />
        <View style={styles.sheet}>
          <AppText variant="overline" color="textMuted" style={styles.sheetTitle}>
            {title}
          </AppText>
          <ScrollView
            style={styles.sheetList}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {rows.length === 0 ? (
              <AppText variant="body" color="textMuted" style={styles.empty}>
                —
              </AppText>
            ) : (
              rows.map((c) => (
                <CategoryOption
                  key={c.slug}
                  row={c}
                  locale={locale}
                  selected={selectedEn === c.en}
                  onSelect={() => {
                    onSelect(c.en);
                    onClose();
                  }}
                  styles={styles}
                  colors={colors}
                />
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function CategoryOption({
  row: c,
  locale,
  selected,
  onSelect,
  styles,
  colors,
}: {
  row: BusinessPartnerCategoryRow;
  locale: 'en' | 'ar';
  selected: boolean;
  onSelect: () => void;
  styles: ReturnType<typeof createStyles>;
  colors: ThemeColors;
}) {
  const label = locale === 'ar' ? c.ar : c.en;
  const partsLabel = (locale === 'ar' ? c.partsAr : c.partsEn).join(' · ');
  return (
    <Pressable
      onPress={onSelect}
      style={({ pressed }) => [
        styles.option,
        selected && styles.optionSelected,
        pressed && styles.optionPressed,
      ]}
    >
      <View style={styles.optionIconWrap}>
        <Ionicons
          name={c.icon}
          size={19}
          color={selected ? colors.primary : colors.textSecondary}
        />
      </View>
      <AppText
        variant="body-em"
        color="text"
        style={[styles.optionLabel, selected && styles.optionLabelSelected]}
      >
        {label}
      </AppText>
      {partsLabel ? (
        <AppText variant="label" color="textMuted" style={styles.optionParts} numberOfLines={1}>
          {partsLabel}
        </AppText>
      ) : null}
      {selected ? (
        <Ionicons name="checkmark-circle" size={22} color={colors.primaryLight} />
      ) : (
        <View style={styles.radioOuter} />
      )}
    </Pressable>
  );
}

function createStyles(colors: ThemeColors, sheetBottomInset: number) {
  return StyleSheet.create({
    modalRoot: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: colors.overlayLight,
    },
    sheet: {
      backgroundColor: colors.sheetSurface,
      borderTopLeftRadius: radii.xxl,
      borderTopRightRadius: radii.xxl,
      paddingTop: spacing.lg,
      paddingHorizontal: spacing.screen,
      paddingBottom: spacing.xxxl + sheetBottomInset,
      borderWidth: 1,
      borderColor: colors.border,
      maxHeight: '62%',
    },
    sheetTitle: {
      marginBottom: spacing.md,
    },
    sheetList: {
      flexGrow: 0,
    },
    empty: {
      paddingVertical: spacing.lg,
      textAlign: 'center',
    },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      paddingVertical: 14,
      paddingHorizontal: spacing.md,
      borderRadius: radii.full,
      marginBottom: spacing.xs,
      backgroundColor: colors.backgroundElevated,
      borderWidth: 1,
      borderColor: colors.border,
    },
    optionSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.primaryMuted,
    },
    optionPressed: {
      opacity: 0.92,
    },
    optionLabel: {
      flex: 1,
      marginStart: spacing.sm,
      marginEnd: spacing.md,
      minWidth: 120,
    },
    optionParts: {
      width: '100%',
      marginTop: 2,
      marginStart: 28 + spacing.sm,
      lineHeight: 16,
    },
    optionLabelSelected: {
      fontWeight: '700',
    },
    radioOuter: {
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: 2,
      borderColor: colors.borderLight,
    },
    optionIconWrap: {
      width: 28,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
}
