import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/ui/AppText';
import { PrimaryButton } from '@/components/ui/Button';
import { DetailHeader } from '@/components/layout/DetailHeader';
import { Screen } from '@/components/layout/Screen';
import { useTranslation } from '@/i18n/useTranslation';
import { useMockUser } from '@/hooks/useMockUser';
import { TIER_TO_PLAN_ID, getPlanById } from '@/services/mock';
import type { User } from '@/types';
import { radii, spacing, useThemeColors } from '@/theme';
import type { ThemeColors } from '@/theme/palettes';

const TIER_LABEL_KEY: Record<User['membershipTier'], string> = {
  standard: 'membership.tierStandard',
  gold: 'membership.tierGold',
  platinum: 'membership.tierPlatinum',
};

export default function MembershipScreen() {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const { t } = useTranslation();
  const { user } = useMockUser();

  const tier = user.membershipTier;
  const planId = TIER_TO_PLAN_ID[tier];
  const mockPlan = getPlanById(planId);

  return (
    <Screen scroll contentStyle={styles.pad}>
      <DetailHeader title={t('membership.title')} />
      <LinearGradient colors={[colors.primaryMuted, 'transparent']} style={styles.hero}>
        <Ionicons name="diamond-outline" size={36} color={colors.accent} style={styles.heroIcon} />
        <AppText variant="overline" color="accent">
          {t('membership.currentLabel')}
        </AppText>
        <AppText variant="h1" color="text">
          {t(TIER_LABEL_KEY[tier])}
        </AppText>
        <AppText variant="body" color="textSecondary">
          {t('membership.subtitle')}
        </AppText>
      </LinearGradient>

      {mockPlan ? (
        <View style={styles.perks}>
          <AppText variant="h3" color="text">
            {t('membership.perksIntro')}
          </AppText>
          {mockPlan.benefitKeys.map((key) => (
            <View key={key} style={styles.perkRow}>
              <Ionicons name="checkmark-circle" size={20} color={colors.accent} />
              <AppText variant="body" color="textSecondary" style={styles.perkTxt}>
                {t(key)}
              </AppText>
            </View>
          ))}
        </View>
      ) : null}

      <PrimaryButton title={t('membership.compareCta')} onPress={() => router.push('/membership/plans')} />
    </Screen>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    pad: { paddingTop: spacing.md, gap: spacing.lg },
    hero: {
      padding: spacing.xl,
      borderRadius: radii.xxl,
      borderWidth: 1,
      borderColor: colors.border,
      gap: spacing.sm,
    },
    heroIcon: { marginBottom: spacing.xs },
    perks: {
      padding: spacing.lg,
      borderRadius: radii.xl,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      gap: spacing.md,
    },
    perkRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
    perkTxt: { flex: 1, lineHeight: 22 },
  });
}
