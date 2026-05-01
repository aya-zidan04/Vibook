import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/layout/Screen';
import { AppText } from '@/components/ui/AppText';
import { PrimaryButton, SecondaryButton } from '@/components/ui/Button';
import { useTranslation } from '@/i18n/useTranslation';
import { radii, spacing, useThemeColors } from '@/theme';
import type { ThemeColors } from '@/theme/palettes';

const BRAND_LOGO = require('../../assets/vibook-wordmark.png');

/**
 * Optional auth-adjacent welcome (e.g. deep links). Primary first-run experience is `/entry`.
 */
export default function WelcomeScreen() {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <Screen edges={['top', 'bottom', 'left', 'right']}>
      <LinearGradient colors={[colors.background, colors.backgroundElevated]} style={styles.gradient}>
        <View style={styles.content}>
          <Image source={BRAND_LOGO} style={styles.logo} contentFit="contain" accessibilityIgnoresInvertColors />
          <AppText variant="display" color="text" style={styles.title}>
            {t('common.brandDisplay')}
          </AppText>
          <AppText variant="body" color="textSecondary" style={styles.sub}>
            {t('welcome.subtitle')}
          </AppText>
          <PrimaryButton title={t('welcome.continue')} onPress={() => router.replace('/(tabs)/explore' as never)} />
          <SecondaryButton title={t('entry.loginSignup')} onPress={() => router.push('/login')} />
        </View>
      </LinearGradient>
    </Screen>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    gradient: {
      flex: 1,
      borderRadius: radii.xxl,
      margin: spacing.md,
      overflow: 'hidden',
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: spacing.screen,
      gap: spacing.lg,
    },
    logo: {
      width: 96,
      height: 96,
      alignSelf: 'center',
    },
    title: { textAlign: 'center' },
    sub: {
      lineHeight: 24,
      textAlign: 'center',
      marginBottom: spacing.sm,
    },
  });
}
