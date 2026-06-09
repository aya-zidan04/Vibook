import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, ScrollView, Share, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
import { useEventPdp } from '@/hooks/useCatalogPdp';
import { localizedCityLabel } from '@/utils/governorateLabels';
import { useAppStore } from '@/store/appStore';
import { useReferenceStore } from '@/store/referenceStore';
import { ratingKey } from '@/services/ratings';
import { useUserRatingsStore } from '@/store/userRatingsStore';
import { formatDecimalForLocale, formatIntForLocale } from '@/utils/format';
import { useBookingDraftStore } from '@/store/bookingDraftStore';
import { useLocaleStore } from '@/store/localeStore';
import { fadeFromBackground, radii, spacing, useThemeColors } from '@/theme';
import type { ThemeColors } from '@/theme/palettes';
import type { ModerationReportType } from '@/api/types';
import { EventFavoriteButton } from '@/components/event/EventFavoriteButton';
import { EventPhotoGallery } from '@/components/event/EventPhotoGallery';
import { ReportIssueModal } from '@/components/report/ReportIssueModal';
import { favoriteStatus } from '@/api/favoritesApi';
import { useFavoritesStore } from '@/store/favoritesStore';
import { apiTimeSlotIdFromTier } from '@/services/api/eventMap';
import { canIncreaseTicketQuantity, clampTicketQuantity } from '@/utils/eventTicketQuantity';

