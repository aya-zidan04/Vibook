import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, TextStyle, View } from 'react-native';
import { useNavigationContainerRef, useRouter } from 'expo-router';
import { AppText } from '@/components/ui/AppText';
import { useTranslation } from '@/i18n/useTranslation';
import { useAppStore } from '@/store/appStore';
import { hydrateAuthSession } from '@/bootstrap/hydrateAuthSession';
import { loadReferenceData } from '@/store/referenceStore';
import { Image } from 'expo-image';
import { spacing, useThemeColors } from '@/theme';
import type { ThemeColors } from '@/theme/palettes';

const SPLASH_MS = 2200;
const BRAND_LOGO = require('../assets/vibook-wordmark.png');

/**
 * First screen on cold start: brand splash, then `/entry` (welcome).
 * Tabs are only reached after Browse First, login, or signup — never from splash.
 */
export default function SplashScreen() {
  const router = useRouter();
  const navRef = useNavigationContainerRef();
  const { t, isRTL } = useTranslation();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const splashText = useMemo(() => splashHeroTextStyle(isRTL), [isRTL]);
  const [hydrated, setHydrated] = useState(() => useAppStore.persist.hasHydrated());

  useEffect(() => {
    const unsub = useAppStore.persist.onFinishHydration(() => setHydrated(true));
    return unsub;
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    void Promise.all([loadReferenceData(), hydrateAuthSession()]).catch(() => {
      /* individual loaders set their own error state */
    });
  }, [hydrated]);

  useEffect(() => {
    if (!hydrated) return;

    let splashTimer: ReturnType<typeof setTimeout> | undefined;
    let stateUnsub: (() => void) | undefined;

    const go = () => {
      if (!navRef.isReady()) return false;
      splashTimer = setTimeout(() => {
        router.replace('/entry');
      }, SPLASH_MS);
      return true;
    };

    if (!go()) {
      stateUnsub = navRef.addListener('state', () => {
        if (go()) {
          stateUnsub?.();
          stateUnsub = undefined;
        }
      });
    }

    return () => {
      stateUnsub?.();
      if (splashTimer) clearTimeout(splashTimer);
    };
  }, [hydrated, router, navRef]);

  return (
    <View style={styles.root}>
      <Image source={BRAND_LOGO} style={styles.brandLogo} contentFit="contain" accessibilityIgnoresInvertColors />
      <AppText variant="display" color="text" style={[styles.brand, splashText.title]}>
        {t('common.brandDisplay')}
      </AppText>
      <AppText variant="body-lg" color="textSecondary" style={[styles.tag, splashText.subtitle]}>
        {t('common.splashTagline')}
      </AppText>
      <ActivityIndicator color={colors.primary} size="large" style={styles.loader} />
    </View>
  );
}

function splashHeroTextStyle(isRTL: boolean): { title: TextStyle; subtitle: TextStyle } {
  const direction: TextStyle = isRTL ? { writingDirection: 'rtl' } : { writingDirection: 'ltr' };
  return {
    title: {
      width: '100%',
      maxWidth: '100%',
      textAlign: 'center',
      fontSize: 38,
      fontWeight: '800',
      lineHeight: 50,
      letterSpacing: 0,
      ...direction,
    },
    subtitle: {
      width: '100%',
      maxWidth: '100%',
      textAlign: 'center',
      fontSize: 18,
      lineHeight: 28,
      letterSpacing: 0,
      ...direction,
    },
  };
}

function createStyles(_colors: ThemeColors) {
  return StyleSheet.create({
    root: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: spacing.xxl,
      width: '100%',
    },
    brandLogo: {
      width: 112,
      height: 112,
      marginBottom: spacing.lg,
    },
    brand: {
      marginBottom: spacing.md,
    },
    tag: {
      marginBottom: spacing.xxl,
    },
    loader: {
      marginTop: spacing.md,
    },
  });
}
