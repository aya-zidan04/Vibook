import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Redirect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/ui/AppText';
import { HeroAmbientOverlay } from '@/components/ui/HeroAmbientOverlay';
import { PrimaryButton } from '@/components/ui/Button';
import { DetailHeader } from '@/components/layout/DetailHeader';
import { Screen } from '@/components/layout/Screen';
import { useTranslation } from '@/i18n/useTranslation';
import { useBusinessHubStore } from '@/store/businessHubStore';
import { createShadows, radii, spacing, useThemeColors, useThemeGradients } from '@/theme';
import type { ThemeColors } from '@/theme/palettes';

const BENEFIT_ICONS = ['people-outline', 'trending-up-outline', 'megaphone-outline'] as const;

export default function BusinessIntroScreen() {
  const colors = useThemeColors();
  const gradients = useThemeGradients();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const { t } = useTranslation();
  const applicationStatus = useBusinessHubStore((s) => s.applicationStatus);

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
      <View style={styles.hero}>
        <LinearGradient
          colors={[...gradients.hero]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
        <HeroAmbientOverlay />
        <AppText variant="overline" color="accentText">
          {t('business.kicker')}
        </AppText>
        <AppText variant="h1" color="text" style={styles.headline}>
          {t('business.headline')}
        </AppText>
        <AppText variant="body" color="textSecondary">
          {t('business.body')}
        </AppText>
      </View>

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
    </Screen>
  );
}

function createStyles(colors: ThemeColors) {
  const sh = createShadows(colors);
  return StyleSheet.create({
    pad: { paddingTop: spacing.md, gap: spacing.lg, paddingBottom: spacing.xxxl },
    hero: {
      padding: spacing.xl,
      borderRadius: radii.xl,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.accentBorder,
      overflow: 'hidden',
      gap: spacing.sm,
      ...sh.sm,
    },
    headline: { lineHeight: 34 },
    grid: { gap: spacing.md },
    benefitCard: {
      padding: spacing.lg,
      borderRadius: radii.xl,
      backgroundColor: colors.card,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      gap: spacing.sm,
      ...sh.md,
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
  });
}
