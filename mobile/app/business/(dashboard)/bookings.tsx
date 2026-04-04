import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import { Screen } from '@/components/layout/Screen';
import { useTranslation } from '@/i18n/useTranslation';
import { useBusinessHubStore } from '@/store/businessHubStore';
import type { BusinessBookingStatus } from '@/types/businessHub';
import { radii, spacing, useThemeColors } from '@/theme';
import type { ThemeColors } from '@/theme/palettes';

export default function BusinessBookingsScreen() {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { t } = useTranslation();
  const bookings = useBusinessHubStore((s) => s.bookings);
  const cycleBookingStatus = useBusinessHubStore((s) => s.cycleBookingStatus);

  const labelFor = (s: BusinessBookingStatus) => {
    if (s === 'pending') return t('businessHub.bookingPending');
    if (s === 'confirmed') return t('businessHub.bookingConfirmed');
    return t('businessHub.bookingCancelled');
  };

  return (
    <Screen scroll contentStyle={styles.pad}>
      <AppText variant="h2" color="text">
        {t('businessHub.bookingsTitle')}
      </AppText>
      <AppText variant="body" color="textSecondary">
        {t('businessHub.bookingsLead')}
      </AppText>
      {bookings.length === 0 ? (
        <AppText variant="body" color="textMuted" style={styles.empty}>
          {t('businessHub.bookingsEmpty')}
        </AppText>
      ) : (
        <View style={styles.list}>
          {bookings.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => cycleBookingStatus(item.id)}
              style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
            >
              <AppText variant="bodyMedium" color="text">
                {item.listingTitle}
              </AppText>
              <AppText variant="caption" color="textSecondary">
                {item.guestEmail} · {t('businessHub.bookingParty').replace('{n}', String(item.partySize))}
              </AppText>
              <View style={[styles.badge, { backgroundColor: colors.primaryMuted }]}>
                <AppText variant="caption" color="primary">
                  {labelFor(item.status)}
                </AppText>
              </View>
              <AppText variant="meta" color="textMuted">
                {t('businessHub.bookingTapCycle')}
              </AppText>
            </Pressable>
          ))}
        </View>
      )}
    </Screen>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    pad: { paddingTop: spacing.md, gap: spacing.md, paddingBottom: spacing.xxxl },
    empty: { marginTop: spacing.lg },
    list: { gap: spacing.md },
    card: {
      padding: spacing.lg,
      borderRadius: radii.xl,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      gap: spacing.xs,
    },
    cardPressed: { opacity: 0.94 },
    badge: { alignSelf: 'flex-start', paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: radii.sm },
  });
}
