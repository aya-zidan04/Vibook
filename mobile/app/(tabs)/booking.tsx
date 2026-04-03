import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/layout/Screen';
import { SectionHeader } from '@/components/layout/SectionHeader';
import { EmptyState } from '@/components/feedback/EmptyState';
import { AppText } from '@/components/ui/AppText';
import { useFormatMoney } from '@/hooks/useFormatMoney';
import { useTranslation } from '@/i18n/useTranslation';
import { MOCK_BOOKINGS } from '@/services/mock';
import type { Booking } from '@/types';
import { radii, spacing, useThemeColors } from '@/theme';
import type { ThemeColors } from '@/theme/palettes';
import { formatDateShort } from '@/utils/format';
import { chevronForwardTrailing } from '@/utils/rtl';

export default function BookingTabScreen() {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const { t } = useTranslation();

  const upcoming = MOCK_BOOKINGS.filter((b) => b.status === 'upcoming');
  const past = MOCK_BOOKINGS.filter((b) => b.status === 'past');
  const pending = MOCK_BOOKINGS.filter((b) => b.status === 'pending_payment');

  return (
    <Screen scroll contentStyle={styles.pad}>
      <AppText variant="h1" color="text" style={styles.title}>
        {t('booking.title')}
      </AppText>
      <AppText variant="body" color="textSecondary" style={styles.sub}>
        {t('booking.subtitle')}
      </AppText>

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

      <View style={styles.actions}>
        <Pressable style={styles.actionBtn}>
          <Ionicons name="qr-code-outline" size={22} color={colors.accent} />
          <AppText variant="meta" color="textSecondary">
            {t('booking.qr')}
          </AppText>
        </Pressable>
        <Pressable style={styles.actionBtn}>
          <Ionicons name="calendar-outline" size={22} color={colors.accent} />
          <AppText variant="meta" color="textSecondary">
            {t('booking.calendar')}
          </AppText>
        </Pressable>
        <Pressable style={styles.actionBtn}>
          <Ionicons name="download-outline" size={22} color={colors.accent} />
          <AppText variant="meta" color="textSecondary">
            {t('booking.ticket')}
          </AppText>
        </Pressable>
      </View>
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

  return (
    <Pressable style={[styles.card, narrow && styles.cardNarrow]} onPress={onOpen}>
      <Image source={{ uri: booking.imageUrl }} style={styles.img} contentFit="cover" />
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
          <AppText variant="price" color="accent" style={styles.price}>
            {formatMoney(booking.totalPaid, booking.currency)}
          </AppText>
        ) : (
          <AppText variant="meta" color="warning">
            {t('booking.paymentDue')}
          </AppText>
        )}
        <View style={styles.detailBtn}>
          <AppText variant="meta" color="accent">
            {t('common.details')}
          </AppText>
          <Ionicons name={chevronForwardTrailing()} size={16} color={colors.accent} />
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
    upcoming: { labelKey: 'booking.statusUpcoming', c: colors.accent },
    past: { labelKey: 'booking.statusPast', c: colors.textMuted },
    cancelled: { labelKey: 'booking.statusCancelled', c: colors.error },
    pending_payment: { labelKey: 'booking.statusPending', c: colors.warning },
  };
  const m = map[status];
  return (
    <View style={[styles.pill, { borderColor: m.c }]}>
      <AppText variant="meta" style={{ color: m.c }}>
        {t(m.labelKey)}
      </AppText>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    pad: { paddingTop: spacing.md },
    title: { marginBottom: spacing.xs },
    sub: { marginBottom: spacing.lg, lineHeight: 22 },
    pastEmpty: { paddingVertical: spacing.md, paddingHorizontal: spacing.sm },
    card: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
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
    body: { flex: 1, padding: spacing.md, gap: 6 },
    row: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
    price: { marginTop: 4 },
    detailBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: spacing.sm },
    actions: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginTop: spacing.lg,
      marginBottom: spacing.xxxl,
    },
    actionBtn: {
      alignItems: 'center',
      gap: 6,
      padding: spacing.md,
      backgroundColor: colors.surface,
      borderRadius: radii.lg,
      borderWidth: 1,
      borderColor: colors.border,
      minWidth: 96,
    },
    pill: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: radii.xs,
      borderWidth: 1,
    },
  });
}
