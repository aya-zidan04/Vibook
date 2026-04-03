import { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { AppText } from '@/components/ui/AppText';
import { PrimaryButton, SecondaryButton } from '@/components/ui/Button';
import { DetailHeader } from '@/components/layout/DetailHeader';
import { Screen } from '@/components/layout/Screen';
import { useFormatMoney } from '@/hooks/useFormatMoney';
import { useIntegrationMode } from '@/hooks/useIntegrationMode';
import { useTranslation } from '@/i18n/useTranslation';
import { bookingsApi } from '@/services/api/bookingsApi';
import { ApiRequestError } from '@/services/api/http';
import { getAccessToken } from '@/services/auth/tokenStorage';
import { useBookingDraftStore } from '@/store/bookingDraftStore';
import { radii, spacing, useThemeColors } from '@/theme';
import type { ThemeColors } from '@/theme/palettes';
import {
  buildCreateBookingRequestFromDraft,
  isNumericCatalogRef,
} from '@/utils/bookingApiMap';

export default function PaymentScreen() {
  const { api: apiMode } = useIntegrationMode();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const draft = useBookingDraftStore((s) => s.draft);
  const setDraft = useBookingDraftStore((s) => s.setDraft);
  const setLastOrderId = useBookingDraftStore((s) => s.setLastOrderId);
  const [busy, setBusy] = useState(false);
  const { t } = useTranslation();
  const { formatMoney } = useFormatMoney();

  if (!draft) {
    return (
      <Screen>
        <DetailHeader title={t('payment.title')} />
        <AppText variant="body" color="textSecondary" style={styles.empty}>
          {t('payment.empty')}
        </AppText>
        <PrimaryButton title={t('common.home')} onPress={() => router.replace('/(tabs)/explore')} />
      </Screen>
    );
  }

  const total = draft.unitPrice * draft.quantity + draft.fees;

  const pay = async () => {
    setBusy(true);
    const token = await getAccessToken();
    const canUseBookingApi =
      apiMode && token && isNumericCatalogRef(draft.refId);

    const finishMock = () => {
      const id = `VB-${Date.now().toString(36).toUpperCase()}`;
      setLastOrderId(id);
      setDraft(null);
      setBusy(false);
      router.replace('/confirmation');
    };

    if (!canUseBookingApi) {
      setTimeout(finishMock, 600);
      return;
    }

    try {
      const body = buildCreateBookingRequestFromDraft(draft);
      const res = await bookingsApi.create(body);
      setLastOrderId(res.id);
      setDraft(null);
      router.replace('/confirmation');
    } catch (e) {
      const msg =
        e instanceof ApiRequestError
          ? e.message
          : e instanceof Error
            ? e.message
            : t('common.error');
      Alert.alert(t('common.error'), msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.shell}>
        <DetailHeader title={t('payment.title')} />
        <ScrollView contentContainerStyle={styles.content} style={styles.scroll}>
          <AppText variant="body" color="textSecondary">
            {t('payment.sim')}
          </AppText>
          <View style={styles.fakeCard}>
            <AppText variant="meta" color="textMuted">
              {t('payment.cardNumber')}
            </AppText>
            <AppText variant="h3" color="text">
              •••• •••• •••• 4242
            </AppText>
            <View style={styles.fakeRow}>
              <View>
                <AppText variant="meta" color="textMuted">
                  {t('payment.expires')}
                </AppText>
                <AppText variant="bodyMedium" color="text">
                  12 / 28
                </AppText>
              </View>
              <View>
                <AppText variant="meta" color="textMuted">
                  {t('payment.cvv')}
                </AppText>
                <AppText variant="bodyMedium" color="text">
                  •••
                </AppText>
              </View>
            </View>
          </View>
          <View style={styles.summary}>
            <AppText variant="bodyMedium" color="text">
              {draft.title}
            </AppText>
            <AppText variant="price" color="accent">
              {formatMoney(total, draft.currency)}
            </AppText>
          </View>
        </ScrollView>
        <View style={styles.footer}>
          <SecondaryButton title={t('common.back')} onPress={() => router.back()} style={styles.half} />
          <PrimaryButton title={t('payment.payNow')} onPress={() => void pay()} loading={busy} style={styles.half} />
        </View>
      </View>
    </SafeAreaView>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  shell: { flex: 1, paddingHorizontal: spacing.screen },
  scroll: { flex: 1 },
  content: { paddingBottom: spacing.xxxl, gap: spacing.lg },
  empty: { marginVertical: spacing.lg },
  fakeCard: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  fakeRow: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.lg },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.surface,
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
