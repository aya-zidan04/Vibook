import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/ui/AppText';
import { PrimaryButton } from '@/components/ui/Button';
import { useAppStore } from '@/store/appStore';
import { colors, radii, spacing } from '@/theme';

const POINTS = [
  { icon: 'compass-outline' as const, title: 'Discover', text: 'Events, experiences, and venues in one place.' },
  { icon: 'restaurant-outline' as const, title: 'Book', text: 'Tables, stays, flights, and activities — fast checkout.' },
  { icon: 'heart-outline' as const, title: 'Save', text: 'Favorites and bookings, always in sync.' },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const setDone = useAppStore((s) => s.setHasCompletedOnboarding);

  const onGetStarted = () => {
    setDone(true);
    router.replace('/(tabs)');
  };

  return (
    <LinearGradient colors={[colors.background, colors.backgroundElevated]} style={styles.root}>
      <AppText variant="overline" color="accent" style={styles.kicker}>
        Welcome
      </AppText>
      <AppText variant="h1" color="text" style={styles.headline}>
        Your lifestyle, booked
      </AppText>

      <View style={styles.cards}>
        {POINTS.map((p) => (
          <View key={p.title} style={styles.card}>
            <View style={styles.iconBox}>
              <Ionicons name={p.icon} size={24} color={colors.primary} />
            </View>
            <View style={styles.cardText}>
              <AppText variant="h3" color="text">
                {p.title}
              </AppText>
              <AppText variant="caption" color="textSecondary" style={styles.cardDesc}>
                {p.text}
              </AppText>
            </View>
          </View>
        ))}
      </View>

      <PrimaryButton title="Get started" onPress={onGetStarted} style={styles.cta} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.xxxl * 2,
    paddingBottom: spacing.xxxl,
  },
  kicker: { marginBottom: spacing.sm },
  headline: { marginBottom: spacing.xxl },
  cards: { gap: spacing.md, marginBottom: spacing.xxl },
  card: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: radii.md,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: { flex: 1, gap: 6 },
  cardDesc: { lineHeight: 20 },
  cta: { marginTop: 'auto' },
});
