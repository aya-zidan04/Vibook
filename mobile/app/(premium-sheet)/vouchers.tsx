import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { PremiumScreen } from '@/components/sheet/PremiumScreen';
import { EmptyState } from '@/components/feedback/EmptyState';
import { useTranslation } from '@/i18n/useTranslation';
import { useAppStore } from '@/store/appStore';
import { spacing, useThemeColors } from '@/theme';
import type { ThemeColors } from '@/theme/palettes';

export default function VouchersScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { t } = useTranslation();
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);

  if (!isAuthenticated) {
    return (
      <PremiumScreen title={t('vouchers.title')}>
        <View style={styles.body}>
          <EmptyState
            icon="pricetag-outline"
            title={t('vouchers.signInTitle')}
            description={t('vouchers.signInDesc')}
            actionLabel={t('auth.loginCta')}
            onAction={() => router.push('/login')}
          />
        </View>
      </PremiumScreen>
    );
  }

  return (
    <PremiumScreen title={t('vouchers.title')}>
      <View style={styles.body}>
        <EmptyState
          icon="pricetag-outline"
          title={t('vouchers.comingSoonTitle')}
          description={t('vouchers.comingSoonBody')}
        />
      </View>
    </PremiumScreen>
  );
}

function createStyles(_colors: ThemeColors) {
  return StyleSheet.create({
    body: { flex: 1, minHeight: 280, marginTop: spacing.md },
  });
}
