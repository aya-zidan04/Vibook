import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/layout/Screen';
import { AppText } from '@/components/ui/AppText';
import { PrimaryButton } from '@/components/ui/Button';
import { colors, spacing } from '@/theme';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <Screen>
      <View style={styles.center}>
        <AppText variant="display" color="text">
          Vibook
        </AppText>
        <AppText variant="body" color="textSecondary" style={styles.sub}>
          Auth shell — Phase 2 wires forms & tokens here.
        </AppText>
        <PrimaryButton title="Continue to app" onPress={() => router.replace('/(tabs)' as never)} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.lg,
  },
  sub: {
    lineHeight: 24,
    marginBottom: spacing.md,
  },
});
