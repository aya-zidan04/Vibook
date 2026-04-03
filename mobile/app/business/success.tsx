import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/ui/AppText';
import { PrimaryButton, SecondaryButton } from '@/components/ui/Button';
import { DetailHeader } from '@/components/layout/DetailHeader';
import { Screen } from '@/components/layout/Screen';
import { useTranslation } from '@/i18n/useTranslation';
import { spacing, useThemeColors } from '@/theme';
import type { ThemeColors } from '@/theme/palettes';

export default function BusinessApplicationSuccessScreen() {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <Screen scroll contentStyle={styles.pad}>
      <DetailHeader title={t('businessSuccess.title')} />
      <View style={styles.iconWrap}>
        <Ionicons name="checkmark-circle" size={72} color={colors.accent} />
      </View>
      <AppText variant="h2" color="text" style={styles.center}>
        {t('businessSuccess.headline')}
      </AppText>
      <AppText variant="body" color="textSecondary" style={styles.center}>
        {t('businessSuccess.body')}
      </AppText>
      <AppText variant="caption" color="textMuted" style={styles.note}>
        {t('businessSuccess.note')}
      </AppText>
      <PrimaryButton title={t('businessSuccess.ctaHome')} onPress={() => router.replace('/(tabs)/explore')} />
      <SecondaryButton
        title={t('businessSuccess.ctaProfile')}
        onPress={() => router.replace('/(tabs)/me')}
        style={styles.second}
      />
    </Screen>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    pad: { paddingTop: spacing.md, gap: spacing.lg, paddingBottom: spacing.xxxl },
    iconWrap: { alignItems: 'center', marginTop: spacing.md },
    center: { textAlign: 'center', lineHeight: 24 },
    note: { textAlign: 'center', lineHeight: 20 },
    second: { marginTop: spacing.sm },
  });
}
