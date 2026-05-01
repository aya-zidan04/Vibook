import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/ui/AppText';
import { PrimaryButton, SecondaryButton } from '@/components/ui/Button';
import { DetailHeader } from '@/components/layout/DetailHeader';
import { Screen } from '@/components/layout/Screen';
import { useFormatMoney } from '@/hooks/useFormatMoney';
import { useTranslation } from '@/i18n/useTranslation';
import { cancelMyBooking, getMyBooking } from '@/api/bookingsApi';
import { ApiError } from '@/api/http';
import { bookingResponseToBooking } from '@/services/api/bookingMap';
import { MOCK_BOOKINGS } from '@/services/mock';
import { useAppStore } from '@/store/appStore';
import type { Booking, BookingStatus } from '@/types';
import { canCancelBookingStatus } from '@/utils/bookingApiMap';
import { hrefForBookingRef } from '@/utils/bookingRoutes';
import { radii, spacing, useThemeColors } from '@/theme';
import type { ThemeColors } from '@/theme/palettes';
import { formatDateShort } from '@/utils/format';
import { ReportIssueModal } from '@/components/report/ReportIssueModal';

const STATUS_KEYS: Record<BookingStatus, string> = {
  upcoming: 'booking.statusUpcoming',
  past: 'booking.statusPast',
  cancelled: 'booking.statusCancelled',
  pending_payment: 'booking.statusPending',
};

