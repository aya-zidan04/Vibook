import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Redirect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/ui/AppText';
import { PrimaryButton, SecondaryButton } from '@/components/ui/Button';
import { DetailHeader } from '@/components/layout/DetailHeader';
import { Screen } from '@/components/layout/Screen';
import { useTranslation } from '@/i18n/useTranslation';
import { useBusinessHubStore } from '@/store/businessHubStore';
import { radii, spacing, useThemeColors } from '@/theme';
import type { ThemeColors } from '@/theme/palettes';

const BENEFIT_ICONS = ['people-outline', 'trending-up-outline', 'megaphone-outline'] as const;

export default function BusinessIntroScreen() {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const { t } = useTranslation();
  const applicationStatus = useBusinessHubStore((s) => s.applicationStatus);
  const setApplicationStatus = useBusinessHubStore((s) => s.setApplicationStatus);
  const devSetRejected = useBusinessHubStore((s) => s.devSetRejected);
  const resetHub = useBusinessHubStore((s) => s.resetHub);

  if (applicationStatus === 'pending') return <Redirect href="/business/application-pending" />;
  if (applicationStatus === 'rejected') return <Redirect href="/business/application-rejected" />;
  if (applicationStatus === 'approved') return <Redirect href="/business/home" />;

  const blocks = [
    { icon: BENEFIT_ICONS[0], titleKey: 'business.b1Title', bodyKey: 'business.b1Body' },
    { icon: BENEFIT_ICONS[1], titleKey: 'business.b2Title', bodyKey: 'business.b2Body' },
    { icon: BENEFIT_ICONS[2], titleKey: 'business.b3Title', bodyKey: 'business.b3Body' },
  ] as const;

  return (
    <Screen scroll contentStyle={styles.pad} header={<DetailHeader title={t('business.title')} />}>
      <LinearGradient colors={[colors.accentMuted, 'transparent']} style={styles.hero}>
        <AppText variant="overline" color="accent">
          {t('business.kicker')}
        </AppText>
        <AppText variant="h1" color="text" style={styles.headline}>
          {t('business.headline')}
        </AppText>
        <AppText variant="body" color="textSecondary">
          {t('business.body')}
        </AppText>
      </LinearGradient>

      <AppText variant="h2" color="text">
        {t('business.benefitsTitle')}
      </AppText>

      <View style={styles.grid}>
        {blocks.map((b) => (
          <View key={b.titleKey} style={styles.benefitCard}>
            <View style={styles.iconWrap}>
              <Ionicons name={b.icon} size={24} color={colors.primary} />
            </View>
            <AppText variant="h3" color="text">
              {t(b.titleKey)}
            </AppText>
            <AppText variant="body" color="textSecondary">
              {t(b.bodyKey)}
            </AppText>
          </View>
        ))}
      </View>

      <PrimaryButton title={t('business.applyCta')} onPress={() => router.push('/business/join')} />

      <AppText variant="caption" color="textMuted" style={styles.note}>
        {t('business.note')}
      </AppText>

      {__DEV__ ? (
        <View style={styles.devBox}>
          <AppText variant="caption" color="textMuted">
            {t('businessHub.devMockHint')}
          </AppText>
          <View style={styles.devRow}>
            <SecondaryButton title={t('businessHub.devPending')} onPress={() => setApplicationStatus('pending')} />
            <SecondaryButton
              title={t('businessHub.devRejected')}
              onPress={() => devSetRejected(t('businessHub.devRejectReason'))}
            />
            <SecondaryButton title={t('businessHub.devApproved')} onPress={() => setApplicationStatus('approved')} />
          </View>
          <SecondaryButton title={t('businessHub.devReset')} onPress={() => resetHub()} />
        </View>
      ) : null}
    </Screen>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    pad: { paddingTop: spacing.md, gap: spacing.lg, paddingBottom: spacing.xxxl },
    hero: {
      padding: spacing.xl,
      borderRadius: radii.xxl,
      borderWidth: 1,
      borderColor: colors.border,
      gap: spacing.sm,
    },
    headline: { lineHeight: 34 },
    grid: { gap: spacing.md },
    benefitCard: {
      padding: spacing.lg,
      borderRadius: radii.xl,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      gap: spacing.sm,
    },
    iconWrap: {
      width: 48,
      height: 48,
      borderRadius: radii.md,
      backgroundColor: colors.primaryMuted,
      alignItems: 'center',
      justifyContent: 'center',
    },
    note: { lineHeight: 18, textAlign: 'center', marginTop: spacing.sm },
    devBox: { gap: spacing.sm, marginTop: spacing.lg },
    devRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  });
}
