import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/ui/AppText';
import { HeaderSeparationChrome } from '@/components/layout/HeaderSeparationChrome';
import { CityPickerSheet } from '@/components/forms/CityPickerSheet';
import { useTranslation } from '@/i18n/useTranslation';
import { localizedCityLabel } from '@/utils/governorateLabels';
import { useAppStore } from '@/store/appStore';
import { useReferenceStore } from '@/store/referenceStore';
import { spacing, useThemeColors } from '@/theme';
import type { ThemeColors } from '@/theme/palettes';
import { textAlignStart } from '@/utils/rtlText';

type Props = {
  brandLabel: string;
  onSearch: () => void;
  a11ySearch: string;
};

/** Top bar uses app background; mirrors correctly under global RTL. */
export function ExploreHeader({
  brandLabel,
  onSearch,
  a11ySearch,
}: Props) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { t, locale, isRTL } = useTranslation();
  const selectedCityId = useAppStore((s) => s.selectedCityId);
  const setSelectedCityId = useAppStore((s) => s.setSelectedCityId);
  const governorates = useReferenceStore((s) => s.governorates);
  const refStatus = useReferenceStore((s) => s.status);
  const governoratesFromApi = useReferenceStore((s) => s.governoratesFromApi);
  const [pickerOpen, setPickerOpen] = useState(false);

  const regionDisplay = useMemo(() => {
    if (refStatus === 'loading' && governorates.length === 0) {
      return t('common.loading');
    }
    const city = governorates.find((c) => c.id === selectedCityId);
    if (city) {
      return localizedCityLabel(city.id, locale, governorates);
    }
    return t('explore.pickGovernorate');
  }, [governorates, locale, refStatus, selectedCityId, t]);

  const citySheetEmptyHint = useMemo(() => {
    if (governorates.length > 0) return undefined;
    if (refStatus === 'loading' || refStatus === 'idle') return t('common.loading');
    if (refStatus === 'error') return t('errors.referenceLoad');
    return t('explore.emptyCities');
  }, [governorates.length, refStatus, t]);

  return (
    <HeaderSeparationChrome>
      <View style={styles.bar}>
      <AppText variant="h2" color="text" numberOfLines={1} style={styles.wordmark}>
        {brandLabel}
      </AppText>

      <View style={styles.right}>
        <Pressable
          onPress={() => setPickerOpen(true)}
          style={({ pressed }) => [styles.regionBtn, pressed && styles.pressed]}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={t('explore.a11yGovernorate')}
          accessibilityState={{ expanded: pickerOpen }}
        >
          <AppText
            variant="body-em"
            color="text"
            numberOfLines={1}
            style={[styles.regionText, { textAlign: textAlignStart(isRTL) }]}
          >
            {regionDisplay}
          </AppText>
          <Ionicons name="chevron-down" size={14} color={colors.text} />
        </Pressable>

        <Pressable
          onPress={onSearch}
          style={({ pressed }) => [styles.iconHit, pressed && styles.pressed]}
          accessibilityLabel={a11ySearch}
          hitSlop={12}
        >
          <Ionicons name="search-outline" size={24} color={colors.icon} />
        </Pressable>
      </View>

      <CityPickerSheet
        visible={pickerOpen}
        onClose={() => setPickerOpen(false)}
        cities={governorates}
        selectedId={selectedCityId}
        title={t('explore.pickGovernorate')}
        locale={locale}
        emptyHint={citySheetEmptyHint}
        onSelect={(id) => {
          setSelectedCityId(id);
          if (__DEV__) {
            console.log(
              '[ExploreHeader] selected governorate id:',
              id,
              governoratesFromApi ? '(API)' : '(fallback)',
            );
          }
        }}
      />
      </View>
    </HeaderSeparationChrome>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    bar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: 'transparent',
      paddingHorizontal: 20,
      paddingTop: 14,
      paddingBottom: 14,
      marginBottom: spacing.lg,
    },
    wordmark: {
      flexShrink: 1,
      minWidth: 0,
      marginEnd: spacing.md,
    },
    right: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      flexShrink: 0,
    },
    regionBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingVertical: 4,
      maxWidth: 140,
    },
    regionText: {
      textDecorationLine: 'underline',
      textDecorationColor: colors.textSecondary,
      flexShrink: 1,
    },
    iconHit: {
      flexShrink: 0,
      padding: 4,
    },
    pressed: { opacity: 0.65 },
  });
}
