import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
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
import { useRestaurantPdp } from '@/hooks/useCatalogPdp';
import { getCityName } from '@/services/mock';
import { parseCatalogNumericId } from '@/services/catalog/mapCatalog';
import { formatDecimalForLocale, formatIntForLocale } from '@/utils/format';
import { formatEventTimeSlotLabel } from '@/utils/formatEventTimeSlot';
import { EVENT_TIME_OPTIONS } from '@/constants/eventTimeSlots';
import { useBookingDraftStore } from '@/store/bookingDraftStore';
import { useLocaleStore } from '@/store/localeStore';
import { fadeFromBackground, radii, spacing, useThemeColors } from '@/theme';
import type { ThemeColors } from '@/theme/palettes';

const BLURB_KEYS: Record<string, 'restaurant.blurbR1' | 'restaurant.blurbR2'> = {
  r1: 'restaurant.blurbR1',
  r2: 'restaurant.blurbR2',
};

/** Dinner slots — canonical EN labels for API; display localized via formatEventTimeSlotLabel. */
const RESTAURANT_SLOTS = [38, 39, 40, 41, 42].map((i) => EVENT_TIME_OPTIONS[i]);

export default function RestaurantDetailScreen() {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const setDraft = useBookingDraftStore((s) => s.setDraft);
  const { t, locale } = useTranslation();
  const { formatMoney } = useFormatMoney();
  const checkoutCurrency = useLocaleStore((s) => s.currency);
  const { restaurant: r, loading } = useRestaurantPdp(id);
  const [guests, setGuests] = useState(2);
  const [slot, setSlot] = useState(RESTAURANT_SLOTS[2]);

  if (loading) {
    return (
      <Screen header={<DetailHeader title={t('restaurant.title')} />}>
        <View style={{ paddingVertical: 48, alignItems: 'center' }}>
          <ActivityIndicator color={colors.primary} size="large" />
          <AppText variant="caption" color="textMuted" style={{ marginTop: spacing.md }}>
            {t('common.loading')}
          </AppText>
        </View>
      </Screen>
    );
  }

  if (!r) {
    return (
      <Screen header={<DetailHeader title={t('restaurant.title')} />}>
        <AppText color="textSecondary">{t('restaurant.notFound')}</AppText>
        <PrimaryButton title={t('common.back')} onPress={() => router.back()} style={{ marginTop: spacing.lg }} />
      </Screen>
    );
  }

  const fee = 40 * guests;
  const city = getCityName(r.cityId, locale);
  const blurbKey =
    id && parseCatalogNumericId(id) == null && r.id in BLURB_KEYS
      ? BLURB_KEYS[r.id as keyof typeof BLURB_KEYS]
      : null;

  const book = () => {
    setDraft({
      vertical: 'restaurant',
      refId: r.id,
      title: r.name,
      imageUrl: r.imageUrl,
      currency: checkoutCurrency,
      unitPrice: fee,
      quantity: 1,
      fees: 15,
      startsAt: new Date(Date.now() + 2 * 86400000).toISOString(),
      cityName: getCityName(r.cityId, 'en'),
      cityNameAr: getCityName(r.cityId, 'ar'),
      metaLine: `${slot} · ${guests} ${t('restaurant.guestsLabel')}`,
    });
    router.push('/checkout');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Image source={{ uri: r.imageUrl }} style={StyleSheet.absoluteFill} contentFit="cover" />
          <LinearGradient
            colors={[fadeFromBackground(colors, 0.3), fadeFromBackground(colors, 1)]}
            style={StyleSheet.absoluteFill}
          />
          <DetailHeader />
        </View>
        <View style={styles.body}>
          {r.badge ? <Badge tone={r.badge} /> : null}
          <AppText variant="h1" color="text">
            {r.name}
          </AppText>
          <AppText variant="body" color="textSecondary">
            {city} · {'$'.repeat(r.priceLevel)} {t('restaurant.priceLevel')}
          </AppText>
          <View style={styles.row}>
            <Ionicons name="star" size={16} color={colors.warning} />
            <AppText variant="body-em" color="textSecondary">
              {formatDecimalForLocale(r.rating, locale, 1)} ({formatIntForLocale(r.reviewCount, locale)}+{' '}
              {t('restaurant.reviewsPlus')})
            </AppText>
          </View>
          <UserRatingBlock vertical="restaurant" refId={r.id} />
          <AppText variant="body" color="textSecondary" style={styles.desc}>
            {blurbKey ? t(blurbKey) : t('restaurant.blurbDefault')}
          </AppText>
          <AppText variant="h3" color="text" style={styles.mt}>
            {t('restaurant.time')}
          </AppText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.slots}>
            {RESTAURANT_SLOTS.map((s) => (
              <Pressable key={s} onPress={() => setSlot(s)} style={[styles.slot, slot === s && styles.slotOn]}>
                <AppText variant="label" color={slot === s ? 'text' : 'textMuted'}>
                  {formatEventTimeSlotLabel(s, locale)}
                </AppText>
              </Pressable>
            ))}
          </ScrollView>
          <AppText variant="h3" color="text" style={styles.mt}>
            {t('restaurant.guests')}
          </AppText>
          <View style={styles.qty}>
            <Pressable style={styles.qtyBtn} onPress={() => setGuests((g) => Math.max(1, g - 1))}>
              <AppText variant="h3">−</AppText>
            </Pressable>
            <AppText variant="h2" color="text">
              {guests}
            </AppText>
            <Pressable style={styles.qtyBtn} onPress={() => setGuests((g) => g + 1)}>
              <AppText variant="h3">+</AppText>
            </Pressable>
          </View>
        </View>
      </ScrollView>
      <StickyBottomBar>
        <View style={styles.rowBetween}>
          <View>
            <AppText variant="caption" color="textMuted">
              {t('restaurant.holdFee')}
            </AppText>
            <AppText variant="h3" color="text">
              {formatMoney(fee + 15, checkoutCurrency)}
            </AppText>
          </View>
          <PrimaryButton title={t('restaurant.reserve')} onPress={book} style={styles.cta} />
        </View>
      </StickyBottomBar>
    </SafeAreaView>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
  safe: { flex: 1, backgroundColor: 'transparent' },
  content: { paddingBottom: 120 },
  hero: { height: 240 },
  body: { padding: spacing.screen, gap: spacing.sm },
  desc: { lineHeight: 24, marginTop: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  mt: { marginTop: spacing.md },
  slots: { marginVertical: spacing.sm },
  slot: {
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.border,
    marginEnd: spacing.sm,
    backgroundColor: colors.card,
  },
  slotOn: { borderColor: colors.primary, backgroundColor: colors.primaryMuted },
  qty: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  qtyBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
  },
  cta: { flex: 1, maxWidth: 220 },
  });
}
