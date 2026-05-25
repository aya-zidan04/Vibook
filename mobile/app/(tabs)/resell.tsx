import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/layout/Screen';
import { EmptyState } from '@/components/feedback/EmptyState';
import { AppText } from '@/components/ui/AppText';
import { useTranslation } from '@/i18n/useTranslation';
import { useAppStore } from '@/store/appStore';
import { spacing, useThemeColors } from '@/theme';
import type { ThemeColors } from '@/theme/palettes';

export default function ResellTabScreen() {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const { t } = useTranslation();
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);

  const header = (
    <View style={styles.tabHeader}>
      <AppText variant="h1" color="text" style={styles.title}>
        {t('resell.title')}
      </AppText>
      <AppText variant="body" color="textSecondary" style={styles.sub}>
        {t('resell.subtitle')}
      </AppText>
    </View>
  );

  return (
    <Screen scroll contentStyle={styles.pad} header={header}>
      <EmptyState
        icon="swap-horizontal-outline"
        title={isAuthenticated ? t('resell.emptyTitle') : t('resell.signInTitle')}
        description={isAuthenticated ? t('resell.emptyBody') : t('resell.signInBody')}
        actionLabel={isAuthenticated ? t('resell.browseCta') : t('auth.loginCta')}
        onAction={() =>
          isAuthenticated ? router.push('/(tabs)/booking') : router.push('/login')
        }
      />
    </Screen>
  );
}

function createStyles(_colors: ThemeColors) {
  return StyleSheet.create({
    pad: { paddingTop: spacing.md },
    tabHeader: { paddingTop: spacing.md, paddingBottom: spacing.sm },
    title: { marginBottom: spacing.xs },
    sub: { lineHeight: 22 },
  });
}
