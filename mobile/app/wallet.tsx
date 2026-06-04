import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { DetailHeader } from '@/components/layout/DetailHeader';
import { Screen } from '@/components/layout/Screen';
import { EmptyState } from '@/components/feedback/EmptyState';
import { PrimaryButton } from '@/components/ui/Button';
import { useTranslation } from '@/i18n/useTranslation';
import { useAppStore } from '@/store/appStore';
import { spacing, useThemeColors } from '@/theme';
import type { ThemeColors } from '@/theme/palettes';

export default function WalletScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);

  const header = <DetailHeader title={t('wallet.title')} />;

  if (!isAuthenticated) {
    return (
      <Screen scroll contentStyle={styles.pad} header={header}>
        <View style={styles.body}>
          <EmptyState
            icon="wallet-outline"
            title={t('wallet.signInTitle')}
            description={t('wallet.signInDesc')}
            actionLabel={t('auth.loginCta')}
            onAction={() => router.push('/login')}
          />
        </View>
      </Screen>
    );
  }

  return (
    <Screen scroll contentStyle={styles.pad} header={header}>
      <View style={styles.body}>
        <EmptyState
          icon="wallet-outline"
          title={t('wallet.comingSoonTitle')}
          description={t('wallet.comingSoonBody')}
        />
      </View>
    </Screen>
  );
}

function createStyles(_colors: ThemeColors) {
  return StyleSheet.create({
    pad: { paddingTop: spacing.md, gap: spacing.lg },
    body: { flex: 1, minHeight: 280 },
  });
}
