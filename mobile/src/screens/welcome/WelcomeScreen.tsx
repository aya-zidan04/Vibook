import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { AppText, PrimaryButton, Screen } from '../../components';
import { colors, radii, spacing } from '../../theme';
import type { RootStackParamList } from '../../navigation/types';

export function WelcomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const onGetStarted = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Main' }],
    });
  };

  return (
    <Screen edges={['top', 'bottom', 'left', 'right']}>
      <StatusBar style="dark" />
      <View style={styles.hero}>
        <View style={styles.artboard}>
          <View style={styles.artInner}>
            <Ionicons name="calendar-outline" size={56} color={colors.primary} />
          </View>
          <View style={styles.dots}>
            <View style={[styles.dot, styles.dotA]} />
            <View style={[styles.dot, styles.dotB]} />
            <View style={[styles.dot, styles.dotC]} />
          </View>
        </View>
      </View>

      <View style={styles.copy}>
        <AppText variant="hero" color="text" style={styles.headline}>
          Plan your next experience
        </AppText>
        <AppText variant="body" color="textSecondary" style={styles.sub}>
          Browse events, save favorites, and reserve tickets — all in one place.
        </AppText>
      </View>

      <View style={styles.actions}>
        <PrimaryButton title="Get started" onPress={onGetStarted} />
        <AppText variant="caption" color="textMuted" style={styles.hint}>
          Sign in and registration will appear here in a later step.
        </AppText>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },
  artboard: {
    width: '100%',
    aspectRatio: 1.15,
    maxHeight: 280,
    borderRadius: radii.xl,
    backgroundColor: `${colors.primary}12`,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  artInner: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.text,
    shadowOpacity: 0.08,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 4,
  },
  dots: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: 'none',
  },
  dot: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: `${colors.accent}55`,
  },
  dotA: {
    width: 12,
    height: 12,
    top: '18%',
    right: '14%',
  },
  dotB: {
    width: 8,
    height: 8,
    bottom: '22%',
    left: '12%',
    backgroundColor: `${colors.primary}44`,
  },
  dotC: {
    width: 16,
    height: 16,
    top: '28%',
    left: '18%',
    backgroundColor: `${colors.primaryMuted}33`,
  },
  copy: {
    flex: 1,
    justifyContent: 'center',
  },
  headline: {
    marginBottom: spacing.md,
  },
  sub: {
    lineHeight: 24,
  },
  actions: {
    gap: spacing.md,
    paddingBottom: spacing.md,
  },
  hint: {
    textAlign: 'center',
  },
});
