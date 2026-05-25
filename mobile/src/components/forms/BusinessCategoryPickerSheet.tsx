import { useMemo } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppBackground } from '@/components/ui/AppBackground';
import { AppText } from '@/components/ui/AppText';
import { BUSINESS_PARTNER_CATEGORIES } from '@/constants/businessPartnerCategories';
import { useTranslation } from '@/i18n/useTranslation';
import { radii, spacing, useThemeColors } from '@/theme';
import type { ThemeColors } from '@/theme/palettes';

type Props = {
  visible: boolean;
  onClose: () => void;
  /** Matches `BUSINESS_PARTNER_CATEGORIES[].en` of the current selection. */
  selectedEn: string;
  onSelect: (en: string) => void;
  title: string;
};

export function BusinessCategoryPickerSheet({ visible, onClose, selectedEn, onSelect, title }: Props) {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const { locale } = useTranslation();
  const styles = useMemo(
    () => createStyles(colors, insets.bottom),
    [colors, insets.bottom],
  );

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <AppBackground>
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
            {BUSINESS_PARTNER_CATEGORIES.map((c) => {
              const selected = selectedEn === c.en;
              const label = locale === 'ar' ? c.ar : c.en;
              const partsLabel = (locale === 'ar' ? c.partsAr : c.partsEn).join(' · ');
              return (
                <Pressable
                  key={c.slug}
                  onPress={() => {
                    onSelect(c.en);
                    onClose();
                  }}
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
                  <AppText
                    variant="label"
                    color="textMuted"
                    style={styles.optionParts}
                    numberOfLines={1}
                  >
                    {partsLabel}
                  </AppText>
                  {selected ? (
                    <Ionicons name="checkmark-circle" size={22} color={colors.accent} />
                  ) : (
                    <View style={styles.radioOuter} />
                  )}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
        </View>
      </AppBackground>
    </Modal>
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
      backgroundColor: 'rgba(255, 247, 251, 0.35)',
    },
    sheet: {
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
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
