import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '@/components/ui/AppText';
import { Badge } from '@/components/ui/Badge';
import { PrimaryButton } from '@/components/ui/Button';
import { DetailHeader } from '@/components/layout/DetailHeader';
import { StickyBottomBar } from '@/components/layout/StickyBottomBar';
import { Screen } from '@/components/layout/Screen';
import { useFormatMoney } from '@/hooks/useFormatMoney';
import { useTranslation } from '@/i18n/useTranslation';
import { getCityName, getHotelById } from '@/mock/queries';
import { useBookingDraftStore } from '@/store/bookingDraftStore';
import { colors, radii, spacing } from '@/theme';

export default function StayDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const setDraft = useBookingDraftStore((s) => s.setDraft);
  const { t } = useTranslation();
  const { formatMoney } = useFormatMoney();
  const h = id ? getHotelById(id) : undefined;
  const [nights] = useState(2);

  if (!h) {
    return (
      <Screen>
        <DetailHeader title={t('stay.title')} />
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
      metaLine: `${nights} ${t('stay.nights')} · ${getCityName(h.cityId)}`,
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
            {getCityName(h.cityId)} · {h.stars}★
          </AppText>
          <View style={styles.row}>
            <Ionicons name="star" size={16} color={colors.warning} />
            <AppText variant="bodyMedium" color="textSecondary">
              {h.rating.toFixed(1)} {t('stay.guestRating')}
            </AppText>
          </View>
          <AppText variant="h3" color="text" style={styles.mt}>
            {t('stay.amenities')}
          </AppText>
          <View style={styles.chips}>
            {['Wi‑Fi', 'Pool', 'Spa', 'Gym'].map((a) => (
              <View key={a} style={styles.chip}>
                <AppText variant="caption" color="textSecondary">
                  {a}
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
            <AppText variant="price" color="text">
              {formatMoney(total + fees, h.currency)}
            </AppText>
          </View>
          <PrimaryButton title={t('stay.reserve')} onPress={book} style={styles.cta} />
        </View>
      </StickyBottomBar>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
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
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cta: { flex: 1, maxWidth: 200 },
});
