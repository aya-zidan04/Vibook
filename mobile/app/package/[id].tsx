import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '@/components/ui/AppText';
import { Badge } from '@/components/ui/Badge';
import { PrimaryButton } from '@/components/ui/Button';
import { DetailHeader } from '@/components/layout/DetailHeader';
import { StickyBottomBar } from '@/components/layout/StickyBottomBar';
import { Screen } from '@/components/layout/Screen';
import { useFormatMoney } from '@/hooks/useFormatMoney';
import { useTranslation } from '@/i18n/useTranslation';
import { getPackageById } from '@/mock/queries';
import { useBookingDraftStore } from '@/store/bookingDraftStore';
import { colors, spacing } from '@/theme';

export default function PackageDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const setDraft = useBookingDraftStore((s) => s.setDraft);
  const { t } = useTranslation();
  const { formatMoney } = useFormatMoney();
  const p = id ? getPackageById(id) : undefined;
  const [travelers] = useState(2);

  if (!p) {
    return (
      <Screen>
        <DetailHeader title={t('package.title')} />
        <AppText color="textSecondary">{t('common.notFound')}</AppText>
        <PrimaryButton title={t('common.back')} onPress={() => router.back()} style={{ marginTop: spacing.lg }} />
      </Screen>
    );
  }

  const total = p.priceFrom * travelers;
  const fees = Math.round(total * 0.06);

  const book = () => {
    setDraft({
      vertical: 'package',
      refId: p.id,
      title: p.title,
      imageUrl: p.imageUrl,
      currency: p.currency,
      unitPrice: p.priceFrom,
      quantity: travelers,
      fees,
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

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: 120 },
  hero: { width: '100%', height: 240 },
  pad: { padding: spacing.screen, gap: spacing.sm },
  desc: { lineHeight: 24, marginTop: spacing.sm },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  cta: { flex: 1, maxWidth: 220 },
});
