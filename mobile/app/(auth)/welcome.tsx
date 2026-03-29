import { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/layout/Screen';
import { AppText } from '@/components/ui/AppText';
import { PrimaryButton } from '@/components/ui/Button';
import { useTranslation } from '@/i18n/useTranslation';
import { spacing, useThemeColors } from '@/theme';
import type { ThemeColors } from '@/theme/palettes';

export default function WelcomeScreen() {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <Screen>
      <View style={styles.center}>
        <AppText variant="display" color="text">
          Vibook
        </AppText>
        <AppText variant="body" color="textSecondary" style={styles.sub}>
          {t('welcome.subtitle')}
        </AppText>
        <PrimaryButton title={t('welcome.continue')} onPress={() => router.replace('/(tabs)/explore' as never)} />
      </View>
    </Screen>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
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

}
