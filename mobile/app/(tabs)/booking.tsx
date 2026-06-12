import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { useFocusEffect, useRouter } from 'expo-router';
import { Screen } from '@/components/layout/Screen';
import { SectionHeader } from '@/components/layout/SectionHeader';
import { EmptyState } from '@/components/feedback/EmptyState';
import { AppText } from '@/components/ui/AppText';
import { useFormatMoney } from '@/hooks/useFormatMoney';
import { useTranslation } from '@/i18n/useTranslation';
import { listMyBookings } from '@/api/bookingsApi';
import { mapApiError } from '@/utils/mapApiError';
import { bookingResponseToBooking } from '@/services/api/bookingMap';
import { enrichBookingsWithEventPhotos } from '@/utils/enrichBookingEventPhotos';
import { useAppStore } from '@/store/appStore';
import type { Booking } from '@/types';
import { radii, spacing, useThemeColors } from '@/theme';
import type { ThemeColors } from '@/theme/palettes';
import { formatDateShort } from '@/utils/format';
import { NavigationChevronForward } from '@/components/ui/NavigationChevron';

export default function BookingTabScreen() {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const { t } = useTranslation();
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadError, setLoadError] = useState<unknown | null>(null);

  const load = useCallback(() => {
    if (!isAuthenticated) {
      setBookings([]);
      setLoadError(null);
      return;
    }
    void (async () => {
      try {
        const rows = await listMyBookings();
        const mapped = rows.map(bookingResponseToBooking);
        setBookings(await enrichBookingsWithEventPhotos(mapped));
        setLoadError(null);
      } catch (e) {
        setBookings([]);
        setLoadError(e);
      }
    })();
  }, [isAuthenticated, t]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const upcoming = bookings.filter((b) => b.status === 'upcoming');
  const past = bookings.filter((b) => b.status === 'past');
  const pending = bookings.filter((b) => b.status === 'pending_payment');

  if (!isAuthenticated) {
    return (
      <Screen
        scroll
        contentStyle={styles.pad}
        header={
          <View style={styles.tabHeader}>
            <AppText variant="h1" color="text" style={styles.title}>
              {t('booking.title')}
            </AppText>
            <AppText variant="body" color="textSecondary" style={styles.sub}>
              {t('favorites.backendSignInHint')}
            </AppText>
          </View>
        }
      >
        <EmptyState
          icon="ticket-outline"
          title={t('booking.signInForBookingsTitle')}
          description={t('booking.signInForBookingsBody')}
          actionLabel={t('auth.loginCta')}
          onAction={() => router.push('/login')}
        />
      </Screen>
    );
  }

  if (loadError) {
    return (
      <Screen
        scroll
        contentStyle={styles.pad}
        header={
          <View style={styles.tabHeader}>
            <AppText variant="h1" color="text" style={styles.title}>
              {t('booking.title')}
            </AppText>
          </View>
        }
      >
        <AppText variant="body" color="textSecondary">
          {mapApiError(loadError, t)}
        </AppText>
      </Screen>
    );
  }

  return (
    <Screen
      scroll
      contentStyle={styles.pad}
      header={
        <View style={styles.tabHeader}>
          <AppText variant="h1" color="text" style={styles.title}>
            {t('booking.title')}
          </AppText>
          <AppText variant="body" color="textSecondary" style={styles.sub}>
            {t('booking.subtitle')}
          </AppText>
        </View>
      }
    >
      {pending.length > 0 ? (
        <>
          <SectionHeader title={t('booking.pending')} />
          {pending.map((b) => (
            <BookingCard key={b.id} booking={b} onOpen={() => router.push(`/booking/${b.id}`)} />
          ))}
        </>
      ) : null}

      <SectionHeader title={t('booking.upcoming')} />
      {upcoming.length === 0 ? (
        <EmptyState
          icon="ticket-outline"
          title={t('booking.noUpcomingTitle')}
          description={t('booking.noUpcomingDesc')}
          actionLabel={t('booking.exploreCta')}
          onAction={() => router.push('/(tabs)/explore')}
        />
      ) : (
        upcoming.map((b) => <BookingCard key={b.id} booking={b} onOpen={() => router.push(`/booking/${b.id}`)} />)
      )}

      <SectionHeader title={t('booking.past')} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {past.map((b) => (
          <BookingCard key={b.id} booking={b} narrow onOpen={() => router.push(`/booking/${b.id}`)} />
        ))}
      </ScrollView>
    </Screen>
  );
}

