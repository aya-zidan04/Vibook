import { useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { JORDAN_GOVERNORATES } from '@/constants/jordanGovernorates';
import { useTranslation } from '@/i18n/useTranslation';
import { useLocaleStore } from '@/store/localeStore';
import { radii, spacing, useThemeColors } from '@/theme';
import type { ThemeColors } from '@/theme/palettes';

type Props = {
  /** Plain wordmark (e.g. `t('common.brandDisplay')`). */
  brandLabel: string;
  onSearch: () => void;
  onLanguageCurrency: () => void;
  a11yLanguageCurrency: string;
  a11ySearch: string;
};

/** Top bar uses app background; with `direction: 'rtl'`, row starts from the right. */
export function ExploreHeader({
  brandLabel,
  onSearch,
  onLanguageCurrency,
  a11yLanguageCurrency,
  a11ySearch,
}: Props) {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors, insets.bottom), [colors, insets.bottom]);
  const { t, locale } = useTranslation();
  const regionStored = useLocaleStore((s) => s.regionLabel);
  const setRegionLabel = useLocaleStore((s) => s.setRegionLabel);
  const [pickerOpen, setPickerOpen] = useState(false);

  const regionDisplay = useMemo(() => {
    const row = JORDAN_GOVERNORATES.find((g) => g.en === regionStored);
    if (!row) return regionStored;
    return locale === 'ar' ? t(`explore.gov.${row.slug}`) : row.en;
  }, [regionStored, locale, t]);

  return (
    <View style={styles.bar}>
      <View style={styles.left}>
        <Text style={styles.wordmark} numberOfLines={1}>
          {brandLabel}
        </Text>
        <Pressable
          onPress={() => setPickerOpen(true)}
          style={({ pressed }) => [styles.regionBtn, pressed && styles.pressed]}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={t('explore.a11yGovernorate')}
          accessibilityState={{ expanded: pickerOpen }}
        >
          <Text style={styles.regionText} numberOfLines={1}>
            {regionDisplay}
          </Text>
          <Ionicons name="chevron-down" size={14} color={colors.text} />
        </Pressable>
      </View>

      <View style={styles.right}>
        <Pressable
          onPress={onLanguageCurrency}
          style={({ pressed }) => [styles.iconHit, pressed && styles.pressed]}
          accessibilityLabel={a11yLanguageCurrency}
          hitSlop={12}
        >
          <Ionicons name="globe-outline" size={24} color={colors.text} />
        </Pressable>
        <Pressable
          onPress={onSearch}
          style={({ pressed }) => [styles.iconHit, pressed && styles.pressed]}
          accessibilityLabel={a11ySearch}
          hitSlop={12}
        >
          <Ionicons name="search-outline" size={24} color={colors.text} />
        </Pressable>
      </View>

      <Modal
        visible={pickerOpen}
        animationType="fade"
        transparent
        onRequestClose={() => setPickerOpen(false)}
      >
        <View style={styles.modalRoot}>
          <Pressable style={styles.backdrop} onPress={() => setPickerOpen(false)} />
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>{t('explore.pickGovernorate')}</Text>
            <ScrollView
              style={styles.sheetList}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {JORDAN_GOVERNORATES.map((g) => {
                const selected = regionStored === g.en;
                const label = locale === 'ar' ? t(`explore.gov.${g.slug}`) : g.en;
                return (
                  <Pressable
                    key={g.slug}
                    onPress={() => {
                      setRegionLabel(g.en);
                      setPickerOpen(false);
                    }}
                    style={({ pressed }) => [
                      styles.option,
                      selected && styles.optionSelected,
                      pressed && styles.optionPressed,
                    ]}
                  >
                    <Text style={[styles.optionLabel, selected && styles.optionLabelSelected]}>{label}</Text>
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
    </View>
  );
}

function createStyles(colors: ThemeColors, sheetBottomInset: number) {
  return StyleSheet.create({
    bar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.background,
      paddingHorizontal: 20,
      paddingVertical: 14,
    },
    left: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      flexShrink: 1,
      minWidth: 0,
    },
    wordmark: {
      color: colors.text,
      fontSize: 20,
      fontWeight: '600',
      letterSpacing: -0.3,
      flexShrink: 0,
    },
    regionBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingVertical: 4,
      flexShrink: 1,
      minWidth: 0,
    },
    regionText: {
      color: colors.text,
      fontSize: 15,
      fontWeight: '500',
      textDecorationLine: 'underline',
      textDecorationColor: colors.textSecondary,
      flexShrink: 1,
    },
    right: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 20,
      flexShrink: 0,
    },
    iconHit: {
      padding: 4,
    },
    pressed: { opacity: 0.65 },
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
      color: colors.textSecondary,
      fontSize: 13,
      fontWeight: '600',
      letterSpacing: 0.6,
      textTransform: 'uppercase',
      marginBottom: spacing.md,
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
      color: colors.text,
      fontSize: 16,
      fontWeight: '500',
      marginEnd: spacing.md,
    },
    optionLabelSelected: {
      color: colors.text,
      fontWeight: '600',
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
