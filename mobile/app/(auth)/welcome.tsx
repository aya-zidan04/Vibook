import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { VibookLogoMark } from '@/components/branding/VibookLogoMark';
import { Screen } from '@/components/layout/Screen';
import { AppText } from '@/components/ui/AppText';
import { PrimaryButton, SecondaryButton } from '@/components/ui/Button';
import { useTranslation } from '@/i18n/useTranslation';
import { radii, spacing, useThemeColors } from '@/theme';
import type { ThemeColors } from '@/theme/palettes';

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
      <View style={styles.content}>
        <VibookLogoMark size={96} style={styles.logo} accessibilityLabel={t('common.brandDisplay')} />
        <AppText variant="display" color="text" style={styles.title}>
          {t('common.brandDisplay')}
        </AppText>
        <AppText variant="body" color="textSecondary" style={styles.sub}>
          {t('welcome.subtitle')}
        </AppText>
        <PrimaryButton title={t('welcome.continue')} onPress={() => router.replace('/(tabs)/explore' as never)} />
        <SecondaryButton title={t('entry.loginSignup')} onPress={() => router.push('/login')} />
      </View>
    </Screen>
  );
}

function createStyles(_colors: ThemeColors) {
  return StyleSheet.create({
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
