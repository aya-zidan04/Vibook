import { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/ui/AppText';
import { PrimaryButton, SecondaryButton } from '@/components/ui/Button';
import { DetailHeader } from '@/components/layout/DetailHeader';
import { Screen } from '@/components/layout/Screen';
import { useFormatMoney } from '@/hooks/useFormatMoney';
import { useTranslation } from '@/i18n/useTranslation';
import { CURRENT_USER } from '@/mock';
import {
  MEMBERSHIP_PLANS,
  TIER_TO_PLAN_ID,
  type MembershipPlan,
  type MembershipPlanId,
} from '@/mock/membershipPlans';
import { radii, spacing, useThemeColors } from '@/theme';
import type { ThemeColors } from '@/theme/palettes';

const RANK: Record<MembershipPlanId, number> = {
  basic: 0,
  premium: 1,
  vip: 2,
};

function planNameKey(id: MembershipPlanId): string {
  switch (id) {
    case 'basic':
      return 'membership.plan.basic';
    case 'premium':
      return 'membership.plan.premium';
    case 'vip':
      return 'membership.plan.vip';
    default:
      return 'membership.plan.basic';
  }
}

export default function MembershipPlansScreen() {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const { t } = useTranslation();
  const { formatMoney } = useFormatMoney();
  const [yearly, setYearly] = useState(false);

  const currentId = TIER_TO_PLAN_ID[CURRENT_USER.membershipTier];
  const currentRank = RANK[currentId];

  const onPlanAction = (plan: MembershipPlan) => {
    Alert.alert(t('membership.mockTitle'), t('membership.mockBody'));
  };

  return (
    <Screen scroll contentStyle={styles.pad}>
      <DetailHeader title={t('membership.plansTitle')} />
      <AppText variant="body" color="textSecondary" style={styles.intro}>
        {t('membership.plansSubtitle')}
      </AppText>

      <View style={styles.billingRow}>
        <Pressable
          onPress={() => setYearly(false)}
          style={[styles.billingChip, !yearly && styles.billingChipOn]}
        >
          <AppText variant="bodyMedium" color={!yearly ? 'text' : 'textMuted'}>
            {t('membership.billingMonthly')}
          </AppText>
        </Pressable>
        <Pressable
          onPress={() => setYearly(true)}
          style={[styles.billingChip, yearly && styles.billingChipOn]}
        >
          <AppText variant="bodyMedium" color={yearly ? 'text' : 'textMuted'}>
            {t('membership.billingYearly')}
          </AppText>
          <AppText variant="caption" color="accent" style={styles.yearlyHint}>
            {t('membership.yearlyHint')}
          </AppText>
        </Pressable>
      </View>

      <View style={styles.cards}>
        {MEMBERSHIP_PLANS.map((plan) => {
          const price = yearly ? plan.priceYearly : plan.priceMonthly;
          const period = yearly ? `/ ${t('membership.billingYearly')}` : `/ ${t('membership.billingMonthly')}`;
          const rank = RANK[plan.id];
          const isCurrent = plan.id === currentId;
          const isHigher = rank > currentRank;
          const isLower = rank < currentRank;

          let ctaTitle = t('membership.subscribe');
          if (isCurrent) ctaTitle = t('membership.currentPlan');
          else if (isHigher) ctaTitle = t('membership.upgrade');
          else if (isLower) ctaTitle = t('membership.downgrade');

          return (
            <View
              key={plan.id}
              style={[
                styles.card,
                plan.recommended && styles.cardRecommended,
                isCurrent && styles.cardCurrent,
              ]}
            >
              {plan.recommended ? (
                <View style={styles.bestBadge}>
                  <AppText variant="meta" color="text" style={styles.bestBadgeTxt}>
                    {t('membership.bestValue')}
                  </AppText>
                </View>
              ) : null}
              <View style={styles.cardHead}>
                <AppText variant="h2" color="text">
                  {t(planNameKey(plan.id))}
                </AppText>
                <View style={styles.priceRow}>
                  <AppText variant="price" color="accent">
                    {formatMoney(price, plan.currency)}
                  </AppText>
                  <AppText variant="caption" color="textMuted">
                    {period}
                  </AppText>
                </View>
              </View>
              <View style={styles.benefits}>
                {plan.benefitKeys.map((key) => (
                  <View key={key} style={styles.benefitRow}>
                    <Ionicons name="checkmark-done" size={18} color={colors.accent} />
                    <AppText variant="body" color="textSecondary" style={styles.benefitTxt}>
                      {t(key)}
                    </AppText>
                  </View>
                ))}
              </View>
              {isCurrent ? (
                <View style={styles.currentPill}>
                  <AppText variant="bodyMedium" color="accent">
                    {ctaTitle}
                  </AppText>
                </View>
              ) : (
                <PrimaryButton
                  title={ctaTitle}
                  onPress={() => onPlanAction(plan)}
                  style={styles.cta}
                />
              )}
            </View>
          );
        })}
      </View>

      <SecondaryButton title={t('common.back')} onPress={() => router.back()} />
    </Screen>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
  pad: { paddingTop: spacing.md, gap: spacing.lg },
  intro: { lineHeight: 22 },
  billingRow: { flexDirection: 'row', gap: spacing.sm },
  billingChip: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    gap: 2,
  },
  billingChipOn: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryMuted,
  },
  yearlyHint: { marginTop: 2 },
  cards: { gap: spacing.lg },
  card: {
    padding: spacing.lg,
    borderRadius: radii.xxl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.backgroundElevated,
    gap: spacing.md,
  },
  cardRecommended: {
    borderColor: colors.primary,
    borderWidth: 2,
    shadowColor: colors.glowPrimary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
  },
  cardCurrent: {
    borderColor: colors.accent,
  },
  bestBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.xs,
  },
  bestBadgeTxt: { fontWeight: '700', fontSize: 10, letterSpacing: 0.6 },
  cardHead: { gap: spacing.xs },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm, flexWrap: 'wrap' },
  benefits: { gap: spacing.sm },
  benefitRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  benefitTxt: { flex: 1, lineHeight: 22 },
  cta: { marginTop: spacing.sm },
  currentPill: {
    marginTop: spacing.sm,
    paddingVertical: 14,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.accent,
    alignItems: 'center',
    backgroundColor: colors.accentMuted,
  },
});

}
