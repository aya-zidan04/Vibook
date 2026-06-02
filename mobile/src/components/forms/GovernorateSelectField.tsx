import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/ui/AppText';
import { GovernoratePickerSheet } from '@/components/forms/GovernoratePickerSheet';
import { JORDAN_GOVERNORATES, type JordanGovernorateSlug } from '@/constants/jordanGovernorates';
import { useTranslation } from '@/i18n/useTranslation';
import { governorateLabel } from '@/utils/governorateLabels';
import { radii, spacing, useThemeColors } from '@/theme';
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
  valueSlug: JordanGovernorateSlug;
  onChangeSlug: (slug: JordanGovernorateSlug) => void;
  sheetTitle: string;
  /** Match partner event form: muted pill row + map icon. */
  appearance?: 'default' | 'business';
};

function enNameForSlug(slug: JordanGovernorateSlug): string {
  return JORDAN_GOVERNORATES.find((g) => g.slug === slug)?.en ?? 'Amman';
}

/**
 * Tappable field that opens the shared governorate picker (edit profile, forms).
 */
export function GovernorateSelectField({
  label,
  valueSlug,
  onChangeSlug,
  sheetTitle,
  appearance = 'default',
}: Props) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { locale, isRTL } = useTranslation();
  const [open, setOpen] = useState(false);

  const selectedEn = enNameForSlug(valueSlug);
  const displayLabel = governorateLabel(valueSlug, locale);

  return (
    <View style={styles.wrap}>
      <AppText variant="label" color="text" style={formAlignStyle(isRTL)}>
        {label}
      </AppText>
      <Pressable
        onPress={() => setOpen(true)}
        style={({ pressed }) => [
          styles.field,
          appearance === 'business'
            ? [businessLeadingIconRowStyle, businessFieldRowStyle(colors), styles.fieldBusiness]
            : styles.fieldDefault,
          pressed && styles.pressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        {appearance === 'business' ? (
          <BusinessFieldIconSlot>
            <Ionicons name="map-outline" size={20} color={colors.primary} />
          </BusinessFieldIconSlot>
        ) : null}
        <BusinessFieldPickerValue
          locale={locale}
          isRTL={isRTL}
          color={colors.text}
          alignStyle={formAlignStyle(isRTL)}
        >
          {displayLabel}
        </BusinessFieldPickerValue>
      </Pressable>

      <GovernoratePickerSheet
        visible={open}
        onClose={() => setOpen(false)}
        selectedEnName={selectedEn}
        title={sheetTitle}
        onSelect={(_en, slug) => onChangeSlug(slug)}
      />
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    wrap: { gap: spacing.xs, marginBottom: spacing.md },
    field: {
      gap: spacing.sm,
    },
    fieldDefault: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: radii.md,
      borderWidth: 1,
      borderColor: colors.border,
      minHeight: 52,
      paddingHorizontal: spacing.md,
    },
    fieldBusiness: {
      paddingHorizontal: spacing.sm,
    },
    pressed: { opacity: 0.88 },
  });
}
