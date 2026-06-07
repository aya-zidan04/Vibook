import { useCallback, useMemo, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { BusinessPartnerGateBanner } from '@/components/business/BusinessPartnerGateBanner';
import { AppText } from '@/components/ui/AppText';
import { PrimaryButton } from '@/components/ui/Button';
import { Screen } from '@/components/layout/Screen';
import { useTranslation } from '@/i18n/useTranslation';
import { formatDateShort } from '@/utils/format';
import { updateMyBusinessBookingStatus } from '@/api/businessBookingsApi';
import { refreshBusinessHubLists } from '@/services/businessHubSync';
import { useBusinessHubStore } from '@/store/businessHubStore';
import type { BusinessBookingStatus } from '@/types/businessHub';
import type { BookingStatusApi } from '@/api/types';
import { localBookingStatusToApi, nextPartnerBookingStatus } from '@/utils/businessHubMappers';
import { radii, spacing, useThemeColors } from '@/theme';
import type { ThemeColors } from '@/theme/palettes';

export default function BusinessBookingsScreen() {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { t, locale } = useTranslation();
  const bookings = useBusinessHubStore((s) => s.bookings);
  const apiProfileStatus = useBusinessHubStore((s) => s.apiProfileStatus);
  const canManage = apiProfileStatus === 'APPROVED';
  const [busyId, setBusyId] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      void refreshBusinessHubLists().catch(() => {
        /* keep last list */
      });
    }, []),
  );

  const labelFor = (s: BusinessBookingStatus) => {
    if (s === 'pending') return t('businessHub.bookingPending');
    if (s === 'confirmed') return t('businessHub.bookingConfirmed');
    if (s === 'completed') return t('businessHub.bookingCompleted');
    return t('businessHub.bookingCancelled');
  };

  const actionLabelFor = (next: BookingStatusApi) =>
    next === 'CONFIRMED' ? t('businessHub.bookingConfirmAction') : t('businessHub.bookingCompleteAction');

  const advanceStatus = (itemId: string, serverStatus: ReturnType<typeof localBookingStatusToApi>) => {
    if (!canManage) return;
    const next = nextPartnerBookingStatus(serverStatus);
    if (!next) {
      Alert.alert(t('businessHub.bookingNoAdvance'));
      return;
    }
    const nid = Number(itemId);
    if (!Number.isFinite(nid)) {
      Alert.alert(t('common.error'), t('common.notFound'));
      return;
    }
    setBusyId(itemId);
    void (async () => {
      try {
        await updateMyBusinessBookingStatus(nid, { status: next });
        await refreshBusinessHubLists();
      } catch {
        Alert.alert(t('common.error'), t('common.retry'));
      } finally {
        setBusyId(null);
      }
    })();
  };

  return (
    <Screen
      scroll
      contentStyle={styles.pad}
      header={
        <View style={styles.header}>
          <AppText variant="h2" color="text">
            {t('businessHub.bookingsTitle')}
          </AppText>
          <AppText variant="body" color="textSecondary">
            {t('businessHub.bookingsLead')}
          </AppText>
        </View>
      }
    >
      <BusinessPartnerGateBanner />
      {bookings.length === 0 ? (
        <AppText variant="body" color="textMuted" style={styles.empty}>
          {t('businessHub.bookingsEmpty')}
        </AppText>
      ) : (
        <View style={styles.list}>
          {bookings.map((item) => {
            const serverStatus = item.serverStatus ?? localBookingStatusToApi(item.status);
            const next = nextPartnerBookingStatus(serverStatus);
            const guestName = item.guestName?.trim() || t('businessHub.bookingGuestUnknown');
            const guestPhone = item.guestPhone?.trim() || t('businessHub.bookingPhoneUnknown');
            const datePart = formatDateShort(`${item.eventDate}T12:00:00.000Z`, locale);
            const whenLine = item.timeSlotLabel
              ? `${datePart} · ${item.timeSlotLabel}`
              : datePart;
            return (
              <View key={item.id} style={styles.card}>
                <AppText variant="body-em" color="text">
                  {item.listingTitle}
                </AppText>
                <AppText variant="body" color="text">
                  {guestName} · {t('businessHub.bookingParty').replace('{n}', String(item.partySize))}
                </AppText>
                <AppText variant="caption" color="textSecondary">
                  {guestPhone}
                </AppText>
                <AppText variant="caption" color="textMuted">
                  {whenLine}
                </AppText>
                <View style={[styles.badge, { backgroundColor: colors.primaryMuted }]}>
                  <AppText variant="caption" color="primary">
                    {labelFor(item.status)}
                  </AppText>
                </View>
                {canManage && next ? (
                  <PrimaryButton
                    title={actionLabelFor(next)}
                    onPress={() => advanceStatus(item.id, serverStatus)}
                    disabled={busyId === item.id}
                    style={styles.action}
                  />
                ) : null}
              </View>
            );
          })}
        </View>
      )}
    </Screen>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    pad: { paddingTop: spacing.md, gap: spacing.md, paddingBottom: spacing.xxxl },
    header: { paddingTop: spacing.md, paddingHorizontal: spacing.screen, gap: spacing.xs },
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
    badge: { alignSelf: 'flex-start', paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: radii.sm },
    action: { marginTop: spacing.sm },
  });
}
