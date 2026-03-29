import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/ui/AppText';
import { DetailHeader } from '@/components/layout/DetailHeader';
import { Screen } from '@/components/layout/Screen';
import { useTranslation } from '@/i18n/useTranslation';
import { radii, spacing, useThemeColors } from '@/theme';
import type { ThemeColors } from '@/theme/palettes';

export default function HelpScreen() {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { t } = useTranslation();
  const FAQ = [
    { qKey: 'help.q1', aKey: 'help.a1' },
    { qKey: 'help.q2', aKey: 'help.a2' },
  ];

  return (
    <Screen scroll contentStyle={styles.pad}>
      <DetailHeader title={t('help.title')} />
      {FAQ.map((item) => (
        <View key={item.qKey} style={styles.block}>
          <AppText variant="bodyMedium" color="text">
            {t(item.qKey)}
          </AppText>
          <AppText variant="body" color="textSecondary">
            {t(item.aKey)}
          </AppText>
        </View>
      ))}
      <Pressable style={styles.contact}>
        <Ionicons name="chatbubble-outline" size={22} color={colors.accent} />
        <AppText variant="bodyMedium" color="accent">
          {t('help.contact')}
        </AppText>
      </Pressable>
    </Screen>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
  pad: { paddingTop: spacing.md, gap: spacing.lg },
  block: { gap: spacing.sm },
  contact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  });
}
