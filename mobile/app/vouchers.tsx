import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { AppText } from '@/components/ui/AppText';
import { PrimaryButton } from '@/components/ui/Button';
import { DetailHeader } from '@/components/layout/DetailHeader';
import { Screen } from '@/components/layout/Screen';
import { EmptyState } from '@/components/feedback/EmptyState';
import { useIntegrationMode } from '@/hooks/useIntegrationMode';
import { useFormatMoney } from '@/hooks/useFormatMoney';
import { useTranslation } from '@/i18n/useTranslation';
import { meVouchersApi } from '@/services/api/meVouchersApi';
import { ApiRequestError } from '@/services/api/http';
import { MOCK_VOUCHERS } from '@/services/mock';
import { useLocaleStore } from '@/store/localeStore';
import type { Voucher } from '@/types';
import { voucherResponseToVoucher } from '@/utils/meFeatureMappers';
import { radii, spacing, useThemeColors } from '@/theme';
import type { ThemeColors } from '@/theme/palettes';

export default function VouchersScreen() {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { t, locale } = useTranslation();
  const router = useRouter();
  const { api, authenticated, liveAccount } = useIntegrationMode();

  const [list, setList] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [redeemBusy, setRedeemBusy] = useState(false);

  const loadList = useCallback(async () => {
    if (!liveAccount) {
      setList([]);
      setListError(null);
      return;
    }
    setLoading(true);
    setListError(null);
    try {
      const res = await meVouchersApi.list();
      setList(res.vouchers.map(voucherResponseToVoucher));
    } catch (e) {
      setList([]);
      setListError(e instanceof ApiRequestError ? e.message : t('vouchers.loadError'));
    } finally {
      setLoading(false);
    }
  }, [liveAccount, t]);

  useFocusEffect(
    useCallback(() => {
      void loadList();
    }, [loadList]),
  );

  const redeem = async () => {
    const trimmed = code.trim();
    if (!trimmed) {
      Alert.alert(t('common.error'), t('vouchers.codeRequired'));
      return;
    }
    setRedeemBusy(true);
    try {
      const v = await meVouchersApi.redeem({ code: trimmed });
      setList((prev) => [voucherResponseToVoucher(v), ...prev.filter((x) => x.id !== v.id)]);
      setCode('');
      Alert.alert(t('vouchers.redeemSuccessTitle'), t('vouchers.redeemSuccessBody'));
    } catch (e) {
      if (e instanceof ApiRequestError) {
        let msg = e.message;
        if (e.status === 404) msg = t('vouchers.errorInvalid');
        else if (e.status === 409) msg = t('vouchers.errorRedeemed');
        else if (e.status === 400 && (!msg || msg === 'Request failed'))
          msg = t('vouchers.errorExpired');
        Alert.alert(t('common.error'), msg);
      } else {
        Alert.alert(t('common.error'), t('common.error'));
      }
    } finally {
      setRedeemBusy(false);
    }
  };

  if (api && !authenticated) {
    return (
      <Screen scroll contentStyle={styles.pad}>
        <DetailHeader title={t('vouchers.title')} />
        <EmptyState
          icon="pricetag-outline"
          title={t('vouchers.signInTitle')}
          description={t('vouchers.signInDesc')}
          actionLabel={t('entry.loginSignup')}
          onAction={() => router.push('/(auth)/login')}
        />
      </Screen>
    );
  }

  if (!api) {
    return (
      <Screen scroll contentStyle={styles.pad}>
        <DetailHeader title={t('vouchers.title')} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {MOCK_VOUCHERS.map((v) => (
            <VoucherCard key={v.id} v={v} locale={locale} styles={styles} />
          ))}
        </ScrollView>
      </Screen>
    );
  }

  if (loading && list.length === 0 && !listError) {
    return (
      <Screen scroll contentStyle={styles.pad}>
        <DetailHeader title={t('vouchers.title')} />
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
          <AppText variant="caption" color="textMuted" style={{ marginTop: spacing.md }}>
            {t('common.loading')}
          </AppText>
        </View>
      </Screen>
    );
  }

  if (listError && list.length === 0) {
    return (
      <Screen scroll contentStyle={styles.pad}>
        <DetailHeader title={t('vouchers.title')} />
        <AppText variant="body" color="error" style={styles.err}>
          {listError}
        </AppText>
        <PrimaryButton title={t('common.retry')} onPress={() => void loadList()} />
      </Screen>
    );
  }

  const displayList = list;

  return (
    <Screen scroll contentStyle={styles.pad}>
      <DetailHeader title={t('vouchers.title')} />
      <View style={styles.redeemBox}>
        <AppText variant="caption" color="textMuted">
          {t('vouchers.redeemLabel')}
        </AppText>
        <TextInput
          value={code}
          onChangeText={setCode}
          placeholder={t('vouchers.codePlaceholder')}
          placeholderTextColor={colors.textMuted}
          autoCapitalize="characters"
          autoCorrect={false}
          style={styles.input}
        />
        <PrimaryButton title={t('vouchers.redeemCta')} onPress={() => void redeem()} loading={redeemBusy} />
      </View>
      {listError ? (
        <AppText variant="caption" color="warning" style={styles.warn}>
          {listError}
        </AppText>
      ) : null}
      {displayList.length === 0 ? (
        <EmptyState
          icon="pricetag-outline"
          title={t('vouchers.emptyTitle')}
          description={t('vouchers.emptyDesc')}
        />
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {displayList.map((v) => (
            <VoucherCard key={v.id} v={v} locale={locale} styles={styles} />
          ))}
        </ScrollView>
      )}
    </Screen>
  );
}

function VoucherCard({
  v,
  locale,
  styles,
}: {
  v: Voucher;
  locale: 'en' | 'ar';
  styles: ReturnType<typeof createStyles>;
}) {
  const { t } = useTranslation();
  const { formatMoney } = useFormatMoney();
  const displayCurrency = useLocaleStore((s) => s.currency);
  const title = locale === 'ar' && v.titleAr ? v.titleAr : v.title;
  const off =
    v.discountType === 'percent'
      ? t('vouchers.offPercent').replace('{n}', String(v.discountValue))
      : formatMoney(v.discountValue, displayCurrency);
  return (
    <View style={[styles.card, v.redeemed && styles.cardRedeemed]}>
      <AppText variant="meta" color="accent">
        {v.code}
      </AppText>
      <AppText variant="h3" color="text" numberOfLines={2}>
        {title}
      </AppText>
      <AppText variant="caption" color="textMuted">
        {off}
      </AppText>
      <AppText variant="caption" color="textMuted">
        {v.expiresAt.slice(0, 10)}
      </AppText>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    pad: { paddingTop: spacing.md, gap: spacing.md },
    center: { paddingVertical: 40, alignItems: 'center' },
    err: { marginBottom: spacing.sm },
    warn: { marginBottom: spacing.xs },
    redeemBox: {
      gap: spacing.sm,
      padding: spacing.md,
      backgroundColor: colors.surface,
      borderRadius: radii.xl,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: spacing.sm,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radii.lg,
      paddingHorizontal: spacing.md,
      paddingVertical: 12,
      color: colors.text,
      backgroundColor: colors.backgroundElevated,
    },
    card: {
      width: 220,
      marginEnd: spacing.md,
      padding: spacing.lg,
      backgroundColor: colors.surface,
      borderRadius: radii.xl,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 8,
      marginBottom: spacing.lg,
    },
    cardRedeemed: { opacity: 0.75 },
  });
}
