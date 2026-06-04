import { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { AppText } from '@/components/ui/AppText';
import { PrimaryButton, SecondaryButton } from '@/components/ui/Button';
import { DetailHeader } from '@/components/layout/DetailHeader';
import { Screen } from '@/components/layout/Screen';
import { useFormatMoney } from '@/hooks/useFormatMoney';
import { useTranslation } from '@/i18n/useTranslation';
import { createBooking } from '@/api/bookingsApi';
import { capturePayPalOrder, createPayPalOrder } from '@/api/paymentsApi';
import { mapApiError } from '@/utils/mapApiError';
import { useBookingDraftStore } from '@/store/bookingDraftStore';
import { radii, spacing, useThemeColors } from '@/theme';
import type { ThemeColors } from '@/theme/palettes';

const PAYPAL_RETURN_URL = 'vibook://paypal-return';

export default function PaymentScreen() {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const draft = useBookingDraftStore((s) => s.draft);
  const pendingBookingId = useBookingDraftStore((s) => s.pendingBookingId);
  const setLastOrderId = useBookingDraftStore((s) => s.setLastOrderId);
  const setPendingBookingId = useBookingDraftStore((s) => s.setPendingBookingId);
  const clearCheckoutSession = useBookingDraftStore((s) => s.clearCheckoutSession);
  const [busy, setBusy] = useState(false);
  const { t } = useTranslation();
  const { formatMoney } = useFormatMoney();

  const usePayPal =
    draft?.apiEventId != null && draft.vertical === 'event';

  if (!draft) {
    return (
      <Screen header={<DetailHeader title={t('payment.title')} />}>
        <AppText variant="body" color="textSecondary" style={styles.empty}>
          {t('payment.empty')}
        </AppText>
        <PrimaryButton title={t('common.home')} onPress={() => router.replace('/(tabs)/explore')} />
      </Screen>
    );
  }

  const total = draft.unitPrice * draft.quantity + draft.fees;

  const payWithPayPal = async () => {
    const eventId = draft.apiEventId;
    if (eventId == null) return;

    setBusy(true);
    try {
      let bookingId = pendingBookingId;
      if (bookingId == null) {
        const created = await createBooking({
          eventId,
          timeSlotId: draft.apiTimeSlotId ?? null,
          guestsCount: draft.quantity,
          note: null,
        });
        bookingId = created.id;
        setPendingBookingId(bookingId);
      }

      const order = await createPayPalOrder({
        bookingId,
        eventId,
        timeSlotId: draft.apiTimeSlotId ?? null,
      });

      const browserResult = await WebBrowser.openAuthSessionAsync(
        order.approvalUrl,
        PAYPAL_RETURN_URL,
      );

      if (browserResult.type !== 'success') {
        Alert.alert(t('payment.title'), t('payment.paypalCancelled'));
        return;
      }

      await capturePayPalOrder({
        paypalOrderId: order.paypalOrderId,
        bookingId,
      });

      setLastOrderId(String(bookingId));
      clearCheckoutSession();
      router.replace('/confirmation');
    } catch (e) {
      Alert.alert(t('payment.title'), mapApiError(e, t));
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.shell}>
        <DetailHeader title={t('payment.title')} />
        <ScrollView contentContainerStyle={styles.content} style={styles.scroll}>
          {usePayPal ? (
            <AppText variant="body" color="textSecondary">
              {t('payment.paypalSandbox')}
            </AppText>
          ) : (
            <AppText variant="body" color="textSecondary">
              {t('payment.unavailable')}
            </AppText>
          )}
          <View style={styles.summary}>
            <AppText variant="body-em" color="text">
              {draft.title}
            </AppText>
            <AppText variant="h3" color="primaryLight">
              {formatMoney(total, draft.currency)}
            </AppText>
          </View>
        </ScrollView>
        <View style={styles.footer}>
          <SecondaryButton title={t('common.back')} onPress={() => router.back()} style={styles.half} />
          <PrimaryButton
            title={usePayPal ? t('payment.payWithPayPal') : t('payment.payNow')}
            onPress={() => void payWithPayPal()}
            loading={busy}
            disabled={!usePayPal}
            style={styles.half}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: 'transparent' },
    shell: { flex: 1, paddingHorizontal: spacing.screen },
    scroll: { flex: 1 },
    content: { paddingBottom: spacing.xxxl, gap: spacing.lg },
    empty: { marginVertical: spacing.lg },
    summary: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: spacing.md,
      backgroundColor: colors.card,
      borderRadius: radii.lg,
      borderWidth: 1,
      borderColor: colors.border,
    },
    footer: {
      flexDirection: 'row',
      gap: spacing.md,
      paddingVertical: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    half: { flex: 1 },
  });
}
