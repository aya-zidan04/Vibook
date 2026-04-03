import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { DetailHeader } from '@/components/layout/DetailHeader';
import { Screen } from '@/components/layout/Screen';
import { AppText } from '@/components/ui/AppText';
import { useFormatMoney } from '@/hooks/useFormatMoney';
import { useTranslation } from '@/i18n/useTranslation';
import { useMockUser } from '@/hooks/useMockUser';
import { radii, spacing, useThemeColors } from '@/theme';
import type { ThemeColors } from '@/theme/palettes';

export default function WalletScreen() {
  const { t, currency: displayCurrency } = useTranslation();
  const { formatMoney } = useFormatMoney();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { user } = useMockUser();

  return (
    <Screen scroll contentStyle={styles.pad}>
      <DetailHeader title={t('wallet.title')} />
      <View style={styles.balance}>
        <AppText variant="caption" color="textMuted">
          {t('wallet.balance')}
        </AppText>
        <AppText variant="display" color="text">
          {formatMoney(user.walletBalance, displayCurrency)}
        </AppText>
      </View>
      <AppText variant="body" color="textSecondary">
        {t('wallet.note')}
      </AppText>
    </Screen>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    pad: { paddingTop: spacing.md, gap: spacing.lg },
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
