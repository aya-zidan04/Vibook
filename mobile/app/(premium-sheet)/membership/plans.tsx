import { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/ui/AppText';
import { PrimaryButton } from '@/components/ui/Button';
import { PremiumScreen } from '@/components/sheet/PremiumScreen';
import { createPremiumSheetStyles } from '@/components/sheet/premiumSheetStyles';
import { useFormatMoney } from '@/hooks/useFormatMoney';
import { useTranslation } from '@/i18n/useTranslation';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { PREMIUM_PLAN } from '@/constants/premiumPlan';
import { radii, spacing, useThemeColors } from '@/theme';
import type { ThemeColors } from '@/theme/palettes';

export default function MembershipPlansScreen() {
  const colors = useThemeColors();
  const sheetStyles = useMemo(() => createPremiumSheetStyles(colors), [colors]);
  const styles = useMemo(() => createPlanStyles(colors), [colors]);
  const { t } = useTranslation();
  const { formatMoney } = useFormatMoney();
  const [yearly, setYearly] = useState(false);
  const { user } = useCurrentUser();

  const price = yearly ? PREMIUM_PLAN.priceYearly : PREMIUM_PLAN.priceMonthly;
  const period = yearly ? `/ ${t('membership.billingYearly')}` : `/ ${t('membership.billingMonthly')}`;
  const isPremium = user.isPremiumMember;

  const onSubscribe = () => {
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
          <AppText variant="caption" color="primaryLight" style={{ marginTop: 2 }}>
            {t('membership.yearlyHint')}
          </AppText>
        </Pressable>
      </View>

      <View style={[sheetStyles.planCard, styles.premiumCard]}>
        <AppText variant="h2" color="text">
          {t('membership.planName')}
        </AppText>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm, flexWrap: 'wrap' }}>
          <AppText variant="h3" color="primaryLight">
            {formatMoney(price, PREMIUM_PLAN.currency)}
          </AppText>
          <AppText variant="caption" color="textMuted">
            {period}
          </AppText>
        </View>
        <View style={{ gap: spacing.sm }}>
          {PREMIUM_PLAN.benefitKeys.map((key) => (
            <View key={key} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm }}>
              <Ionicons name="checkmark-done" size={18} color={colors.primaryLight} />
              <AppText variant="body" color="textSecondary" style={{ flex: 1, lineHeight: 22 }}>
                {t(key)}
              </AppText>
            </View>
          ))}
        </View>
        {isPremium ? (
          <View style={styles.currentPill}>
            <AppText variant="body-em" color="primaryLight">
              {t('membership.currentPlan')}
            </AppText>
          </View>
        ) : (
          <PrimaryButton
            sheet
            title={t('membership.subscribe')}
            onPress={onSubscribe}
            style={{ marginTop: spacing.sm }}
          />
        )}
      </View>
    </PremiumScreen>
  );
}

function createPlanStyles(colors: ThemeColors) {
  return StyleSheet.create({
    premiumCard: {
      borderColor: colors.primary,
      borderWidth: 2,
      gap: spacing.lg,
    },
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
