import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/ui/AppText';
import { BusinessCategoryPickerSheet } from '@/components/forms/BusinessCategoryPickerSheet';
import { partnerCategoryRowForStored } from '@/constants/businessPartnerCategories';
import { useTranslation } from '@/i18n/useTranslation';
import { useReferenceStore } from '@/store/referenceStore';
import { spacing, useThemeColors } from '@/theme';
import type { ThemeColors } from '@/theme/palettes';
import {
  BusinessFieldIconSlot,
  BusinessFieldPickerValue,
  businessLeadingIconRowStyle,
  businessFieldRowStyle,
} from '@/components/business/businessFieldRow';
import { formAlignStyle } from '@/utils/rtlText';

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
  const categories = useReferenceStore((s) => s.categories);

  const row = partnerCategoryRowForStored(valueEn, categories);
  const displayLabel = row
    ? locale === 'ar'
      ? row.ar
      : row.en
    : valueEn.trim() || t('businessHub.profileCategoryPlaceholder');

  const selectedEn = row?.en ?? '';

  return (
    <View style={styles.wrap}>
      <AppText variant="label" color="text" style={formAlignStyle(isRTL)}>
        {label}
      </AppText>
      <Pressable
        onPress={() => setOpen(true)}
        style={({ pressed }) => [
          styles.field,
          businessLeadingIconRowStyle,
          businessFieldRowStyle(colors),
          pressed && styles.pressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        <BusinessFieldIconSlot>
          <Ionicons
            name={row?.icon ?? 'pricetag-outline'}
            size={20}
            color={colors.primary}
          />
        </BusinessFieldIconSlot>
        <BusinessFieldPickerValue
          locale={locale}
          isRTL={isRTL}
          color={row || valueEn.trim() ? colors.text : colors.placeholder}
          alignStyle={formAlignStyle(isRTL)}
        >
          {displayLabel}
        </BusinessFieldPickerValue>
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
      gap: spacing.sm,
      paddingHorizontal: spacing.sm,
    },
    pressed: { opacity: 0.88 },
  });
}
