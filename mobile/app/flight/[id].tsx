import { useMemo } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/ui/AppText';
import { UserRatingBlock } from '@/components/ui/StarRatingInput';
import { PrimaryButton } from '@/components/ui/Button';
import { DetailHeader } from '@/components/layout/DetailHeader';
import { StickyBottomBar } from '@/components/layout/StickyBottomBar';
import { Screen } from '@/components/layout/Screen';
import { useFormatMoney } from '@/hooks/useFormatMoney';
import { useTranslation } from '@/i18n/useTranslation';
import { useFlightPdp } from '@/hooks/useCatalogPdp';
import { useLocaleStore } from '@/store/localeStore';
import { useBookingDraftStore } from '@/store/bookingDraftStore';
import { radii, spacing, useThemeColors } from '@/theme';
import type { ThemeColors } from '@/theme/palettes';

function flightStopLabel(stops: number, t: (p: string) => string) {
  if (stops === 0) return t('flight.nonstop');
  if (stops === 1) return `1 ${t('flight.stop')}`;
  return `${stops} ${t('flight.stops')}`;
}

export default function FlightDetailScreen() {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const setDraft = useBookingDraftStore((s) => s.setDraft);
  const { t, locale } = useTranslation();
  const { formatMoney } = useFormatMoney();
  const { flight: f, loading } = useFlightPdp(id);
  const displayCurrency = useLocaleStore((s) => s.currency);

  if (loading) {
    return (
      <Screen>
        <DetailHeader title={t('flight.title')} />
        <View style={{ paddingVertical: 48, alignItems: 'center' }}>
          <ActivityIndicator color={colors.primary} size="large" />
          <AppText variant="caption" color="textMuted" style={{ marginTop: spacing.md }}>
            {t('common.loading')}
          </AppText>
        </View>
      </Screen>
    );
  }

  if (!f) {
    return (
      <Screen>
        <DetailHeader title={t('flight.title')} />
        <AppText color="textSecondary">{t('flight.notFound')}</AppText>
        <PrimaryButton title={t('common.back')} onPress={() => router.back()} style={{ marginTop: spacing.lg }} />
      </Screen>
    );
  }

  const fees = Math.round(f.price * 0.06);
  const dateLocale = locale === 'ar' ? 'ar-JO' : 'en-US';

  const book = () => {
    setDraft({
      vertical: 'flight',
      refId: f.id,
      title: `${f.from} → ${f.to}`,
      imageUrl:
        'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1200&q=80&auto=format&fit=crop',
      currency: f.currency ?? displayCurrency,
      unitPrice: f.price,
      quantity: 1,
      fees,
      startsAt: f.departAt,
      cityName: f.from,
      metaLine: `${f.airline} · ${f.cabin} · ${flightStopLabel(f.stops, t)}`,
    });
    router.push('/checkout');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <DetailHeader />
          <AppText variant="overline" color="accent">
            {f.airline}
          </AppText>
          <AppText variant="display" color="text" style={styles.route}>
            {f.from} → {f.to}
          </AppText>
          <View style={styles.meta}>
            <Meta icon="time-outline" text={`${f.durationMin} min`} />
            <Meta icon="git-network-outline" text={flightStopLabel(f.stops, t)} />
            <Meta icon="airplane-outline" text={f.cabin} />
          </View>
        </View>
        <View style={styles.ratingPad}>
          <UserRatingBlock vertical="flight" refId={f.id} />
        </View>
        <View style={styles.card}>
          <Row
            label={t('flight.departs')}
            value={new Date(f.departAt).toLocaleString(dateLocale)}
          />
          <Row
            label={t('flight.arrives')}
            value={new Date(f.arriveAt).toLocaleString(dateLocale)}
          />
        </View>
      </ScrollView>
      <StickyBottomBar>
        <View style={styles.bottom}>
          <View>
            <AppText variant="caption" color="textMuted">
              {t('flight.total')}
            </AppText>
            <AppText variant="price" color="text">
              {formatMoney(f.price + fees, f.currency)}
            </AppText>
          </View>
          <PrimaryButton title={t('flight.continue')} onPress={book} style={styles.cta} />
        </View>
      </StickyBottomBar>
    </SafeAreaView>
  );
}

function Meta({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <View style={styles.metaItem}>
      <Ionicons name={icon} size={16} color={colors.textMuted} />
      <AppText variant="caption" color="textSecondary">
        {text}
      </AppText>
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View>
      <AppText variant="caption" color="textMuted">
        {label}
      </AppText>
      <AppText variant="bodyMedium" color="text">
        {value}
      </AppText>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: 120 },
  ratingPad: { paddingHorizontal: spacing.screen },
  hero: {
    paddingHorizontal: spacing.screen,
    paddingBottom: spacing.xl,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  route: { marginVertical: spacing.sm },
  meta: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginTop: spacing.sm },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  card: {
    margin: spacing.screen,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  bottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  cta: { flex: 1, maxWidth: 200 },
});

}
