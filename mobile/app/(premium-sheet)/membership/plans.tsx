import { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/ui/AppText';
import { PrimaryButton, SecondaryButton } from '@/components/ui/Button';
import { PremiumScreen } from '@/components/sheet/PremiumScreen';
import { createPremiumSheetStyles } from '@/components/sheet/premiumSheetStyles';
import { useFormatMoney } from '@/hooks/useFormatMoney';
import { useTranslation } from '@/i18n/useTranslation';
import { useMockUser } from '@/hooks/useMockUser';
import {
  MEMBERSHIP_PLANS,
  TIER_TO_PLAN_ID,
  type MembershipPlan,
  type MembershipPlanId,
} from '@/services/mock';
import { radii, spacing, useThemeColors } from '@/theme';
import type { ThemeColors } from '@/theme/palettes';

const RANK: Record<MembershipPlanId, number> = {
  basic: 0,
  premium: 1,
};

function planNameKey(id: MembershipPlanId): string {
  return id === 'premium' ? 'membership.plan.premium' : 'membership.plan.basic';
}

export default function MembershipPlansScreen() {
  const colors = useThemeColors();
  const sheetStyles = useMemo(() => createPremiumSheetStyles(colors), [colors]);
  const styles = useMemo(() => createPlanStyles(colors), [colors]);
  const router = useRouter();
  const { t } = useTranslation();
  const { formatMoney } = useFormatMoney();
  const [yearly, setYearly] = useState(false);
  const { user } = useMockUser();

  const currentMockId = TIER_TO_PLAN_ID[user.membershipTier];
  const currentMockRank = RANK[currentMockId];

  const onMockPlanAction = () => {
    Alert.alert(t('membership.mockTitle'), t('membership.mockBody'));
  };

  return (
    <PremiumScreen title={t('membership.plansTitle')}>
      <AppText variant="body" color="textSecondary" style={{ lineHeight: 22 }}>
        {t('membership.plansSubtitle')}
      </AppText>

      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        <Pressable
          onPress={() => setYearly(false)}
          style={[sheetStyles.billingChip, !yearly && sheetStyles.billingChipOn]}
        >
          <AppText variant="body-em" color={!yearly ? 'text' : 'textMuted'}>
            {t('membership.billingMonthly')}
          </AppText>
        </Pressable>
        <Pressable
          onPress={() => setYearly(true)}
          style={[sheetStyles.billingChip, yearly && sheetStyles.billingChipOn]}
        >
          <AppText variant="body-em" color={yearly ? 'text' : 'textMuted'}>
            {t('membership.billingYearly')}
          </AppText>
          <AppText variant="caption" color="accent" style={{ marginTop: 2 }}>
            {t('membership.yearlyHint')}
          </AppText>
        </Pressable>
      </View>

      <View style={{ gap: spacing.xl, paddingVertical: spacing.xs }}>
        {MEMBERSHIP_PLANS.map((plan) => (
          <MockPlanCard
            key={plan.id}
            plan={plan}
            yearly={yearly}
            currentMockRank={currentMockRank}
            currentMockId={currentMockId}
            colors={colors}
            sheetStyles={sheetStyles}
            styles={styles}
            t={t}
            formatMoney={formatMoney}
            onPlanAction={onMockPlanAction}
          />
        ))}
      </View>

      <SecondaryButton sheet title={t('common.back')} onPress={() => router.back()} />
    </PremiumScreen>
  );
}

function MockPlanCard({
  plan,
  yearly,
  currentMockRank,
  currentMockId,
  colors,
  sheetStyles,
  styles,
  t,
  formatMoney,
  onPlanAction,
}: {
  plan: MembershipPlan;
  yearly: boolean;
  currentMockRank: number;
  currentMockId: MembershipPlanId;
  colors: ThemeColors;
  sheetStyles: ReturnType<typeof createPremiumSheetStyles>;
  styles: ReturnType<typeof createPlanStyles>;
  t: (k: string) => string;
  formatMoney: (n: number, c: string) => string;
  onPlanAction: (plan: MembershipPlan) => void;
}) {
  const price = yearly ? plan.priceYearly : plan.priceMonthly;
  const period = yearly ? `/ ${t('membership.billingYearly')}` : `/ ${t('membership.billingMonthly')}`;
  const rank = RANK[plan.id];
  const isCurrent = plan.id === currentMockId;
  const isHigher = rank > currentMockRank;
  const isLower = rank < currentMockRank;

  let ctaTitle = t('membership.subscribe');
  if (isCurrent) ctaTitle = t('membership.currentPlan');
  else if (isHigher) ctaTitle = t('membership.upgrade');
  else if (isLower) ctaTitle = t('membership.downgrade');

  return (
    <View
      style={[
        sheetStyles.planCard,
        plan.recommended && styles.cardRecommended,
        isCurrent && styles.cardCurrent,
      ]}
    >
      {plan.recommended ? (
        <View style={styles.bestBadge}>
          <AppText variant="label" color="text" style={styles.bestBadgeTxt}>
            {t('membership.bestValue')}
          </AppText>
        </View>
      ) : null}
      <View style={{ gap: spacing.xs }}>
        <AppText variant="h2" color="text">
          {t(planNameKey(plan.id))}
        </AppText>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm, flexWrap: 'wrap' }}>
          <AppText variant="h3" color="accent">
            {formatMoney(price, plan.currency)}
          </AppText>
          <AppText variant="caption" color="textMuted">
            {period}
          </AppText>
        </View>
      </View>
      <View style={{ gap: spacing.sm }}>
        {plan.benefitKeys.map((key) => (
          <View key={key} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm }}>
            <Ionicons name="checkmark-done" size={18} color={colors.accent} />
            <AppText variant="body" color="textSecondary" style={{ flex: 1, lineHeight: 22 }}>
              {t(key)}
            </AppText>
          </View>
        ))}
      </View>
      {isCurrent ? (
        <View style={styles.currentPill}>
          <AppText variant="body-em" color="accent">
            {ctaTitle}
          </AppText>
        </View>
      ) : (
        <PrimaryButton sheet title={ctaTitle} onPress={() => onPlanAction(plan)} style={{ marginTop: spacing.sm }} />
      )}
    </View>
  );
}

function createPlanStyles(colors: ThemeColors) {
  return StyleSheet.create({
    cardRecommended: {
      borderColor: colors.primary,
      borderWidth: 2,
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
    bestBadgeTxt: { letterSpacing: 0.6 },
    currentPill: {
      marginTop: spacing.sm,
      paddingVertical: 14,
      borderRadius: radii.full,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.accent,
      alignItems: 'center',
      backgroundColor: colors.accentMuted,
      minHeight: 58,
      justifyContent: 'center',
    },
  });
}
