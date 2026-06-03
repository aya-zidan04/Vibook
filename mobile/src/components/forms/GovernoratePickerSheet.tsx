import { useEffect, useMemo } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '@/components/ui/AppText';
import type { JordanGovernorateSlug } from '@/constants/jordanGovernorates';
import { useTranslation } from '@/i18n/useTranslation';
import { loadReferenceData, useReferenceStore } from '@/store/referenceStore';
import { radii, spacing, useThemeColors } from '@/theme';
import type { ThemeColors } from '@/theme/palettes';

type Props = {
  visible: boolean;
  onClose: () => void;
  /** Selected row matches API governorate English `nameEn`. */
  selectedEnName: string;
  onSelect: (en: string, slug: JordanGovernorateSlug | string) => void;
  title: string;
};

/** Bottom sheet listing active governorates from `GET /governorates/active`. */
export function GovernoratePickerSheet({
  visible,
  onClose,
  selectedEnName,
  onSelect,
  title,
}: Props) {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const { locale } = useTranslation();
  const cities = useReferenceStore((s) => s.governorates);
  const refStatus = useReferenceStore((s) => s.status);
  const styles = useMemo(
    () => createStyles(colors, insets.bottom),
    [colors, insets.bottom],
  );

  useEffect(() => {
    if (visible && refStatus === 'idle') void loadReferenceData();
  }, [visible, refStatus]);

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
            {cities.length === 0 ? (
              <AppText variant="body" color="textMuted" style={styles.empty}>
                —
              </AppText>
            ) : (
              cities.map((g) => {
                const selected = selectedEnName === g.nameEn;
                const label = locale === 'ar' ? g.nameAr : g.nameEn;
                const slug = (g.slug ?? g.nameEn) as JordanGovernorateSlug | string;
                return (
                  <Pressable
                    key={g.id}
                    onPress={() => {
                      onSelect(g.nameEn, slug);
                      onClose();
                    }}
                    style={({ pressed }) => [
                      styles.option,
                      selected && styles.optionSelected,
                      pressed && styles.optionPressed,
                    ]}
                  >
                    <AppText
                      variant="body-em"
                      color="text"
                      style={[styles.optionLabel, selected && styles.optionLabelSelected]}
                    >
                      {label}
                    </AppText>
                    {selected ? (
                      <Ionicons name="checkmark-circle" size={22} color={colors.primaryLight} />
                    ) : (
                      <View style={styles.radioOuter} />
                    )}
                  </Pressable>
                );
              })
            )}
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
      maxHeight: '58%',
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
      justifyContent: 'space-between',
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
