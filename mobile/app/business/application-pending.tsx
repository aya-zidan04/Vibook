import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Redirect, useRouter } from 'expo-router';
import { AppText } from '@/components/ui/AppText';
import { SecondaryButton } from '@/components/ui/Button';
import { DetailHeader } from '@/components/layout/DetailHeader';
import { Screen } from '@/components/layout/Screen';
import { fetchMyBusinessProfile } from '@/api/businessProfileApi';
import { useTranslation } from '@/i18n/useTranslation';
import { useAppStore } from '@/store/appStore';
import { useBusinessHubStore } from '@/store/businessHubStore';
import { spacing, useThemeColors } from '@/theme';
import type { ThemeColors } from '@/theme/palettes';

export default function BusinessApplicationPendingScreen() {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const { t } = useTranslation();
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const applicationStatus = useBusinessHubStore((s) => s.applicationStatus);
  const profile = useBusinessHubStore((s) => s.profile);
  const syncBusinessApprovalFromApi = useBusinessHubStore((s) => s.syncBusinessApprovalFromApi);

  const [serverName, setServerName] = useState<string | null>(null);
  const [verifyState, setVerifyState] = useState<'loading' | 'ready' | 'error'>('loading');

  useFocusEffect(
    useCallback(() => {
      if (!isAuthenticated) {
        setVerifyState('ready');
        return;
      }
      let active = true;
      setVerifyState('loading');
      void (async () => {
        try {
          const p = await fetchMyBusinessProfile();
          if (!active) return;
          syncBusinessApprovalFromApi(p);
          setServerName(p?.businessName ?? null);
          setVerifyState('ready');
        } catch {
          if (active) {
            syncBusinessApprovalFromApi(undefined);
            setVerifyState('error');
          }
        }
      })();
      return () => {
        active = false;
      };
    }, [isAuthenticated, syncBusinessApprovalFromApi]),
  );

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  if (applicationStatus === 'none') return <Redirect href="/business" />;
  if (applicationStatus === 'rejected') return <Redirect href="/business/application-rejected" />;
  if (applicationStatus === 'approved') return <Redirect href="/business/home" />;

  const displayName = serverName?.trim() || profile.displayName || '—';

  if (verifyState === 'loading') {
    return (
      <Screen
        scroll={false}
        contentStyle={styles.pad}
        header={<DetailHeader title={t('businessHub.pendingTitle')} />}
      >
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.primary} />
          <AppText variant="body" color="textMuted" style={styles.loadingText}>
            {t('businessHub.pendingSyncing')}
          </AppText>
        </View>
      </Screen>
    );
  }

  return (
    <Screen
      scroll
      contentStyle={styles.pad}
      header={<DetailHeader title={t('businessHub.pendingTitle')} />}
    >
      {verifyState === 'error' ? (
        <AppText variant="body" color="error" style={styles.banner}>
          {t('businessHub.pendingSyncError')}
        </AppText>
      ) : null}

      <AppText variant="h2" color="text">
        {t('businessHub.pendingHeadline')}
      </AppText>
      <AppText variant="body" color="textSecondary">
        {t('businessHub.pendingBody')}
      </AppText>
      <View style={styles.summary}>
        <AppText variant="caption" color="textMuted">
          {t('businessHub.pendingSummary')}
        </AppText>
        <AppText variant="bodyMedium" color="text">
          {displayName}
        </AppText>
      </View>
      <AppText variant="caption" color="textMuted">
        {t('businessHub.pendingNote')}
      </AppText>
      <SecondaryButton title={t('businessHub.backBrowse')} onPress={() => router.replace('/(tabs)/explore')} />
    </Screen>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    pad: { paddingTop: spacing.md, gap: spacing.lg, paddingBottom: spacing.xxxl },
    loading: { flex: 1, minHeight: 200, alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
    loadingText: { textAlign: 'center' },
    banner: { marginBottom: spacing.sm, lineHeight: 22 },
    summary: {
      padding: spacing.lg,
      borderRadius: 12,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      gap: spacing.xs,
    },
  });
}
