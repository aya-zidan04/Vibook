import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/ui/AppText';
import { PrimaryButton, SecondaryButton } from '@/components/ui/Button';
import { DetailHeader } from '@/components/layout/DetailHeader';
import { Screen } from '@/components/layout/Screen';
import { useFormatMoney } from '@/hooks/useFormatMoney';
import { useIntegrationMode } from '@/hooks/useIntegrationMode';
import { useTranslation } from '@/i18n/useTranslation';
import { bookingsApi } from '@/services/api/bookingsApi';
import { ApiRequestError } from '@/services/api/http';
import { MOCK_BOOKINGS } from '@/services/mock';
import type { Booking, BookingStatus } from '@/types';
import {
  bookingResponseDtoToBooking,
  canCancelBookingStatus,
  isBookingUuid,
} from '@/utils/bookingApiMap';
import { hrefForBookingRef } from '@/utils/bookingRoutes';
import { radii, spacing, useThemeColors } from '@/theme';
import type { ThemeColors } from '@/theme/palettes';
import { formatDateShort } from '@/utils/format';

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
  const { api, authenticated, liveAccount } = useIntegrationMode();

  const mockBooking = useMemo(
    () => (id ? MOCK_BOOKINGS.find((b) => b.id === id) : undefined),
    [id],
  );

  const [remote, setRemote] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<'notfound' | 'auth' | 'other' | null>(null);
  const [fetchMessage, setFetchMessage] = useState<string | null>(null);
  const [mockCancelled, setMockCancelled] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const loadRemote = useCallback(async () => {
    if (!id || !isBookingUuid(id) || !liveAccount) {
      setRemote(null);
      setFetchError(null);
      setFetchMessage(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setFetchError(null);
    setFetchMessage(null);
    try {
      const dto = await bookingsApi.getMine(id);
      setRemote(bookingResponseDtoToBooking(dto));
    } catch (e) {
      setRemote(null);
      if (e instanceof ApiRequestError) {
        setFetchMessage(e.message);
        if (e.status === 404) setFetchError('notfound');
        else if (e.status === 401) setFetchError('auth');
        else setFetchError('other');
      } else {
        setFetchError('other');
        setFetchMessage(t('common.error'));
      }
    } finally {
      setLoading(false);
    }
  }, [id, liveAccount, t]);

  useEffect(() => {
    void loadRemote();
  }, [loadRemote]);

  useEffect(() => {
    setMockCancelled(false);
  }, [id]);

  const booking = remote ?? mockBooking ?? undefined;
  const useApiDetail = Boolean(id && isBookingUuid(id) && liveAccount);

  if (!id) {
    return (
      <Screen>
        <DetailHeader title={t('bookingDetail.title')} />
        <AppText color="textSecondary">{t('common.notFound')}</AppText>
        <PrimaryButton title={t('common.back')} onPress={() => router.back()} style={{ marginTop: spacing.lg }} />
      </Screen>
    );
  }

  if (useApiDetail && loading && !remote) {
    return (
      <Screen>
        <DetailHeader title={t('bookingDetail.title')} />
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
          <AppText variant="caption" color="textMuted" style={{ marginTop: spacing.md }}>
            {t('common.loading')}
          </AppText>
        </View>
      </Screen>
    );
  }

  if (useApiDetail && fetchError && !mockBooking) {
    if (fetchError === 'notfound') {
      return (
        <Screen>
          <DetailHeader title={t('bookingDetail.title')} />
          <AppText color="textSecondary">{t('common.notFound')}</AppText>
          <PrimaryButton title={t('common.back')} onPress={() => router.back()} style={{ marginTop: spacing.lg }} />
        </Screen>
      );
    }
    if (fetchError === 'auth') {
      return (
        <Screen>
          <DetailHeader title={t('bookingDetail.title')} />
          <AppText color="textSecondary">{t('bookingDetail.unauthorized')}</AppText>
          <PrimaryButton
            title={t('entry.loginSignup')}
            onPress={() => router.push('/(auth)/login')}
            style={{ marginTop: spacing.md }}
          />
          <SecondaryButton title={t('common.back')} onPress={() => router.back()} style={{ marginTop: spacing.sm }} />
        </Screen>
      );
    }
    return (
      <Screen>
        <DetailHeader title={t('bookingDetail.title')} />
        <AppText color="error">{fetchMessage ?? t('bookingDetail.loadError')}</AppText>
        <PrimaryButton title={t('common.retry')} onPress={() => void loadRemote()} style={{ marginTop: spacing.lg }} />
      </Screen>
    );
  }

  if (!booking) {
    if (id && isBookingUuid(id) && api && !authenticated) {
      return (
        <Screen>
          <DetailHeader title={t('bookingDetail.title')} />
          <AppText color="textSecondary">{t('bookingDetail.unauthorized')}</AppText>
          <PrimaryButton
            title={t('entry.loginSignup')}
            onPress={() => router.push('/(auth)/login')}
            style={{ marginTop: spacing.md }}
          />
          <SecondaryButton title={t('common.back')} onPress={() => router.back()} style={{ marginTop: spacing.sm }} />
        </Screen>
      );
    }
    return (
      <Screen>
        <DetailHeader title={t('bookingDetail.title')} />
        <AppText color="textSecondary">{t('common.notFound')}</AppText>
        <PrimaryButton title={t('common.back')} onPress={() => router.back()} style={{ marginTop: spacing.lg }} />
      </Screen>
    );
  }

  const displayStatus: BookingStatus = mockCancelled ? 'cancelled' : booking.status;
  const listingHref = hrefForBookingRef(booking);
  const showCancel = canCancelBookingStatus(booking.status) && !mockCancelled;

  const refTitle = locale === 'ar' && booking.refTitleAr ? booking.refTitleAr : booking.refTitle;
  const cityLine = locale === 'ar' && booking.cityNameAr ? booking.cityNameAr : booking.cityName;

  const runCancel = async () => {
    if (useApiDetail && isBookingUuid(booking.id)) {
      setCancelling(true);
      try {
        const dto = await bookingsApi.cancel(booking.id);
        setRemote(bookingResponseDtoToBooking(dto));
      } catch (e) {
        const msg =
          e instanceof ApiRequestError ? e.message : t('bookingDetail.cancelFailed');
        Alert.alert(t('common.error'), msg);
      } finally {
        setCancelling(false);
      }
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
        onPress: () => void runCancel(),
      },
    ]);
  };

  return (
    <Screen scroll contentStyle={styles.pad}>
      <DetailHeader title={t('bookingDetail.title')} />
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
          disabled={cancelling}
          style={({ pressed }) => [styles.cancelPress, pressed && { opacity: 0.7 }]}
        >
          {cancelling ? (
            <ActivityIndicator color={colors.error} />
          ) : (
            <AppText variant="bodyMedium" color="error">
              {t('bookingDetail.cancelBooking')}
            </AppText>
          )}
        </Pressable>
      ) : null}
      <SecondaryButton
        title={t('bookingDetail.listBookings')}
        onPress={() => router.replace('/(tabs)/booking')}
        style={styles.mt}
      />
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
  center: { paddingVertical: 48, alignItems: 'center' },
  hero: { width: '100%', height: 200, borderRadius: radii.xl, marginTop: spacing.md },
  mt: { marginTop: spacing.md },
  cancelPress: { marginTop: spacing.md, paddingVertical: spacing.sm, alignItems: 'center' },
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