export default function EventDetailScreen() {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const setDraft = useBookingDraftStore((s) => s.setDraft);
  const { t, locale } = useTranslation();
  const { formatMoney } = useFormatMoney();
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const cities = useReferenceStore((s) => s.cities);

  const { event, tiers, loading, error, apiDetail, refetchApiDetail } = useEventPdp(id);

  const cityDisplay = useMemo(() => {
    if (!event) return '';
    return localizedCityLabel(event.cityId, locale, cities);
  }, [cities, event, locale]);

  const canRateEvent = apiDetail?.canRate === true;
  const showUserRating =
    isAuthenticated && apiDetail != null && (canRateEvent || apiDetail.myRating != null);

  useEffect(() => {
    if (!id || !apiDetail) return;
    const key = ratingKey('event', id);
    if (apiDetail.myRating != null) {
      useUserRatingsStore.getState().setRating(key, apiDetail.myRating);
    } else if (!apiDetail.canRate) {
      useUserRatingsStore.getState().setRating(key, null);
    }
  }, [id, apiDetail?.myRating, apiDetail?.canRate, apiDetail]);

  useEffect(() => {
    if (!id || !/^\d+$/.test(id) || !isAuthenticated) return;
    let cancelled = false;
    void (async () => {
      try {
        const status = await favoriteStatus(Number(id));
        if (cancelled) return;
        useFavoritesStore.getState().setFavoriteState('event', id, status.favorited);
      } catch {
        /* keep local state */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, isAuthenticated]);
  const [tierId, setTierId] = useState('');
  const [qty, setQty] = useState(1);
  const [reportCtx, setReportCtx] = useState<{
    type: ModerationReportType;
    targetId: number | null;
  } | null>(null);

  const openEventReport = () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (apiDetail?.id == null) return;
    setReportCtx({ type: 'EVENT', targetId: apiDetail.id });
  };

  useEffect(() => {
    setTierId(tiers[0]?.id ?? '');
  }, [tiers]);

  const maxQuantity = apiDetail?.remainingCapacity ?? null;
  const soldOut = maxQuantity === 0;
  const canIncreaseQty = canIncreaseTicketQuantity(qty, maxQuantity);
  const atMaxQuantity = maxQuantity != null && maxQuantity > 0 && qty >= maxQuantity;

  useEffect(() => {
    if (maxQuantity == null) return;
    setQty((current) => clampTicketQuantity(current, maxQuantity));
  }, [maxQuantity]);

  const activeTier = useMemo(() => tiers.find((te) => te.id === tierId) ?? tiers[0], [tiers, tierId]);

  const displayCurrency = useLocaleStore((s) => s.currency);
  const lineTotal = activeTier ? activeTier.price * qty : 0;
  const currency = event?.currency ?? displayCurrency;

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

  if (error) {
    return (
      <Screen header={<DetailHeader title={t('explore.event')} />}>
        <AppText variant="body" color="textSecondary">
          {t('common.error')}
        </AppText>
        <PrimaryButton
          title={t('common.retry')}
          onPress={refetchApiDetail}
          style={{ marginTop: spacing.lg }}
        />
      </Screen>
    );
  }

  if (!event) {
    const numericGuest = id && /^\d+$/.test(id) && !isAuthenticated;
    return (
      <Screen header={<DetailHeader title={t('event.notFoundTitle')} />}>
        <AppText variant="body" color="textSecondary">
          {numericGuest ? t('explore.signInForEvents') : t('event.notFound')}
        </AppText>
        {numericGuest ? (
          <PrimaryButton title={t('auth.loginCta')} onPress={() => router.push('/login')} style={{ marginTop: spacing.lg }} />
        ) : (
          <PrimaryButton title={t('event.goBack')} onPress={() => router.back()} style={{ marginTop: spacing.lg }} />
        )}
      </Screen>
    );
  }

  const dateLocale = locale === 'ar' ? 'ar-JO' : 'en-US';
  const dateStr = new Date(event.startAt).toLocaleString(dateLocale, { dateStyle: 'medium', timeStyle: 'short' });

  const onShareEvent = async () => {
    const priceLine =
      activeTier && activeTier.price > 0
        ? `${t('common.from')} ${formatMoney(activeTier.price, currency)}`
        : null;
    const lines = [
      event.title,
      `${dateStr} · ${event.venueName}, ${cityDisplay}`,
      priceLine,
      `${t('common.brandDisplay')} · vibook://event/${event.id}`,
    ].filter(Boolean);
    try {
      await Share.share({
        title: t('event.shareTitle'),
        message: lines.join('\n'),
      });
    } catch {
      /* user dismissed share sheet */
    }
  };

  const onBook = () => {
    if (!activeTier || soldOut) return;
    setDraft({
      vertical: 'event',
      refId: event.id,
      apiEventId: apiDetail?.id,
      apiTimeSlotId: apiTimeSlotIdFromTier(activeTier.id),
      title: event.title,
      imageUrl: event.imageUrl,
      currency,
      unitPrice: activeTier.price,
      quantity: qty,
      fees: 0,
      startsAt: event.startAt,
      cityName: localizedCityLabel(event.cityId, 'en', cities),
      cityNameAr: localizedCityLabel(event.cityId, 'ar', cities),
      tierName: activeTier.name,
      metaLine: formatMoney(lineTotal, currency),
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
            <EventPhotoGallery photos={event.gallery} />
            <LinearGradient
              colors={['transparent', fadeFromBackground(colors, 0.15), fadeFromBackground(colors, 1)]}
              locations={[0, 0.55, 1]}
              style={StyleSheet.absoluteFillObject}
              pointerEvents="none"
            />
            <View style={styles.heroHeader} pointerEvents="box-none">
              <DetailHeader
                iconColor={colors.primary}
                right={
                  <View style={styles.headerActions}>
                    <EventFavoriteButton
                      eventId={event.id}
                      variant="plain"
                      iconColor={colors.primary}
                      size={22}
                      onRequiresAuth={() => router.push('/login')}
                    />
                    <Pressable
                      hitSlop={8}
                      onPress={() => void onShareEvent()}
                      accessibilityRole="button"
                      accessibilityLabel={t('event.shareA11y')}
                    >
                      <Ionicons name="share-outline" size={22} color={colors.primary} />
                    </Pressable>
                  </View>
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
              <AppText variant="body-em" color="textSecondary">
                {formatDecimalForLocale(event.rating, locale, 1)} · {formatIntForLocale(event.reviewCount, locale)}{' '}
                {t('event.reviewsWord')}
              </AppText>
            </View>

            {showUserRating ? (
              <UserRatingBlock
                vertical="event"
                refId={event.id}
                backendEventId={canRateEvent ? apiDetail?.id : undefined}
                readOnly={!canRateEvent}
                myRatingId={apiDetail?.myRatingId}
                onRatingSaved={refetchApiDetail}
                onReportIssue={
                  apiDetail?.myRatingId != null
                    ? () => {
                        if (!isAuthenticated) {
                          router.push('/login');
                          return;
                        }
                        setReportCtx({ type: 'RATING', targetId: apiDetail.myRatingId ?? null });
                      }
                    : undefined
                }
              />
            ) : null}

            <View style={styles.card}>
              <Row icon="calendar-outline" label={t('event.date')} value={dateStr} />
              <Row icon="location-outline" label={t('event.venue')} value={`${event.venueName}, ${cityDisplay}`} />
              {event.address.trim() ? (
                <Row
                  icon="navigate-outline"
                  label={t('event.address')}
                  value={
                    /^https?:\/\//i.test(event.address.trim())
                      ? t('event.openInMaps')
                      : event.address
                  }
                  onPress={
                    /^https?:\/\//i.test(event.address.trim())
                      ? () => void Linking.openURL(event.address.trim())
                      : undefined
                  }
                />
              ) : null}
            </View>

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
                      <AppText variant="body-em" color="text">
                        {tier.name}
                      </AppText>
                      {subtitle ? (
                        <AppText variant="caption" color="textMuted">
                          {subtitle}
                        </AppText>
                      ) : null}
                    </View>
                    <AppText variant="h3" color="primaryLight">
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
              <AppText variant="body-em" color="text">
                {t('event.quantity')}
              </AppText>
              <View style={styles.qtyBtns}>
                <Pressable style={styles.qtyBtn} onPress={() => setQty((q) => Math.max(1, q - 1))}>
                  <AppText variant="h3">−</AppText>
                </Pressable>
                <AppText variant="h3" color="text">
                  {qty}
                </AppText>
                <Pressable
                  style={[styles.qtyBtn, !canIncreaseQty && styles.qtyBtnDisabled]}
                  disabled={!canIncreaseQty}
                  onPress={() => setQty((q) => clampTicketQuantity(q + 1, maxQuantity))}
                >
                  <AppText variant="h3" color={canIncreaseQty ? 'text' : 'textMuted'}>
                    +
                  </AppText>
                </Pressable>
              </View>
            </View>
            {soldOut ? (
              <AppText variant="caption" color="textMuted">
                {t('event.soldOut')}
              </AppText>
            ) : atMaxQuantity ? (
              <AppText variant="caption" color="warning">
                {t('event.ticketsRemaining').replace('{n}', formatIntForLocale(maxQuantity!, locale))}
              </AppText>
            ) : null}

            <AppText variant="h3" color="text" style={styles.sectionTitle}>
              {t('event.similar')}
            </AppText>
            <AppText variant="caption" color="textMuted">
              {t('event.similarHint')} {cityDisplay}.
            </AppText>
          </View>
        </ScrollView>

        <StickyBottomBar>
          <View style={styles.bottomRow}>
            <View>
              <AppText variant="caption" color="textMuted">
                {t('event.total')}
              </AppText>
              <AppText variant="h3" color="text">
                {formatMoney(lineTotal, currency)}
              </AppText>
            </View>
            <PrimaryButton
              title={soldOut ? t('event.soldOut') : t('event.bookNow')}
              onPress={onBook}
              style={styles.cta}
              disabled={!activeTier || soldOut}
            />
          </View>
        </StickyBottomBar>
      </View>
      {reportCtx ? (
        <ReportIssueModal
          visible
          onClose={() => setReportCtx(null)}
          targetType={reportCtx.type}
          targetId={reportCtx.targetId}
          title={reportCtx.type === 'RATING' ? t('report.ratingTitle') : t('report.eventTitle')}
        />
      ) : null}
    </SafeAreaView>
  );
}

function Row({
  icon,
  label,
  value,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  onPress?: () => void;
}) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const content = (
    <>
      <Ionicons name={icon} size={18} color={colors.primary} />
      <View style={{ flex: 1 }}>
        <AppText variant="caption" color="textMuted">
          {label}
        </AppText>
        <AppText variant="body-em" color={onPress ? 'primaryLight' : 'text'}>
          {value}
        </AppText>
      </View>
      {onPress ? <Ionicons name="open-outline" size={16} color={colors.primaryLight} /> : null}
    </>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.metaRow, styles.metaRowLink, pressed && { opacity: 0.85 }]}
        accessibilityRole="link"
        accessibilityLabel={`${label}: ${value}`}
      >
        {content}
      </Pressable>
    );
  }

  return <View style={styles.metaRow}>{content}</View>;
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
  safe: { flex: 1, backgroundColor: 'transparent' },
  root: { flex: 1, backgroundColor: 'transparent' },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 120 },
  hero: { height: 280, overflow: 'hidden' },
  heroHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 2,
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.md,
  },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  body: { paddingHorizontal: spacing.screen, paddingTop: spacing.lg, gap: spacing.sm },
  title: { marginTop: spacing.xs },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: spacing.md },
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  metaRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  metaRowLink: {
    borderRadius: radii.md,
    marginHorizontal: -spacing.xs,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
  },
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
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnDisabled: {
    opacity: 0.45,
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
