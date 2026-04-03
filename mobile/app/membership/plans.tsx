import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/ui/AppText';
import { PrimaryButton, SecondaryButton } from '@/components/ui/Button';
import { DetailHeader } from '@/components/layout/DetailHeader';
import { Screen } from '@/components/layout/Screen';
import { useIntegrationMode } from '@/hooks/useIntegrationMode';
import { useFormatMoney } from '@/hooks/useFormatMoney';
import { useTranslation } from '@/i18n/useTranslation';
import { useMockUser } from '@/hooks/useMockUser';
import { mapUserResponseToUser } from '@/services/auth/mapUser';
import { userApi } from '@/services/auth/userApi';
import { membershipPlansApi } from '@/services/api/membershipPlansApi';
import { meMembershipApi } from '@/services/api/meMembershipApi';
import { ApiRequestError } from '@/services/api/http';
import type { MeMembershipResponseDto, MembershipPlanResponseDto } from '@/services/api/types';
import {
  MEMBERSHIP_PLANS,
  TIER_TO_PLAN_ID,
  type MembershipPlan,
  type MembershipPlanId,
} from '@/services/mock';
import { useSessionStore } from '@/store/sessionStore';
import {
  dtoTierRank,
  estimatedYearlyFromMonthlyMonthly,
  toNum,
  uiTierRank,
} from '@/utils/meFeatureMappers';
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
  const { t, locale } = useTranslation();
  const { formatMoney } = useFormatMoney();
  const [yearly, setYearly] = useState(false);
  const { user } = useMockUser();
  const { api, authenticated, liveAccount } = useIntegrationMode();

  const [apiPlans, setApiPlans] = useState<MembershipPlanResponseDto[] | null>(null);
  const [plansLoading, setPlansLoading] = useState(false);
  const [plansError, setPlansError] = useState<string | null>(null);
  const [meMembership, setMeMembership] = useState<MeMembershipResponseDto | null>(null);
  const [subscribeBusyId, setSubscribeBusyId] = useState<number | null>(null);

  useEffect(() => {
    if (!api) {
      setApiPlans(null);
      setPlansError(null);
      return;
    }
    let c = false;
    setPlansLoading(true);
    setPlansError(null);
    membershipPlansApi
      .list()
      .then((r) => {
        if (!c) setApiPlans(r.plans);
      })
      .catch(() => {
        if (!c) {
          setApiPlans([]);
          setPlansError(t('membership.plansLoadError'));
        }
      })
      .finally(() => {
        if (!c) setPlansLoading(false);
      });
    return () => {
      c = true;
    };
  }, [api, t]);

  useEffect(() => {
    if (!liveAccount) {
      setMeMembership(null);
      return;
    }
    let c = false;
    meMembershipApi
      .get()
      .then((m) => {
        if (!c) setMeMembership(m);
      })
      .catch(() => {
        if (!c) setMeMembership(null);
      });
    return () => {
      c = true;
    };
  }, [api, liveAccount]);

  const currentMockId = TIER_TO_PLAN_ID[user.membershipTier];
  const currentMockRank = RANK[currentMockId];

  const onMockPlanAction = () => {
    Alert.alert(t('membership.mockTitle'), t('membership.mockBody'));
  };

  const refreshMembership = useCallback(async () => {
    const m = await meMembershipApi.get();
    setMeMembership(m);
    const dto = await userApi.getMe();
    useSessionStore.getState().setServerUser(mapUserResponseToUser(dto));
  }, []);

  const onApiSubscribe = (plan: MembershipPlanResponseDto) => {
    if (!authenticated) {
      Alert.alert(t('membership.signInTitle'), t('membership.signInBody'));
      return;
    }
    Alert.alert(t('membership.subscribeConfirmTitle'), t('membership.subscribeConfirmBody'), [
      { text: t('common.back'), style: 'cancel' },
      {
        text: t('membership.subscribe'),
        onPress: () => void doSubscribe(plan),
      },
    ]);
  };

  const doSubscribe = async (plan: MembershipPlanResponseDto) => {
    setSubscribeBusyId(plan.id);
    try {
      await meMembershipApi.subscribe({
        planId: plan.id,
        paymentReference: 'MOCK_SUBSCRIBE',
      });
      await refreshMembership();
      Alert.alert(t('membership.subscribeSuccessTitle'), t('membership.subscribeSuccessBody'));
    } catch (e) {
      const msg = e instanceof ApiRequestError ? e.message : t('membership.subscribeError');
      Alert.alert(t('common.error'), msg);
    } finally {
      setSubscribeBusyId(null);
    }
  };

  if (api && plansLoading && (apiPlans == null || apiPlans.length === 0) && !plansError) {
    return (
      <Screen scroll contentStyle={styles.pad}>
        <DetailHeader title={t('membership.plansTitle')} />
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
          <AppText variant="caption" color="textMuted" style={{ marginTop: spacing.md }}>
            {t('common.loading')}
          </AppText>
        </View>
      </Screen>
    );
  }

  if (api && plansError && (apiPlans == null || apiPlans.length === 0)) {
    return (
      <Screen scroll contentStyle={styles.pad}>
        <DetailHeader title={t('membership.plansTitle')} />
        <AppText variant="body" color="error">
          {plansError}
        </AppText>
      </Screen>
    );
  }

  if (!api) {
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
          {MEMBERSHIP_PLANS.map((plan) => (
            <MockPlanCard
              key={plan.id}
              plan={plan}
              yearly={yearly}
              currentMockRank={currentMockRank}
              currentMockId={currentMockId}
              colors={colors}
              styles={styles}
              t={t}
              formatMoney={formatMoney}
              onPlanAction={onMockPlanAction}
            />
          ))}
        </View>

        <SecondaryButton title={t('common.back')} onPress={() => router.back()} />
      </Screen>
    );
  }

  const apiPlansList = apiPlans ?? [];

  if (apiPlansList.length === 0) {
    return (
      <Screen scroll contentStyle={styles.pad}>
        <DetailHeader title={t('membership.plansTitle')} />
        <AppText variant="body" color="textSecondary">
          {t('membership.plansEmpty')}
        </AppText>
        <SecondaryButton title={t('common.back')} onPress={() => router.back()} />
      </Screen>
    );
  }

  return (
    <Screen scroll contentStyle={styles.pad}>
      <DetailHeader title={t('membership.plansTitle')} />
      <AppText variant="body" color="textSecondary" style={styles.intro}>
        {t('membership.plansSubtitle')}
      </AppText>
      <AppText variant="caption" color="textMuted" style={styles.apiYearlyNote}>
        {t('membership.yearlyFromApiHint')}
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
            {t('membership.yearlyEstimateHint')}
          </AppText>
        </Pressable>
      </View>

      <View style={styles.cards}>
        {apiPlansList.map((plan) => {
          const monthly = toNum(plan.priceMonthly);
          const yearlyPrice = estimatedYearlyFromMonthlyMonthly(monthly);
          const price = yearly ? yearlyPrice : monthly;
          const period = yearly ? `/ ${t('membership.billingYearly')}` : `/ ${t('membership.billingMonthly')}`;
          const rank = dtoTierRank(plan.tier);
          const currentRank = uiTierRank(user.membershipTier);
          const isCurrent =
            meMembership?.subscriptionStatus === 'ACTIVE' &&
            meMembership.planId != null &&
            meMembership.planId === plan.id;
          const isHigher = rank > currentRank;
          const isLower = rank < currentRank;

          let ctaTitle = t('membership.subscribe');
          if (isCurrent) ctaTitle = t('membership.currentPlan');
          else if (isHigher) ctaTitle = t('membership.upgrade');
          else if (isLower) ctaTitle = t('membership.downgrade');

          const name = locale === 'ar' && plan.nameAr ? plan.nameAr : plan.nameEn;
          const cur = plan.currency?.toUpperCase() === 'JOD' ? 'JOD' : 'USD';

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
                  {name}
                </AppText>
                <View style={styles.priceRow}>
                  <AppText variant="price" color="accent">
                    {formatMoney(price, cur)}
                  </AppText>
                  <AppText variant="caption" color="textMuted">
                    {period}
                  </AppText>
                </View>
              </View>
              <View style={styles.benefits}>
                {plan.benefits.map((line, bi) => (
                  <View key={`${plan.id}-${bi}`} style={styles.benefitRow}>
                    <Ionicons name="checkmark-done" size={18} color={colors.accent} />
                    <AppText variant="body" color="textSecondary" style={styles.benefitTxt}>
                      {line}
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
                  loading={subscribeBusyId === plan.id}
                  onPress={() => onApiSubscribe(plan)}
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

function MockPlanCard({
  plan,
  yearly,
  currentMockRank,
  currentMockId,
  colors,
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
  styles: ReturnType<typeof createStyles>;
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
        <PrimaryButton title={ctaTitle} onPress={() => onPlanAction(plan)} style={styles.cta} />
      )}
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    pad: { paddingTop: spacing.md, gap: spacing.lg },
    center: { paddingVertical: 40, alignItems: 'center' },
    intro: { lineHeight: 22 },
    apiYearlyNote: { lineHeight: 18 },
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
