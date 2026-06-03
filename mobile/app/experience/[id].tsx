import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
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
import { useExperiencePdp } from '@/hooks/useCatalogPdp';
import { localizedCityLabel } from '@/utils/governorateLabels';
import { useReferenceStore } from '@/store/referenceStore';
import { formatDecimalForLocale } from '@/utils/format';
import { useBookingDraftStore } from '@/store/bookingDraftStore';
import { spacing, useThemeColors } from '@/theme';
import type { ThemeColors } from '@/theme/palettes';

export default function ExperienceDetailScreen() {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const setDraft = useBookingDraftStore((s) => s.setDraft);
  const { t, locale } = useTranslation();
  const { formatMoney } = useFormatMoney();
  const cities = useReferenceStore((s) => s.cities);
  const { experience: x, loading } = useExperiencePdp(id);
  const [qty, setQty] = useState(2);

  if (loading) {
    return (
      <Screen header={<DetailHeader title={t('experience.title')} />}>
        <View style={{ paddingVertical: 48, alignItems: 'center' }}>
          <ActivityIndicator color={colors.primary} size="large" />
          <AppText variant="caption" color="textMuted" style={{ marginTop: spacing.md }}>
            {t('common.loading')}
          </AppText>
        </View>
      </Screen>
    );
  }

  if (!x) {
    return (
      <Screen header={<DetailHeader title={t('experience.title')} />}>
        <AppText color="textSecondary">{t('common.notFound')}</AppText>
        <PrimaryButton title={t('common.back')} onPress={() => router.back()} style={{ marginTop: spacing.lg }} />
      </Screen>
    );
  }

  const line = x.priceFrom * qty;
  const fees = Math.round(line * 0.05);

  const book = () => {
    setDraft({
      vertical: 'experience',
      refId: x.id,
      title: x.title,
      imageUrl: x.imageUrl,
      currency: x.currency,
      unitPrice: x.priceFrom,
      quantity: qty,
      fees,
      startsAt: new Date(Date.now() + 5 * 86400000).toISOString(),
      cityName: localizedCityLabel(x.cityId, 'en', cities),
      cityNameAr: localizedCityLabel(x.cityId, 'ar', cities),
      metaLine: `${x.durationHours} ${t('experience.hours')} · ${localizedCityLabel(x.cityId, locale, cities)}`,
    });
    router.push('/checkout');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Image source={{ uri: x.imageUrl }} style={styles.hero} contentFit="cover" />
        <View style={styles.pad}>
          <DetailHeader />
          {x.badge ? <Badge tone={x.badge} /> : null}
          <AppText variant="h1" color="text">
            {x.title}
          </AppText>
          <AppText variant="body" color="textSecondary">
            {x.durationHours} {t('experience.hours')} · {localizedCityLabel(x.cityId, locale, cities)}
          </AppText>
          <View style={styles.row}>
            <Ionicons name="star" size={16} color={colors.warning} />
            <AppText variant="body-em" color="textSecondary">
              {formatDecimalForLocale(x.rating, locale, 2)} {t('experience.ratingLabel')}
            </AppText>
          </View>
          <UserRatingBlock vertical="experience" refId={x.id} />
          <AppText variant="body" color="textSecondary" style={styles.desc}>
            {t('experience.body')}
          </AppText>
          <View style={styles.qty}>
            <AppText variant="body-em" color="text">
              {t('experience.guests')}
            </AppText>
            <Pressable style={styles.qtyBtn} onPress={() => setQty((q) => Math.max(1, q - 1))}>
              <AppText variant="h3">−</AppText>
            </Pressable>
            <AppText variant="h2">{qty}</AppText>
            <Pressable style={styles.qtyBtn} onPress={() => setQty((q) => q + 1)}>
              <AppText variant="h3">+</AppText>
            </Pressable>
          </View>
        </View>
      </ScrollView>
      <StickyBottomBar>
        <View style={styles.rowBetween}>
          <View>
            <AppText variant="caption" color="textMuted">
              {t('experience.total')}
            </AppText>
            <AppText variant="h3" color="text">
              {formatMoney(line + fees, x.currency)}
            </AppText>
          </View>
          <PrimaryButton title={t('experience.book')} onPress={book} style={styles.cta} />
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
  desc: { marginTop: spacing.sm, lineHeight: 22 },
  qty: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  qtyBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  cta: { flex: 1, maxWidth: 220 },
});

}
