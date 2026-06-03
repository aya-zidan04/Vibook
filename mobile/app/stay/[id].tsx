import { useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '@/components/ui/AppText';
import { Badge } from '@/components/ui/Badge';
import { UserRatingBlock } from '@/components/ui/StarRatingInput';
import { PrimaryButton } from '@/components/ui/Button';
import { DetailHeader } from '@/components/layout/DetailHeader';
import { StickyBottomBar } from '@/components/layout/StickyBottomBar';
import { Screen } from '@/components/layout/Screen';
import { useFormatMoney } from '@/hooks/useFormatMoney';
import { useTranslation } from '@/i18n/useTranslation';
import { useHotelPdp } from '@/hooks/useCatalogPdp';
import { localizedCityLabel } from '@/utils/governorateLabels';
import { useReferenceStore } from '@/store/referenceStore';
import { formatDecimalForLocale, formatIntForLocale } from '@/utils/format';
import { useBookingDraftStore } from '@/store/bookingDraftStore';
import { radii, spacing, useThemeColors } from '@/theme';
import type { ThemeColors } from '@/theme/palettes';

export default function StayDetailScreen() {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const setDraft = useBookingDraftStore((s) => s.setDraft);
  const { t, locale } = useTranslation();
  const { formatMoney } = useFormatMoney();
  const cities = useReferenceStore((s) => s.cities);
  const { hotel: h, loading } = useHotelPdp(id);
  const [nights] = useState(2);

  if (loading) {
    return (
      <Screen header={<DetailHeader title={t('stay.title')} />}>
        <View style={{ paddingVertical: 48, alignItems: 'center' }}>
          <ActivityIndicator color={colors.primary} size="large" />
          <AppText variant="caption" color="textMuted" style={{ marginTop: spacing.md }}>
            {t('common.loading')}
          </AppText>
        </View>
      </Screen>
    );
  }

  if (!h) {
    return (
      <Screen header={<DetailHeader title={t('stay.title')} />}>
        <AppText color="textSecondary">{t('common.notFound')}</AppText>
        <PrimaryButton title={t('common.back')} onPress={() => router.back()} style={{ marginTop: spacing.lg }} />
      </Screen>
    );
  }

  const total = h.priceFrom * nights;
  const fees = Math.round(total * 0.08);

  const book = () => {
    setDraft({
      vertical: 'stay',
      refId: h.id,
      title: h.name,
      imageUrl: h.imageUrl,
      currency: h.currency,
      unitPrice: h.priceFrom,
      quantity: nights,
      fees,
      startsAt: new Date(Date.now() + 14 * 86400000).toISOString(),
      cityName: localizedCityLabel(h.cityId, 'en', cities),
      cityNameAr: localizedCityLabel(h.cityId, 'ar', cities),
      metaLine: `${nights} ${t('stay.nights')} · ${localizedCityLabel(h.cityId, locale, cities)}`,
    });
    router.push('/checkout');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Image source={{ uri: h.imageUrl }} style={styles.hero} contentFit="cover" />
        <View style={styles.pad}>
          <DetailHeader />
          {h.badge ? <Badge tone={h.badge} /> : null}
          <AppText variant="h1" color="text">
            {h.name}
          </AppText>
          <AppText variant="body" color="textSecondary">
            {localizedCityLabel(h.cityId, locale, cities)} · {formatIntForLocale(h.stars, locale)}★
          </AppText>
          <View style={styles.row}>
            <Ionicons name="star" size={16} color={colors.warning} />
            <AppText variant="body-em" color="textSecondary">
              {formatDecimalForLocale(h.rating, locale, 1)} {t('stay.guestRating')}
            </AppText>
          </View>
          <UserRatingBlock vertical="stay" refId={h.id} />
          <AppText variant="h3" color="text" style={styles.mt}>
            {t('stay.amenities')}
          </AppText>
          <View style={styles.chips}>
            {(
              ['stay.amenityWifi', 'stay.amenityPool', 'stay.amenitySpa', 'stay.amenityGym'] as const
            ).map((key) => (
              <View key={key} style={styles.chip}>
                <AppText variant="caption" color="textSecondary">
                  {t(key)}
                </AppText>
              </View>
            ))}
          </View>
          <AppText variant="body" color="textSecondary" style={styles.mt}>
            {t('stay.cancellation')}
          </AppText>
        </View>
      </ScrollView>
      <StickyBottomBar>
        <View style={styles.rowBetween}>
          <View>
            <AppText variant="caption" color="textMuted">
              {nights} {t('stay.nights')}
            </AppText>
            <AppText variant="h3" color="text">
              {formatMoney(total + fees, h.currency)}
            </AppText>
          </View>
          <PrimaryButton title={t('stay.reserve')} onPress={book} style={styles.cta} />
        </View>
      </StickyBottomBar>
    </SafeAreaView>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
  safe: { flex: 1, backgroundColor: 'transparent' },
  content: { paddingBottom: 120 },
  hero: { width: '100%', height: 260 },
  pad: { padding: spacing.screen, gap: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  mt: { marginTop: spacing.md },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radii.full,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cta: { flex: 1, maxWidth: 200 },
});

}