function BookingCard({
  booking,
  narrow,
  onOpen,
}: {
  booking: Booking;
  narrow?: boolean;
  onOpen: () => void;
}) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { t, locale } = useTranslation();
  const { formatMoney } = useFormatMoney();
  const title = locale === 'ar' && booking.refTitleAr ? booking.refTitleAr : booking.refTitle;
  const cityLine = locale === 'ar' && booking.cityNameAr ? booking.cityNameAr : booking.cityName;
  const coverUrl = booking.gallery[0] ?? booking.imageUrl;

  return (
    <Pressable style={[styles.card, narrow && styles.cardNarrow]} onPress={onOpen}>
      {coverUrl ? (
        <Image source={{ uri: coverUrl }} style={styles.img} contentFit="cover" />
      ) : (
        <View style={[styles.img, styles.imgPlaceholder]} />
      )}
      <View style={styles.body}>
        <View style={styles.row}>
          <AppText variant="h3" color="text" numberOfLines={2} style={{ flex: 1 }}>
            {title}
          </AppText>
          <StatusPill status={booking.status} />
        </View>
        <AppText variant="caption" color="textMuted">
          {formatDateShort(booking.startsAt, locale)} · {cityLine}
        </AppText>
        {booking.totalPaid > 0 ? (
          <AppText variant="h3" color="primaryLight" style={styles.price}>
            {formatMoney(booking.totalPaid, booking.currency)}
          </AppText>
        ) : (
          <AppText variant="label" color="warning">
            {t('booking.paymentDue')}
          </AppText>
        )}
        <View style={styles.detailBtn}>
          <AppText variant="label" color="primary">
            {t('common.details')}
          </AppText>
          <NavigationChevronForward size={16} color={colors.icon} />
        </View>
      </View>
    </Pressable>
  );
}

function StatusPill({ status }: { status: Booking['status'] }) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { t } = useTranslation();
  const map = {
    upcoming: { labelKey: 'booking.statusUpcoming', c: colors.primaryLight },
    past: { labelKey: 'booking.statusPast', c: colors.disabled },
    cancelled: { labelKey: 'booking.statusCancelled', c: colors.error },
    pending_payment: { labelKey: 'booking.statusPending', c: colors.warning },
  };
  const m = map[status];
  return (
    <View style={[styles.pill, { borderColor: m.c }]}>
      <AppText variant="label" style={{ color: m.c }}>
        {t(m.labelKey)}
      </AppText>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    pad: { paddingTop: spacing.md },
    tabHeader: { paddingBottom: spacing.lg },
    title: { marginBottom: spacing.xs },
    sub: { lineHeight: 22 },
    pastEmpty: { paddingVertical: spacing.md, paddingHorizontal: spacing.sm },
    card: {
      flexDirection: 'row',
      backgroundColor: colors.card,
      borderRadius: radii.xl,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: spacing.md,
    },
    cardNarrow: {
      width: 300,
      marginEnd: spacing.md,
    },
    img: { width: 104, height: 120 },
    imgPlaceholder: {
      backgroundColor: colors.surfaceMuted,
      borderRightWidth: 1,
      borderRightColor: colors.border,
    },
    body: { flex: 1, padding: spacing.md, gap: 6 },
    row: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
    price: { marginTop: 4 },
    detailBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: spacing.sm },
    pill: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: radii.xs,
      borderWidth: 1,
    },
  });
}
