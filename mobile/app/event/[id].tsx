import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/ui/AppText';
import { Badge } from '@/components/ui/Badge';
import { UserRatingBlock } from '@/components/ui/StarRatingInput';
import { PrimaryButton } from '@/components/ui/Button';
import { DetailHeader } from '@/components/layout/DetailHeader';
import { StickyBottomBar } from '@/components/layout/StickyBottomBar';
import { Screen } from '@/components/layout/Screen';
import { useFormatMoney } from '@/hooks/useFormatMoney';
import { useTranslation } from '@/i18n/useTranslation';
import { useEventPdp, useOrganizerForEvent } from '@/hooks/useCatalogPdp';
import { getCityName } from '@/services/mock';
import { formatDecimalForLocale, formatIntForLocale } from '@/utils/format';
import { chevronForwardTrailing } from '@/utils/rtl';
import { useBookingDraftStore } from '@/store/bookingDraftStore';
import { useLocaleStore } from '@/store/localeStore';
import { radii, spacing, useThemeColors } from '@/theme';
import type { ThemeColors } from '@/theme/palettes';

export default function EventDetailScreen() {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const setDraft = useBookingDraftStore((s) => s.setDraft);
  const { t, locale } = useTranslation();
  const { formatMoney } = useFormatMoney();

  const { event, tiers, loading } = useEventPdp(id);
  const organizer = useOrganizerForEvent(event);
  const [tierId, setTierId] = useState('');
  const [qty, setQty] = useState(1);

  useEffect(() => {
    setTierId(tiers[0]?.id ?? '');
  }, [tiers]);

  const activeTier = useMemo(() => tiers.find((te) => te.id === tierId) ?? tiers[0], [tiers, tierId]);

  const displayCurrency = useLocaleStore((s) => s.currency);
  const lineTotal = activeTier ? activeTier.price * qty : 0;
  const currency = event?.currency ?? displayCurrency;
  const fees = Math.round(lineTotal * 0.05);

  if (loading) {
    return (
      <Screen header={<DetailHeader title={t('explore.event')} />}>
        <View style={{ paddingVertical: 48, alignItems: 'center' }}>
          <ActivityIndicator color={colors.primary} size="large" />
          <AppText variant="caption" color="textMuted" style={{ marginTop: spacing.md }}>
            {t('common.loading')}
          </AppText>
        </View>
      </Screen>
    );
  }

  if (!event) {
    return (
      <Screen header={<DetailHeader title={t('event.notFoundTitle')} />}>
        <AppText variant="body" color="textSecondary">
          {t('event.notFound')}
        </AppText>
        <PrimaryButton title={t('event.goBack')} onPress={() => router.back()} style={{ marginTop: spacing.lg }} />
      </Screen>
    );
  }

  const dateLocale = locale === 'ar' ? 'ar-JO' : 'en-US';
  const dateStr = new Date(event.startAt).toLocaleString(dateLocale, { dateStyle: 'medium', timeStyle: 'short' });

  const onBook = () => {
    if (!activeTier) return;
    setDraft({
      vertical: 'event',
      refId: event.id,
      title: event.title,
      imageUrl: event.imageUrl,
      currency,
      unitPrice: activeTier.price,
      quantity: qty,
      fees,
      startsAt: event.startAt,
      cityName: getCityName(event.cityId, 'en'),
      cityNameAr: getCityName(event.cityId, 'ar'),
      tierName: activeTier.name,
      metaLine: `${formatMoney(lineTotal, currency)} ${t('event.plusFees')}`,
    });
    router.push('/checkout');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.root}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.hero}>
            <Image source={{ uri: event.imageUrl }} style={StyleSheet.absoluteFill} contentFit="cover" />
            <LinearGradient colors={['transparent', colors.background]} style={StyleSheet.absoluteFill} />
            <View style={styles.heroHeader}>
              <DetailHeader
                right={
                  <Pressable hitSlop={8}>
                    <Ionicons name="share-outline" size={22} color={colors.text} />
                  </Pressable>
                }
              />
            </View>
          </View>

          <View style={styles.body}>
            {event.badge ? <Badge tone={event.badge} /> : null}
            <AppText variant="h1" color="text" style={styles.title}>
              {event.title}
            </AppText>
            <View style={styles.row}>
              <Ionicons name="star" size={16} color={colors.warning} />
              <AppText variant="bodyMedium" color="textSecondary">
                {formatDecimalForLocale(event.rating, locale, 1)} · {formatIntForLocale(event.reviewCount, locale)}{' '}
                {t('event.reviewsWord')}
              </AppText>
            </View>

            <UserRatingBlock vertical="event" refId={event.id} />

            <View style={styles.card}>
              <Row icon="calendar-outline" label={t('event.date')} value={dateStr} />
              <Row icon="location-outline" label={t('event.venue')} value={`${event.venueName}, ${getCityName(event.cityId, locale)}`} />
              <Row icon="navigate-outline" label={t('event.address')} value={event.address} />
            </View>

            {organizer ? (
              <Pressable style={styles.org} onPress={() => router.push(`/organizer/${organizer.id}`)}>
                <Image source={{ uri: organizer.logoUrl }} style={styles.orgLogo} />
                <View style={{ flex: 1 }}>
                  <AppText variant="h3" color="text">
                    {organizer.name}
                  </AppText>
                  <AppText variant="caption" color="textMuted">
                    {t('event.organizer')} · {organizer.verified ? t('organizer.verified') : t('event.host')}
                  </AppText>
                </View>
                <Ionicons name={chevronForwardTrailing()} size={18} color={colors.textMuted} />
              </Pressable>
            ) : null}

            <AppText variant="h3" color="text" style={styles.sectionTitle}>
              {t('event.about')}
            </AppText>
            <AppText variant="body" color="textSecondary" style={styles.desc}>
              {event.description}
            </AppText>

            <AppText variant="h3" color="text" style={styles.sectionTitle}>
              {t('event.tickets')}
            </AppText>
            {tiers.length > 0 ? (
              tiers.map((tier) => {
                const subtitle =
                  (tier.description && tier.description.trim()) || tier.benefits.filter(Boolean).join(' · ');
                return (
                  <Pressable
                    key={tier.id}
                    onPress={() => setTierId(tier.id)}
                    style={[styles.tier, tierId === tier.id && styles.tierOn]}
                  >
                    <View style={{ flex: 1 }}>
                      <AppText variant="bodyMedium" color="text">
                        {tier.name}
                      </AppText>
                      {subtitle ? (
                        <AppText variant="caption" color="textMuted">
                          {subtitle}
                        </AppText>
                      ) : null}
                    </View>
                    <AppText variant="price" color="accent">
                      {formatMoney(tier.price, tier.currency)}
                    </AppText>
                  </Pressable>
                );
              })
            ) : (
              <AppText variant="body" color="textSecondary">
                {t('event.noTicketsConfigured')}
              </AppText>
            )}

            <View style={styles.qtyRow}>
              <AppText variant="bodyMedium" color="text">
                {t('event.quantity')}
              </AppText>
              <View style={styles.qtyBtns}>
                <Pressable style={styles.qtyBtn} onPress={() => setQty((q) => Math.max(1, q - 1))}>
                  <AppText variant="h3">−</AppText>
                </Pressable>
                <AppText variant="h3" color="text">
                  {qty}
                </AppText>
                <Pressable style={styles.qtyBtn} onPress={() => setQty((q) => q + 1)}>
                  <AppText variant="h3">+</AppText>
                </Pressable>
              </View>
            </View>

            <AppText variant="h3" color="text" style={styles.sectionTitle}>
              {t('event.similar')}
            </AppText>
            <AppText variant="caption" color="textMuted">
              {t('event.similarHint')} {getCityName(event.cityId, locale)}.
            </AppText>
          </View>
        </ScrollView>

        <StickyBottomBar>
          <View style={styles.bottomRow}>
            <View>
              <AppText variant="caption" color="textMuted">
                {t('event.total')}
              </AppText>
              <AppText variant="price" color="text">
                {formatMoney(lineTotal + fees, currency)}
              </AppText>
            </View>
            <PrimaryButton
              title={t('event.bookNow')}
              onPress={onBook}
              style={styles.cta}
              disabled={!activeTier}
            />
          </View>
        </StickyBottomBar>
      </View>
    </SafeAreaView>
  );
}

function Row({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <View style={styles.metaRow}>
      <Ionicons name={icon} size={18} color={colors.primary} />
      <View style={{ flex: 1 }}>
        <AppText variant="caption" color="textMuted">
          {label}
        </AppText>
        <AppText variant="bodyMedium" color="text">
          {value}
        </AppText>
      </View>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  root: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 120 },
  hero: { height: 280 },
  heroHeader: { paddingHorizontal: spacing.screen, paddingTop: spacing.md },
  body: { paddingHorizontal: spacing.screen, paddingTop: spacing.lg, gap: spacing.sm },
  title: { marginTop: spacing.xs },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: spacing.md },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  metaRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  org: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  orgLogo: { width: 48, height: 48, borderRadius: 24 },
  desc: { lineHeight: 24 },
  sectionTitle: { marginTop: spacing.md },
  tier: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  tierOn: { borderColor: colors.primary, backgroundColor: colors.primaryMuted },
  qtyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  qtyBtns: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  qtyBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  cta: { flex: 1, maxWidth: 220 },
});

}
