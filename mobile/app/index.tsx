import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { AppText } from '@/components/ui/AppText';
import { useTranslation } from '@/i18n/useTranslation';
import { useAppStore } from '@/store/appStore';
import { Image } from 'expo-image';
import { spacing, useThemeColors } from '@/theme';
import type { ThemeColors } from '@/theme/palettes';

const SPLASH_MS = 2200;
const BRAND_LOGO = require('../assets/icon.png');

/**
 * First screen on cold start: brand splash, then entry (welcome carousel) or main tabs.
 */
export default function SplashScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [hydrated, setHydrated] = useState(() => useAppStore.persist.hasHydrated());

  useEffect(() => {
    const unsub = useAppStore.persist.onFinishHydration(() => setHydrated(true));
    return unsub;
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const done = useAppStore.getState().hasCompletedOnboarding;
    if (!done) {
      router.replace('/entry');
      return;
    }
    const id = setTimeout(() => {
      router.replace('/(tabs)/explore');
    }, SPLASH_MS);
    return () => clearTimeout(id);
  }, [hydrated, router]);

  return (
    <LinearGradient
      colors={[colors.background, colors.backgroundElevated, colors.background]}
      style={styles.root}
    >
      <Image source={BRAND_LOGO} style={styles.brandLogo} contentFit="contain" accessibilityIgnoresInvertColors />
      <AppText variant="display" color="text" style={styles.brand}>
        {t('common.brandDisplay')}
      </AppText>
      <AppText variant="body" color="textMuted" style={styles.tag}>
        {t('common.splashTagline')}
      </AppText>
      <ActivityIndicator color={colors.primary} size="large" style={styles.loader} />
    </LinearGradient>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    root: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: spacing.xxl,
    },
    brandLogo: {
      width: 112,
      height: 112,
      marginBottom: spacing.lg,
    },
    brand: {
      marginBottom: spacing.sm,
    },
    tag: {
      textAlign: 'center',
      marginBottom: spacing.xxl,
    },
    loader: {
      marginTop: spacing.md,
    },
  });
}
