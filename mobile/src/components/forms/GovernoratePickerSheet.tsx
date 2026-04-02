import { useMemo } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '@/components/ui/AppText';
import {
  JORDAN_GOVERNORATES,
  type JordanGovernorateSlug,
} from '@/constants/jordanGovernorates';
import { useTranslation } from '@/i18n/useTranslation';
import { radii, spacing, useThemeColors } from '@/theme';
import type { ThemeColors } from '@/theme/palettes';

type Props = {
  visible: boolean;
  onClose: () => void;
  /** Selected row matches `JORDAN_GOVERNORATES[].en` (persisted in locale header). */
  selectedEnName: string;
  onSelect: (en: string, slug: JordanGovernorateSlug) => void;
  title: string;
};

/**
 * Shared bottom sheet listing Jordan governorates in canonical order (see `JORDAN_GOVERNORATES`).
 */
export function GovernoratePickerSheet({
  visible,
  onClose,
  selectedEnName,
  onSelect,
  title,
}: Props) {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const { t, locale } = useTranslation();
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
            {JORDAN_GOVERNORATES.map((g) => {
              const selected = selectedEnName === g.en;
              const label = locale === 'ar' ? t(`explore.gov.${g.slug}`) : g.en;
              return (
                <Pressable
                  key={g.slug}
                  onPress={() => {
                    onSelect(g.en, g.slug);
                    onClose();
                  }}
                  style={({ pressed }) => [
                    styles.option,
                    selected && styles.optionSelected,
                    pressed && styles.optionPressed,
                  ]}
                >
                  <AppText
                    variant="bodyMedium"
                    color="text"
                    style={[styles.optionLabel, selected && styles.optionLabelSelected]}
                  >
                    {label}
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
      backgroundColor: colors.overlay,
    },
    sheet: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: radii.xxl,
      borderTopRightRadius: radii.xxl,
      paddingTop: spacing.lg,
      paddingHorizontal: spacing.screen,
      paddingBottom: spacing.xxxl + sheetBottomInset,
      borderWidth: 1,
      borderColor: colors.border,
      maxHeight: '58%',
    },
    sheetTitle: {
      marginBottom: spacing.md,
      letterSpacing: 0.8,
    },
    sheetList: {
      flexGrow: 0,
    },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 14,
      paddingHorizontal: spacing.md,
      borderRadius: radii.lg,
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
      marginEnd: spacing.md,
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
  });
}
