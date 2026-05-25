import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/ui/AppText';
import { BusinessCategoryPickerSheet } from '@/components/forms/BusinessCategoryPickerSheet';
import { partnerCategoryRowForStored } from '@/constants/businessPartnerCategories';
import { useTranslation } from '@/i18n/useTranslation';
import { radii, spacing, useThemeColors } from '@/theme';
import type { ThemeColors } from '@/theme/palettes';
import { chevronForwardTrailing } from '@/utils/rtl';
import { textAlignStart } from '@/utils/rtlText';

type Props = {
  label: string;
  /** Persisted value: canonical English string from `BUSINESS_PARTNER_CATEGORIES`. */
  valueEn: string;
  onChangeEn: (en: string) => void;
  sheetTitle: string;
};

export function BusinessPartnerCategorySelectField({ label, valueEn, onChangeEn, sheetTitle }: Props) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { t, isRTL, locale } = useTranslation();
  const [open, setOpen] = useState(false);

  const row = partnerCategoryRowForStored(valueEn);
  const displayLabel = row
    ? locale === 'ar'
      ? row.ar
      : row.en
    : valueEn.trim() || t('businessHub.profileCategoryPlaceholder');

  const selectedEn = row?.en ?? '';

  return (
    <View style={styles.wrap}>
      <AppText variant="label" color="text" style={{ textAlign: textAlignStart(isRTL) }}>
        {label}
      </AppText>
      <Pressable
        onPress={() => setOpen(true)}
        style={({ pressed }) => [styles.field, pressed && styles.pressed]}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        <View style={[styles.iconSlot, { backgroundColor: colors.primaryMuted }]}>
          <Ionicons
            name={row?.icon ?? 'pricetag-outline'}
            size={20}
            color={colors.primary}
          />
        </View>
        <AppText
          variant="body"
          color={row || valueEn.trim() ? 'text' : 'textMuted'}
          style={[styles.value, { textAlign: textAlignStart(isRTL) }]}
          numberOfLines={1}
        >
          {displayLabel}
        </AppText>
        <Ionicons name={chevronForwardTrailing()} size={18} color={colors.textMuted} />
      </Pressable>

      <BusinessCategoryPickerSheet
        visible={open}
        onClose={() => setOpen(false)}
        selectedEn={selectedEn}
        onSelect={onChangeEn}
        title={sheetTitle}
      />
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    wrap: { gap: spacing.xs, marginBottom: spacing.md },
    field: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surfaceMuted,
      borderRadius: radii.xl,
      borderWidth: 1,
      borderColor: colors.borderLight,
      minHeight: 54,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.sm,
      gap: spacing.sm,
    },
    iconSlot: {
      width: 40,
      height: 40,
      borderRadius: radii.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    value: { flex: 1, minWidth: 0 },
    pressed: { opacity: 0.88 },
  });
}