export default function BookingDetailScreen() {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t, locale } = useTranslation();
  const { formatMoney } = useFormatMoney();
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);

  const [booking, setBooking] = useState<Booking | undefined>();
  const [loading, setLoading] = useState(true);
  const [mockCancelled, setMockCancelled] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  const isApiId = !!(id && /^\d+$/.test(id));

  useEffect(() => {
    setMockCancelled(false);
    if (!id) {
      setBooking(undefined);
      setLoading(false);
      return;
    }
    if (isApiId && isAuthenticated) {
      setLoading(true);
      void (async () => {
        try {
          const row = await getMyBooking(Number(id));
          setBooking(bookingResponseToBooking(row));
        } catch {
          setBooking(undefined);
        } finally {
          setLoading(false);
        }
      })();
      return;
    }
    setBooking(MOCK_BOOKINGS.find((b) => b.id === id));
    setLoading(false);
  }, [id, isApiId, isAuthenticated]);

  if (!id) {
    return (
      <Screen header={<DetailHeader title={t('bookingDetail.title')} />}>
        <AppText color="textSecondary">{t('common.notFound')}</AppText>
        <PrimaryButton title={t('common.back')} onPress={() => router.back()} style={{ marginTop: spacing.lg }} />
      </Screen>
    );
  }

  if (loading) {
    return (
      <Screen header={<DetailHeader title={t('bookingDetail.title')} />}>
        <AppText color="textMuted">{t('common.loading')}</AppText>
      </Screen>
    );
  }

  if (!booking) {
    return (
      <Screen header={<DetailHeader title={t('bookingDetail.title')} />}>
        <AppText color="textSecondary">{t('common.notFound')}</AppText>
        <PrimaryButton title={t('common.back')} onPress={() => router.back()} style={{ marginTop: spacing.lg }} />
      </Screen>
    );
  }

  const displayStatus: BookingStatus = mockCancelled ? 'cancelled' : booking.status;
  const listingHref = hrefForBookingRef(booking);
  const showCancel = canCancelBookingStatus(booking.status) && !mockCancelled && !(isApiId && booking.status === 'cancelled');

  const refTitle = locale === 'ar' && booking.refTitleAr ? booking.refTitleAr : booking.refTitle;
  const cityLine = locale === 'ar' && booking.cityNameAr ? booking.cityNameAr : booking.cityName;

  const runCancel = () => {
    if (isApiId && isAuthenticated) {
      void (async () => {
        try {
          const row = await cancelMyBooking(Number(id), null);
          setBooking(bookingResponseToBooking(row));
        } catch (e) {
          const msg = e instanceof ApiError ? e.message : t('common.error');
          Alert.alert(t('bookingDetail.title'), msg);
        }
      })();
      return;
    }
    setMockCancelled(true);
  };

  const confirmCancel = () => {
    Alert.alert(t('bookingDetail.cancelConfirmTitle'), t('bookingDetail.cancelConfirmMessage'), [
      { text: t('common.back'), style: 'cancel' },
      {
        text: t('bookingDetail.cancelBooking'),
        style: 'destructive',
        onPress: () => runCancel(),
      },
    ]);
  };

  return (
    <Screen
      scroll
      contentStyle={styles.pad}
      header={<DetailHeader title={t('bookingDetail.title')} />}
    >
      <Image source={{ uri: booking.imageUrl }} style={styles.hero} contentFit="cover" />
      <AppText variant="h1" color="text" style={styles.mt}>
        {refTitle}
      </AppText>
      <AppText variant="body" color="textSecondary">
        {formatDateShort(booking.startsAt, locale)} · {cityLine}
      </AppText>
      <AppText variant="meta" color="textMuted" style={styles.mt}>
        {t('bookingDetail.status')}: {t(STATUS_KEYS[displayStatus])}
      </AppText>
      {booking.totalPaid > 0 ? (
        <AppText variant="price" color="accent" style={styles.mt}>
          {formatMoney(booking.totalPaid, booking.currency)}
        </AppText>
      ) : (
        <AppText variant="bodyMedium" color="warning" style={styles.mt}>
          {t('booking.paymentDue')}
        </AppText>
      )}
      <View style={styles.card}>
        <Row icon="qr-code-outline" label={t('bookingDetail.checkIn')} value={t('bookingDetail.checkInVal')} />
        <Row icon="mail-outline" label={t('bookingDetail.confirmEmail')} value={t('bookingDetail.confirmVal')} />
      </View>
      {listingHref ? (
        <PrimaryButton title={t('bookingDetail.viewListing')} onPress={() => router.push(listingHref)} />
      ) : null}
      {showCancel ? (
        <Pressable
          onPress={confirmCancel}
          style={({ pressed }) => [styles.cancelPress, pressed && { opacity: 0.7 }]}
        >
          <AppText variant="bodyMedium" color="error">
            {t('bookingDetail.cancelBooking')}
          </AppText>
        </Pressable>
      ) : null}
      {isApiId && isAuthenticated ? (
        <Pressable
          onPress={() => setReportOpen(true)}
          style={({ pressed }) => [styles.reportPress, pressed && { opacity: 0.7 }]}
          accessibilityRole="button"
        >
          <AppText variant="bodyMedium" color="accent">
            {t('report.bookingAction')}
          </AppText>
        </Pressable>
      ) : null}
      <SecondaryButton
        title={t('bookingDetail.listBookings')}
        onPress={() => router.replace('/(tabs)/booking')}
        style={styles.mt}
      />
      {isApiId ? (
        <ReportIssueModal
          visible={reportOpen}
          onClose={() => setReportOpen(false)}
          targetType="BOOKING"
          targetId={Number(id)}
          title={t('report.bookingTitle')}
        />
      ) : null}
    </Screen>
  );
}

function Row({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <View style={styles.row}>
      <Ionicons name={icon} size={22} color={colors.primary} />
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
    pad: { paddingTop: spacing.md, gap: spacing.sm },
    hero: { width: '100%', height: 200, borderRadius: radii.xl, marginTop: spacing.md },
    mt: { marginTop: spacing.md },
    cancelPress: { marginTop: spacing.md, paddingVertical: spacing.sm, alignItems: 'center' },
    reportPress: { marginTop: spacing.sm, paddingVertical: spacing.sm, alignItems: 'center' },
    card: {
      marginVertical: spacing.lg,
      padding: spacing.md,
      backgroundColor: colors.surface,
      borderRadius: radii.xl,
      borderWidth: 1,
      borderColor: colors.border,
      gap: spacing.md,
    },
    row: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  });
}
