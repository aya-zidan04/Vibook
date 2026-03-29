import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '../../components';
import { colors, spacing } from '../../theme';
import type { RootStackParamList } from '../../navigation/types';

const SPLASH_MS = 2000;

export function SplashScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Welcome');
    }, SPLASH_MS);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <View style={styles.logoWrap}>
        <View style={styles.logoCircle}>
          <Ionicons name="ticket" size={44} color={colors.surface} />
        </View>
      </View>
      <AppText variant="hero" color="surface" style={styles.brand}>
        Vibook
      </AppText>
      <AppText variant="body" style={styles.tagline}>
        Discover experiences worth booking
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  logoWrap: {
    marginBottom: spacing.lg,
  },
  logoCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: `${colors.surface}22`,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: `${colors.surface}33`,
  },
  brand: {
    color: colors.surface,
    marginBottom: spacing.sm,
  },
  tagline: {
    color: 'rgba(255, 255, 255, 0.82)',
    textAlign: 'center',
  },
});
