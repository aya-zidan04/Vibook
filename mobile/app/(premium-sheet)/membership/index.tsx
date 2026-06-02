import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/ui/AppText';
import { HeroAmbientOverlay } from '@/components/ui/HeroAmbientOverlay';
import { PrimaryButton } from '@/components/ui/Button';
import { PremiumScreen } from '@/components/sheet/PremiumScreen';
import { createPremiumSheetStyles } from '@/components/sheet/premiumSheetStyles';
import { useTranslation } from '@/i18n/useTranslation';
import { useMockUser } from '@/hooks/useMockUser';
import { PREMIUM_PLAN } from '@/services/mock';
import { spacing, useThemeColors } from '@/theme';

export default function MembershipScreen() {
  const colors = useThemeColors();
  const styles = useMemo(() => createPremiumSheetStyles(colors), [colors]);
  const router = useRouter();
  const { t } = useTranslation();
  const { user } = useMockUser();

  return (
    <PremiumScreen title={t('membership.title')}>
      <View style={styles.hero}>
        <LinearGradient
          colors={[colors.iconContainerBg, 'transparent']}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
        <HeroAmbientOverlay />
        <View style={[styles.iconCircle, { alignSelf: 'flex-start', marginBottom: spacing.xs }]}>
          <Ionicons name="diamond-outline" size={28} color={colors.primaryLight} />
        </View>
        {user.isPremiumMember ? (
          <AppText variant="overline" color="primaryLight">
            {t('membership.currentLabel')}
          </AppText>
        ) : null}
        <AppText variant="h1" color="text">
          {t('membership.planName')}
        </AppText>
        <AppText variant="body" color="textSecondary">
          {t('membership.subtitle')}
        </AppText>
      </View>

      <View style={[styles.insetCard, { gap: spacing.md }]}>
        <AppText variant="h3" color="text">
          {t('membership.perksIntro')}
        </AppText>
        {PREMIUM_PLAN.benefitKeys.map((key) => (
          <View key={key} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm }}>
            <Ionicons name="checkmark-circle" size={20} color={colors.primaryLight} />
            <AppText variant="body" color="textSecondary" style={{ flex: 1, lineHeight: 22 }}>
              {t(key)}
            </AppText>
          </View>
        ))}
      </View>

      <PrimaryButton
        sheet
        title={user.isPremiumMember ? t('membership.manageCta') : t('membership.subscribeCta')}
        onPress={() => router.push('/membership/plans')}
      />
    </PremiumScreen>
  );
}
