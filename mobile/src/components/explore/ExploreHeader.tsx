import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CityPickerSheet } from '@/components/forms/CityPickerSheet';
import { GovernoratePickerSheet } from '@/components/forms/GovernoratePickerSheet';
import { JORDAN_GOVERNORATES } from '@/constants/jordanGovernorates';
import { useTranslation } from '@/i18n/useTranslation';
import { useAppStore } from '@/store/appStore';
import { useLocaleStore } from '@/store/localeStore';
import { useReferenceStore } from '@/store/referenceStore';
import { spacing, useThemeColors } from '@/theme';
import type { ThemeColors } from '@/theme/palettes';

type Props = {
  /** Plain wordmark (e.g. `t('common.brandDisplay')`). */
  brandLabel: string;
  onSearch: () => void;
  onLanguageCurrency: () => void;
  a11yLanguageCurrency: string;
  a11ySearch: string;
};

/** Top bar uses app background; mirrors correctly under global RTL. */
export function ExploreHeader({
  brandLabel,
  onSearch,
  onLanguageCurrency,
  a11yLanguageCurrency,
  a11ySearch,
}: Props) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { t, locale } = useTranslation();
  const regionStored = useLocaleStore((s) => s.regionLabel);
  const setRegionLabel = useLocaleStore((s) => s.setRegionLabel);
  const selectedCityId = useAppStore((s) => s.selectedCityId);
  const setSelectedCityId = useAppStore((s) => s.setSelectedCityId);
  const cities = useReferenceStore((s) => s.cities);
  const refStatus = useReferenceStore((s) => s.status);
  const refError = useReferenceStore((s) => s.errorMessage);
  const [pickerOpen, setPickerOpen] = useState(false);

  const catalogCityMode = cities.length > 0;

  const regionDisplay = useMemo(() => {
    if (catalogCityMode) {
      if (refStatus === 'loading' && cities.length === 0) {
        return t('common.loading');
      }
      const city = cities.find((c) => c.id === selectedCityId);
      if (city) {
        return locale === 'ar' ? city.nameAr : city.nameEn;
      }
      return t('explore.pickGovernorate');
    }
    const row = JORDAN_GOVERNORATES.find((g) => g.en === regionStored);
    if (!row) return regionStored;
    return locale === 'ar' ? t(`explore.gov.${row.slug}`) : row.en;
  }, [
    catalogCityMode,
    cities,
    locale,
    refStatus,
    regionStored,
    selectedCityId,
    t,
  ]);

  const citySheetEmptyHint = useMemo(() => {
    if (!catalogCityMode || cities.length > 0) return undefined;
    if (refStatus === 'loading' || refStatus === 'idle') return t('common.loading');
    if (refStatus === 'error') return refError ?? t('common.error');
    return t('explore.emptyCities');
  }, [catalogCityMode, cities.length, refError, refStatus, t]);

  return (
    <View style={styles.bar}>
      <View style={styles.left}>
        <View style={styles.brandBlock}>
          <Text style={styles.wordmark} numberOfLines={1}>
            {brandLabel}
          </Text>
        </View>
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

      {catalogCityMode ? (
        <CityPickerSheet
          visible={pickerOpen}
          onClose={() => setPickerOpen(false)}
          cities={cities}
          selectedId={selectedCityId}
          title={t('explore.pickGovernorate')}
          locale={locale}
          emptyHint={citySheetEmptyHint}
          onSelect={setSelectedCityId}
        />
      ) : (
        <GovernoratePickerSheet
          visible={pickerOpen}
          onClose={() => setPickerOpen(false)}
          selectedEnName={regionStored}
          title={t('explore.pickGovernorate')}
          onSelect={(en) => setRegionLabel(en)}
        />
      )}
    </View>
  );
}

function createStyles(colors: ThemeColors) {
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
    brandBlock: {
      flexShrink: 1,
      minWidth: 0,
      gap: 2,
    },
    wordmark: {
      color: colors.text,
      fontSize: 20,
      fontWeight: '600',
      letterSpacing: -0.3,
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
  });
}
