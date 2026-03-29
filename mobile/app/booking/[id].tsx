import { StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/ui/AppText';
import { PrimaryButton, SecondaryButton } from '@/components/ui/Button';
import { DetailHeader } from '@/components/layout/DetailHeader';
import { Screen } from '@/components/layout/Screen';
import { useFormatMoney } from '@/hooks/useFormatMoney';
import { useTranslation } from '@/i18n/useTranslation';
import { MOCK_BOOKINGS } from '@/mock';
import { colors, radii, spacing } from '@/theme';
import { formatDateShort } from '@/utils/format';
import { hrefForBookingRef } from '@/utils/bookingRoutes';

const STATUS_KEYS: Record<(typeof MOCK_BOOKINGS)[0]['status'], string> = {
  upcoming: 'booking.statusUpcoming',
  past: 'booking.statusPast',
  cancelled: 'booking.statusCancelled',
  pending_payment: 'booking.statusPending',
};

export default function BookingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t, locale } = useTranslation();
  const { formatMoney } = useFormatMoney();
  const booking = id ? MOCK_BOOKINGS.find((b) => b.id === id) : undefined;
  const listingHref = booking ? hrefForBookingRef(booking) : null;

  if (!booking) {
    return (
      <Screen>
        <DetailHeader title={t('bookingDetail.title')} />
        <AppText color="textSecondary">{t('common.notFound')}</AppText>
        <PrimaryButton title={t('common.back')} onPress={() => router.back()} style={{ marginTop: spacing.lg }} />
      </Screen>
    );
  }

  const refTitle = locale === 'ar' && booking.refTitleAr ? booking.refTitleAr : booking.refTitle;
  const cityLine = locale === 'ar' && booking.cityNameAr ? booking.cityNameAr : booking.cityName;

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
        {t('bookingDetail.status')}: {t(STATUS_KEYS[booking.status])}
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

const styles = StyleSheet.create({
  pad: { paddingTop: spacing.md, gap: spacing.sm },
  hero: { width: '100%', height: 200, borderRadius: radii.xl, marginTop: spacing.md },
  mt: { marginTop: spacing.md },
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
