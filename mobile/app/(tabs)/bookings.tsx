import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/layout/Screen';
import { SectionHeader } from '@/components/layout/SectionHeader';
import { EmptyState } from '@/components/feedback/EmptyState';
import { AppText } from '@/components/ui/AppText';
import { MOCK_BOOKINGS } from '@/mock';
import { colors, radii, spacing } from '@/theme';
import { formatDateShort, formatPrice } from '@/utils/format';

export default function BookingsScreen() {
  const upcoming = MOCK_BOOKINGS.filter((b) => b.status === 'upcoming');
  const past = MOCK_BOOKINGS.filter((b) => b.status === 'past');
  const pending = MOCK_BOOKINGS.filter((b) => b.status === 'pending_payment');

  return (
    <Screen scroll contentStyle={styles.pad}>
      <AppText variant="h1" color="text" style={styles.title}>
        Bookings
      </AppText>
      <AppText variant="body" color="textSecondary" style={styles.sub}>
        Upcoming tickets, past visits, and pending payments.
      </AppText>

      {pending.length > 0 ? (
        <>
          <SectionHeader title="Pending payment" />
          {pending.map((b) => (
            <BookingCard key={b.id} booking={b} />
          ))}
        </>
      ) : null}

      <SectionHeader title="Upcoming" />
      {upcoming.length === 0 ? (
        <EmptyState
          icon="ticket-outline"
          title="No upcoming bookings"
          description="When you book an event or table, it will show up here."
          actionLabel="Browse home"
          onAction={() => {}}
        />
      ) : (
        upcoming.map((b) => <BookingCard key={b.id} booking={b} />)
      )}

      <SectionHeader title="Past" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {past.map((b) => (
          <BookingCard key={b.id} booking={b} narrow />
        ))}
      </ScrollView>

      <View style={styles.actions}>
        <Pressable style={styles.actionBtn}>
          <Ionicons name="qr-code-outline" size={22} color={colors.accent} />
          <AppText variant="meta" color="textSecondary">
            QR preview
          </AppText>
        </Pressable>
        <Pressable style={styles.actionBtn}>
          <Ionicons name="calendar-outline" size={22} color={colors.accent} />
          <AppText variant="meta" color="textSecondary">
            Calendar
          </AppText>
        </Pressable>
        <Pressable style={styles.actionBtn}>
          <Ionicons name="download-outline" size={22} color={colors.accent} />
          <AppText variant="meta" color="textSecondary">
            Ticket
          </AppText>
        </Pressable>
      </View>
    </Screen>
  );
}

function BookingCard({
  booking,
  narrow,
}: {
  booking: (typeof MOCK_BOOKINGS)[0];
  narrow?: boolean;
}) {
  return (
    <View style={[styles.card, narrow && styles.cardNarrow]}>
      <Image source={{ uri: booking.imageUrl }} style={styles.img} contentFit="cover" />
      <View style={styles.body}>
        <View style={styles.row}>
          <AppText variant="h3" color="text" numberOfLines={2} style={{ flex: 1 }}>
            {booking.refTitle}
          </AppText>
          <StatusPill status={booking.status} />
        </View>
        <AppText variant="caption" color="textMuted">
          {formatDateShort(booking.startsAt)} · {booking.cityName}
        </AppText>
        {booking.totalPaid > 0 ? (
          <AppText variant="price" color="accent" style={styles.price}>
            {formatPrice(booking.totalPaid, booking.currency)}
          </AppText>
        ) : (
          <AppText variant="meta" color="warning">
            Payment due
          </AppText>
        )}
        <Pressable style={styles.detailBtn}>
          <AppText variant="meta" color="accent">
            Details
          </AppText>
          <Ionicons name="chevron-forward" size={16} color={colors.accent} />
        </Pressable>
      </View>
    </View>
  );
}

function StatusPill({ status }: { status: (typeof MOCK_BOOKINGS)[0]['status'] }) {
  const map = {
    upcoming: { label: 'Upcoming', c: colors.accent },
    past: { label: 'Past', c: colors.textMuted },
    cancelled: { label: 'Cancelled', c: colors.error },
    pending_payment: { label: 'Pending', c: colors.warning },
  };
  const m = map[status];
  return (
    <View style={[styles.pill, { borderColor: m.c }]}>
      <AppText variant="meta" style={{ color: m.c }}>
        {m.label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  pad: { paddingTop: spacing.md },
  title: { marginBottom: spacing.xs },
  sub: { marginBottom: spacing.lg, lineHeight: 22 },
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
    marginRight: spacing.md,
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
