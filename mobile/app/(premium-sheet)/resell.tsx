import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { EmptyState } from '@/components/feedback/EmptyState';
import { AppText } from '@/components/ui/AppText';
import { PremiumScreen } from '@/components/sheet/PremiumScreen';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useTranslation } from '@/i18n/useTranslation';
import { useAppStore } from '@/store/appStore';
import { canAccessResell } from '@/utils/premiumAccess';
import { spacing, useThemeColors } from '@/theme';
import type { ThemeColors } from '@/theme/palettes';

export default function ResellScreen() {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const { t } = useTranslation();
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const { user } = useCurrentUser();
  const hasResellAccess = isAuthenticated && canAccessResell(user);

  let emptyProps: {
    title: string;
    description: string;
    actionLabel: string;
    onAction: () => void;
  };

  if (!isAuthenticated) {
    emptyProps = {
      title: t('resell.signInTitle'),
      description: t('resell.signInBody'),
      actionLabel: t('auth.loginCta'),
      onAction: () => router.push('/login'),
    };
  } else if (!hasResellAccess) {
    emptyProps = {
      title: t('resell.premiumTitle'),
      description: t('resell.premiumBody'),
      actionLabel: t('resell.premiumCta'),
      onAction: () => router.push('/membership'),
    };
  } else {
    emptyProps = {
      title: t('resell.emptyTitle'),
      description: t('resell.emptyBody'),
      actionLabel: t('resell.browseCta'),
      onAction: () => router.push('/(tabs)/booking'),
    };
  }

  return (
    <PremiumScreen title={t('resell.title')}>
      <AppText variant="body" color="textSecondary" style={styles.subtitle}>
        {t('resell.subtitle')}
      </AppText>
      <View style={styles.body}>
        <EmptyState
          icon="swap-horizontal-outline"
          title={emptyProps.title}
          description={emptyProps.description}
          actionLabel={emptyProps.actionLabel}
          onAction={emptyProps.onAction}
        />
      </View>
    </PremiumScreen>
  );
}

function createStyles(_colors: ThemeColors) {
  return StyleSheet.create({
    subtitle: { lineHeight: 22, marginBottom: spacing.lg },
    body: { flex: 1, minHeight: 280 },
  });
}
