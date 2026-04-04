import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { AppText } from '@/components/ui/AppText';
import { PrimaryButton, SecondaryButton } from '@/components/ui/Button';
import { DetailHeader } from '@/components/layout/DetailHeader';
import { Screen } from '@/components/layout/Screen';
import { useTranslation } from '@/i18n/useTranslation';
import { useBusinessHubStore } from '@/store/businessHubStore';
import { spacing, useThemeColors } from '@/theme';
import type { ThemeColors } from '@/theme/palettes';

export default function BusinessApplicationPendingScreen() {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const { t } = useTranslation();
  const applicationStatus = useBusinessHubStore((s) => s.applicationStatus);
  const profile = useBusinessHubStore((s) => s.profile);
  const setApplicationStatus = useBusinessHubStore((s) => s.setApplicationStatus);
  const devSetRejected = useBusinessHubStore((s) => s.devSetRejected);

  if (applicationStatus === 'none') return <Redirect href="/business" />;
  if (applicationStatus === 'rejected') return <Redirect href="/business/application-rejected" />;
  if (applicationStatus === 'approved') return <Redirect href="/business/home" />;

  return (
    <Screen
      scroll
      contentStyle={styles.pad}
      header={<DetailHeader title={t('businessHub.pendingTitle')} />}
    >
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
          {profile.displayName || '—'}
        </AppText>
      </View>
      <AppText variant="caption" color="textMuted">
        {t('businessHub.pendingNote')}
      </AppText>
      <SecondaryButton title={t('businessHub.backBrowse')} onPress={() => router.replace('/(tabs)/explore')} />

      {__DEV__ ? (
        <View style={styles.dev}>
          <AppText variant="caption" color="accent">
            {t('businessHub.devSimulateAdmin')}
          </AppText>
          <PrimaryButton
            title={t('businessHub.devApprove')}
            onPress={() => {
              setApplicationStatus('approved');
              router.replace('/business/home');
            }}
          />
          <SecondaryButton
            title={t('businessHub.devReject')}
            onPress={() => {
              devSetRejected(t('businessHub.devRejectReason'));
              router.replace('/business/application-rejected');
            }}
          />
        </View>
      ) : null}
    </Screen>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    pad: { paddingTop: spacing.md, gap: spacing.lg, paddingBottom: spacing.xxxl },
    summary: {
      padding: spacing.lg,
      borderRadius: 12,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      gap: spacing.xs,
    },
    dev: { gap: spacing.sm, marginTop: spacing.xl },
  });
}
