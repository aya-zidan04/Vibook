import { useMemo } from 'react';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/ui/AppText';
import { PrimaryButton } from '@/components/ui/Button';
import { PremiumScreen } from '@/components/sheet/PremiumScreen';
import { createPremiumSheetStyles } from '@/components/sheet/premiumSheetStyles';
import { useTranslation } from '@/i18n/useTranslation';
import { useMockUser } from '@/hooks/useMockUser';
import { TIER_TO_PLAN_ID, getPlanById } from '@/services/mock';
import type { User } from '@/types';
import { spacing, useThemeColors } from '@/theme';

const TIER_LABEL_KEY: Record<User['membershipTier'], string> = {
  standard: 'membership.tierStandard',
  gold: 'membership.tierGold',
  platinum: 'membership.tierPlatinum',
};

export default function MembershipScreen() {
  const colors = useThemeColors();
  const styles = useMemo(() => createPremiumSheetStyles(colors), [colors]);
  const router = useRouter();
  const { t } = useTranslation();
  const { user } = useMockUser();

  const tier = user.membershipTier;
  const planId = TIER_TO_PLAN_ID[tier];
  const mockPlan = getPlanById(planId);

  return (
    <PremiumScreen title={t('membership.title')}>
      <LinearGradient colors={[colors.primaryMuted, 'transparent']} style={styles.hero}>
        <View style={[styles.iconCircle, { alignSelf: 'flex-start', marginBottom: spacing.xs }]}>
          <Ionicons name="diamond-outline" size={28} color={colors.accent} />
        </View>
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
        <View style={[styles.insetCard, { gap: spacing.md }]}>
          <AppText variant="h3" color="text">
            {t('membership.perksIntro')}
          </AppText>
          {mockPlan.benefitKeys.map((key) => (
            <View key={key} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm }}>
              <Ionicons name="checkmark-circle" size={20} color={colors.accent} />
              <AppText variant="body" color="textSecondary" style={{ flex: 1, lineHeight: 22 }}>
                {t(key)}
              </AppText>
            </View>
          ))}
        </View>
      ) : null}

      <PrimaryButton sheet title={t('membership.compareCta')} onPress={() => router.push('/membership/plans')} />
    </PremiumScreen>
  );
}
