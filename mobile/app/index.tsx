import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
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
 * First screen on cold start: brand splash, then entry (welcome carousel) or main tabs.
 */
export default function SplashScreen() {
  const router = useRouter();
  const navRef = useNavigationContainerRef();
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
      const done = useAppStore.getState().hasCompletedOnboarding;
      if (!done) {
        router.replace('/entry');
        return true;
      }
      splashTimer = setTimeout(() => {
        router.replace('/(tabs)/explore');
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
      <AppText variant="display" color="text" style={styles.brand}>
        {t('common.brandDisplay')}
      </AppText>
      <AppText variant="body" color="textSecondary" style={styles.tag}>
        {t('common.splashTagline')}
      </AppText>
      <ActivityIndicator color={colors.primary} size="large" style={styles.loader} />
    </View>
  );
}

function createStyles(_colors: ThemeColors) {
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
