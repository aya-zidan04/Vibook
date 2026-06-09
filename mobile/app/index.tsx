import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, TextStyle, View } from 'react-native';
import { useNavigationContainerRef, useRouter } from 'expo-router';
import { AppText } from '@/components/ui/AppText';
import { useTranslation } from '@/i18n/useTranslation';
import { useAppStore } from '@/store/appStore';
import { hydrateAuthSession } from '@/bootstrap/hydrateAuthSession';
import { resolveInitialRoute } from '@/bootstrap/resolveInitialRoute';
import { loadReferenceData } from '@/store/referenceStore';
import { VibookLogoMark } from '@/components/branding/VibookLogoMark';
import { spacing, useThemeColors } from '@/theme';
import type { ThemeColors } from '@/theme/palettes';

const SPLASH_MS = 2200;

/**
 * Cold start: brand splash, hydrate persisted app state + AsyncStorage tokens, then route to
 * main tabs when a persisted access token exists, or `/entry` for guests and after logout.
 */
export default function SplashScreen() {
  const router = useRouter();
  const navRef = useNavigationContainerRef();
  const { t, isRTL } = useTranslation();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const splashText = useMemo(() => splashHeroTextStyle(isRTL), [isRTL]);
  const [hydrated, setHydrated] = useState(() => useAppStore.persist.hasHydrated());
  const [bootstrapDone, setBootstrapDone] = useState(false);
  const [splashElapsed, setSplashElapsed] = useState(false);

  useEffect(() => {
    const unsub = useAppStore.persist.onFinishHydration(() => setHydrated(true));
    return unsub;
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    void Promise.all([loadReferenceData(), hydrateAuthSession()])
      .catch(() => {
        /* individual loaders set their own error state */
      })
      .finally(() => setBootstrapDone(true));
  }, [hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    const splashTimer = setTimeout(() => setSplashElapsed(true), SPLASH_MS);
    return () => clearTimeout(splashTimer);
  }, [hydrated]);

  useEffect(() => {
    if (!hydrated || !bootstrapDone || !splashElapsed) return;

    let stateUnsub: (() => void) | undefined;

    const go = () => {
      if (!navRef.isReady()) return false;
      router.replace(resolveInitialRoute());
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
    };
  }, [hydrated, bootstrapDone, splashElapsed, router, navRef]);

  return (
    <View style={styles.root}>
      <VibookLogoMark size={112} style={styles.brandLogo} accessibilityLabel={t('common.brandDisplay')} />
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
