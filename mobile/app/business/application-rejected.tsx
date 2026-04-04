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

export default function BusinessApplicationRejectedScreen() {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const { t } = useTranslation();
  const applicationStatus = useBusinessHubStore((s) => s.applicationStatus);
  const rejectedReason = useBusinessHubStore((s) => s.rejectedReason);

  if (applicationStatus === 'pending') return <Redirect href="/business/application-pending" />;
  if (applicationStatus === 'approved') return <Redirect href="/business/home" />;
  if (applicationStatus === 'none') return <Redirect href="/business" />;

  return (
    <Screen
      scroll
      contentStyle={styles.pad}
      header={<DetailHeader title={t('businessHub.rejectedTitle')} />}
    >
      <AppText variant="h2" color="text">
        {t('businessHub.rejectedHeadline')}
      </AppText>
      <AppText variant="body" color="textSecondary">
        {t('businessHub.rejectedBody')}
      </AppText>
      {rejectedReason ? (
        <View style={styles.reason}>
          <AppText variant="caption" color="textMuted">
            {t('businessHub.rejectedReasonLabel')}
          </AppText>
          <AppText variant="body" color="text">
            {rejectedReason}
          </AppText>
        </View>
      ) : null}
      <PrimaryButton title={t('businessHub.reapplyCta')} onPress={() => router.push('/business/join')} />
      <SecondaryButton title={t('businessHub.backBrowse')} onPress={() => router.replace('/(tabs)/explore')} />
    </Screen>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    pad: { paddingTop: spacing.md, gap: spacing.lg, paddingBottom: spacing.xxxl },
    reason: {
      padding: spacing.lg,
      borderRadius: 12,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      gap: spacing.xs,
    },
  });
}
