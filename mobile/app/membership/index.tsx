import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/ui/AppText';
import { PrimaryButton } from '@/components/ui/Button';
import { DetailHeader } from '@/components/layout/DetailHeader';
import { Screen } from '@/components/layout/Screen';
import { useIntegrationMode } from '@/hooks/useIntegrationMode';
import { useTranslation } from '@/i18n/useTranslation';
import { useMockUser } from '@/hooks/useMockUser';
import { meMembershipApi } from '@/services/api/meMembershipApi';
import { ApiRequestError } from '@/services/api/http';
import { TIER_TO_PLAN_ID, getPlanById } from '@/services/mock';
import type { User } from '@/types';
import { dtoTierToUi } from '@/utils/meFeatureMappers';
import { formatDateShort } from '@/utils/format';
import { radii, spacing, useThemeColors } from '@/theme';
import type { ThemeColors } from '@/theme/palettes';
import type { MeMembershipResponseDto } from '@/services/api/types';

const TIER_LABEL_KEY: Record<User['membershipTier'], string> = {
  standard: 'membership.tierStandard',
  gold: 'membership.tierGold',
  platinum: 'membership.tierPlatinum',
};

export default function MembershipScreen() {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const { t, locale } = useTranslation();
  const { user } = useMockUser();
  const { api, authenticated, liveAccount } = useIntegrationMode();

  const [me, setMe] = useState<MeMembershipResponseDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMe = useCallback(async () => {
    if (!liveAccount) {
      setMe(null);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setMe(await meMembershipApi.get());
    } catch (e) {
      setMe(null);
      setError(e instanceof ApiRequestError ? e.message : t('membership.loadError'));
    } finally {
      setLoading(false);
    }
  }, [liveAccount, t]);

  useFocusEffect(
    useCallback(() => {
      void loadMe();
    }, [loadMe]),
  );

  const tier: User['membershipTier'] = me ? dtoTierToUi(me.membershipTier) : user.membershipTier;
  const planId = TIER_TO_PLAN_ID[tier];
  const mockPlan = getPlanById(planId);

  const benefitLines: string[] = useMemo(() => {
    if (me?.planBenefits && me.planBenefits.length > 0) return me.planBenefits;
    return [];
  }, [me?.planBenefits]);

  const showMockBenefits = benefitLines.length === 0 && mockPlan;

  return (
    <Screen scroll contentStyle={styles.pad}>
      <DetailHeader title={t('membership.title')} />
      {liveAccount && loading && !me && !error ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
          <AppText variant="caption" color="textMuted" style={{ marginTop: spacing.md }}>
            {t('common.loading')}
          </AppText>
        </View>
      ) : null}
      {liveAccount && error && !me ? (
        <AppText variant="body" color="error" style={styles.err}>
          {error}
        </AppText>
      ) : null}
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
        {me?.subscriptionStatus === 'ACTIVE' && me.renewsAt ? (
          <AppText variant="caption" color="textMuted" style={styles.renew}>
            {t('membership.renews')}: {formatDateShort(me.renewsAt, locale)}
          </AppText>
        ) : null}
        {me?.subscriptionStatus === 'CANCELLED' ? (
          <AppText variant="caption" color="warning" style={styles.renew}>
            {t('membership.statusCancelled')}
          </AppText>
        ) : null}
      </LinearGradient>

      {benefitLines.length > 0 ? (
        <View style={styles.perks}>
          <AppText variant="h3" color="text">
            {t('membership.perksIntro')}
          </AppText>
          {benefitLines.map((line, i) => (
            <View key={`${i}-${line.slice(0, 24)}`} style={styles.perkRow}>
              <Ionicons name="checkmark-circle" size={20} color={colors.accent} />
              <AppText variant="body" color="textSecondary" style={styles.perkTxt}>
                {line}
              </AppText>
            </View>
          ))}
        </View>
      ) : null}

      {showMockBenefits ? (
        <View style={styles.perks}>
          <AppText variant="h3" color="text">
            {t('membership.perksIntro')}
          </AppText>
          {mockPlan!.benefitKeys.map((key) => (
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
    center: { paddingVertical: 32, alignItems: 'center' },
    err: { marginBottom: spacing.sm },
    hero: {
      padding: spacing.xl,
      borderRadius: radii.xxl,
      borderWidth: 1,
      borderColor: colors.border,
      gap: spacing.sm,
    },
    heroIcon: { marginBottom: spacing.xs },
    renew: { marginTop: spacing.xs },
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
