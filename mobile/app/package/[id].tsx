import { useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
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
import { usePackagePdp } from '@/hooks/useCatalogPdp';
import { getCityName } from '@/services/mock';
import { useBookingDraftStore } from '@/store/bookingDraftStore';
import { spacing, useThemeColors } from '@/theme';
import type { ThemeColors } from '@/theme/palettes';

export default function PackageDetailScreen() {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const setDraft = useBookingDraftStore((s) => s.setDraft);
  const { t } = useTranslation();
  const { formatMoney } = useFormatMoney();
  const { pkg: p, loading } = usePackagePdp(id);
  const [travelers] = useState(2);

  if (loading) {
    return (
      <Screen header={<DetailHeader title={t('package.title')} />}>
        <View style={{ paddingVertical: 48, alignItems: 'center' }}>
          <ActivityIndicator color={colors.primary} size="large" />
          <AppText variant="caption" color="textMuted" style={{ marginTop: spacing.md }}>
            {t('common.loading')}
          </AppText>
        </View>
      </Screen>
    );
  }

  if (!p) {
    return (
      <Screen header={<DetailHeader title={t('package.title')} />}>
        <AppText color="textSecondary">{t('common.notFound')}</AppText>
        <PrimaryButton title={t('common.back')} onPress={() => router.back()} style={{ marginTop: spacing.lg }} />
      </Screen>
    );
  }

  const total = p.priceFrom * travelers;
  const fees = Math.round(total * 0.06);

  const book = () => {
    const primaryCityId = p.cityIds[0];
    setDraft({
      vertical: 'package',
      refId: p.id,
      title: p.title,
      imageUrl: p.imageUrl,
      currency: p.currency,
      unitPrice: p.priceFrom,
      quantity: travelers,
      fees,
      startsAt: new Date(Date.now() + 21 * 86400000).toISOString(),
      cityName: primaryCityId ? getCityName(primaryCityId, 'en') : undefined,
      cityNameAr: primaryCityId ? getCityName(primaryCityId, 'ar') : undefined,
      metaLine: `${p.nights} ${t('stay.nights')} · ${travelers} ${t('package.travelers')}`,
    });
    router.push('/checkout');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Image source={{ uri: p.imageUrl }} style={styles.hero} contentFit="cover" />
        <View style={styles.pad}>
          <DetailHeader />
          {p.badge ? <Badge tone={p.badge} /> : null}
          <AppText variant="h1" color="text">
            {p.title}
          </AppText>
          <AppText variant="body" color="textSecondary">
            {p.nights} {t('stay.nights')} · {t('package.bundleMeta')}
          </AppText>
          <UserRatingBlock vertical="package" refId={p.id} />
          <AppText variant="body" color="textSecondary" style={styles.desc}>
            {t('package.body')}
          </AppText>
        </View>
      </ScrollView>
      <StickyBottomBar>
        <View style={styles.rowBetween}>
          <View>
            <AppText variant="caption" color="textMuted">
              {t('package.from')}
            </AppText>
            <AppText variant="price" color="text">
              {formatMoney(total + fees, p.currency)}
            </AppText>
          </View>
          <PrimaryButton title={t('package.reserve')} onPress={book} style={styles.cta} />
        </View>
      </StickyBottomBar>
    </SafeAreaView>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: 120 },
  hero: { width: '100%', height: 240 },
  pad: { padding: spacing.screen, gap: spacing.sm },
  desc: { lineHeight: 24, marginTop: spacing.sm },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  cta: { flex: 1, maxWidth: 220 },
});

}
