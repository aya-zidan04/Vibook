import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/ui/AppText';
import { useAppStore } from '@/store/appStore';
import { colors, spacing } from '@/theme';

const SPLASH_MS = 2200;

/**
 * First screen on cold start: brand splash, then onboarding (first install) or main tabs.
 */
export default function SplashScreen() {
  const router = useRouter();
  const hasCompletedOnboarding = useAppStore((s) => s.hasCompletedOnboarding);
  const [hydrated, setHydrated] = useState(() => useAppStore.persist.hasHydrated());

  useEffect(() => {
    const unsub = useAppStore.persist.onFinishHydration(() => setHydrated(true));
    return unsub;
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const id = setTimeout(() => {
      if (hasCompletedOnboarding) {
        router.replace('/(tabs)');
      } else {
        router.replace('/onboarding');
      }
    }, SPLASH_MS);
    return () => clearTimeout(id);
  }, [hydrated, router, hasCompletedOnboarding]);

  return (
    <LinearGradient
      colors={[colors.background, colors.backgroundElevated, colors.background]}
      style={styles.root}
    >
      <View style={styles.logoRing}>
        <Ionicons name="ticket" size={44} color={colors.primary} />
      </View>
      <AppText variant="display" color="text" style={styles.brand}>
        Vibook
      </AppText>
      <AppText variant="body" color="textMuted" style={styles.tag}>
        Events, dining, stays & more
      </AppText>
      <ActivityIndicator color={colors.primary} size="large" style={styles.loader} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
  },
  logoRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
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
