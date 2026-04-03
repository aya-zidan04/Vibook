import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { AppText } from '@/components/ui/AppText';
import { PrimaryButton } from '@/components/ui/Button';
import { DetailHeader } from '@/components/layout/DetailHeader';
import { Screen } from '@/components/layout/Screen';
import { EmptyState } from '@/components/feedback/EmptyState';
import { useIntegrationMode } from '@/hooks/useIntegrationMode';
import { useFormatMoney } from '@/hooks/useFormatMoney';
import { useTranslation } from '@/i18n/useTranslation';
import { useMockUser } from '@/hooks/useMockUser';
import { meWalletApi } from '@/services/api/meWalletApi';
import { ApiRequestError } from '@/services/api/http';
import { normalizeCurrencyForApi } from '@/utils/bookingApiMap';
import { toNum } from '@/utils/meFeatureMappers';
import { radii, spacing, useThemeColors } from '@/theme';
import type { ThemeColors } from '@/theme/palettes';

export default function WalletScreen() {
  const router = useRouter();
  const { t, currency: displayCurrency } = useTranslation();
  const { formatMoney } = useFormatMoney();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { user } = useMockUser();
  const { api, authenticated, liveAccount } = useIntegrationMode();

  const [remoteBalance, setRemoteBalance] = useState<number | null>(null);
  const [remoteCurrency, setRemoteCurrency] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadWallet = useCallback(async () => {
    if (!liveAccount) {
      setRemoteBalance(null);
      setRemoteCurrency(null);
      setError(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const w = await meWalletApi.get();
      setRemoteBalance(toNum(w.balance));
      setRemoteCurrency(normalizeCurrencyForApi(w.currency, displayCurrency));
    } catch (e) {
      setRemoteBalance(null);
      setRemoteCurrency(null);
      setError(e instanceof ApiRequestError ? e.message : t('wallet.loadError'));
    } finally {
      setLoading(false);
    }
  }, [liveAccount, displayCurrency, t]);

  useFocusEffect(
    useCallback(() => {
      void loadWallet();
    }, [loadWallet]),
  );

  if (api && !authenticated) {
    return (
      <Screen scroll contentStyle={styles.pad}>
        <DetailHeader title={t('wallet.title')} />
        <EmptyState
          icon="wallet-outline"
          title={t('wallet.signInTitle')}
          description={t('wallet.signInDesc')}
          actionLabel={t('entry.loginSignup')}
          onAction={() => router.push('/(auth)/login')}
        />
      </Screen>
    );
  }

  const walletReady = remoteCurrency !== null;
  const useRemote = Boolean(liveAccount && walletReady);
  const balance = useRemote ? remoteBalance! : user.walletBalance;
  const sourceCurrency = useRemote ? remoteCurrency! : displayCurrency;

  if (liveAccount && loading && !walletReady && !error) {
    return (
      <Screen scroll contentStyle={styles.pad}>
        <DetailHeader title={t('wallet.title')} />
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
          <AppText variant="caption" color="textMuted" style={{ marginTop: spacing.md }}>
            {t('common.loading')}
          </AppText>
        </View>
      </Screen>
    );
  }

  if (liveAccount && error && !walletReady) {
    return (
      <Screen scroll contentStyle={styles.pad}>
        <DetailHeader title={t('wallet.title')} />
        <AppText variant="body" color="error" style={styles.err}>
          {error}
        </AppText>
        <PrimaryButton title={t('common.retry')} onPress={() => void loadWallet()} />
      </Screen>
    );
  }

  return (
    <Screen scroll contentStyle={styles.pad}>
      <DetailHeader title={t('wallet.title')} />
      {liveAccount && loading ? (
        <AppText variant="caption" color="textMuted" style={styles.refreshHint}>
          {t('common.loading')}
        </AppText>
      ) : null}
      <View style={styles.balance}>
        <AppText variant="caption" color="textMuted">
          {t('wallet.balance')}
        </AppText>
        <AppText variant="display" color="text">
          {formatMoney(balance, sourceCurrency)}
        </AppText>
      </View>
      <AppText variant="body" color="textSecondary">
        {useRemote ? t('wallet.noteLive') : t('wallet.note')}
      </AppText>
    </Screen>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    pad: { paddingTop: spacing.md, gap: spacing.lg },
    center: { paddingVertical: 32, alignItems: 'center' },
    err: { marginBottom: spacing.sm },
    refreshHint: { marginBottom: -spacing.sm },
    balance: {
      padding: spacing.xl,
      backgroundColor: colors.primaryMuted,
      borderRadius: radii.xxl,
      borderWidth: 1,
      borderColor: colors.border,
      gap: spacing.sm,
    },
  });
}
