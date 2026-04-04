import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/ui/AppText';
import { GovernoratePickerSheet } from '@/components/forms/GovernoratePickerSheet';
import { JORDAN_GOVERNORATES, type JordanGovernorateSlug } from '@/constants/jordanGovernorates';
import { useTranslation } from '@/i18n/useTranslation';
import { radii, spacing, useThemeColors } from '@/theme';
import type { ThemeColors } from '@/theme/palettes';
import { chevronForwardTrailing } from '@/utils/rtl';

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
  const { t, locale, isRTL } = useTranslation();
  const [open, setOpen] = useState(false);

  const selectedEn = enNameForSlug(valueSlug);
  const displayLabel = locale === 'ar' ? t(`explore.gov.${valueSlug}`) : selectedEn;

  return (
    <View style={styles.wrap}>
      <AppText
        variant="caption"
        color="text"
        style={[styles.label, { textAlign: isRTL ? 'right' : 'left' }]}
      >
        {label}
      </AppText>
      <Pressable
        onPress={() => setOpen(true)}
        style={({ pressed }) => [
          styles.field,
          appearance === 'business' && styles.fieldBusiness,
          pressed && styles.pressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        {appearance === 'business' ? (
          <View style={[styles.iconSlot, { backgroundColor: colors.primaryMuted }]}>
            <Ionicons name="map-outline" size={20} color={colors.primary} />
          </View>
        ) : null}
        <AppText
          variant="body"
          color="text"
          style={[styles.value, { textAlign: isRTL ? 'right' : 'left' }]}
          numberOfLines={1}
        >
          {displayLabel}
        </AppText>
        <Ionicons name={chevronForwardTrailing()} size={18} color={colors.textMuted} />
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
    label: { fontWeight: '600' },
    field: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.surface,
      borderRadius: radii.md,
      borderWidth: 1,
      borderColor: colors.border,
      minHeight: 52,
      paddingHorizontal: spacing.md,
      gap: spacing.sm,
    },
    fieldBusiness: {
      backgroundColor: colors.surfaceMuted,
      borderRadius: radii.xl,
      borderColor: colors.borderLight,
      minHeight: 54,
      paddingHorizontal: spacing.sm,
    },
    iconSlot: {
      width: 40,
      height: 40,
      borderRadius: radii.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    value: { flex: 1 },
    pressed: { opacity: 0.88 },
  });
}
