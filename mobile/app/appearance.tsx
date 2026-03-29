import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/ui/AppText';
import { DetailHeader } from '@/components/layout/DetailHeader';
import { Screen } from '@/components/layout/Screen';
import { useTranslation } from '@/i18n/useTranslation';
import { useThemeStore, type ColorScheme } from '@/store/themeStore';
import { radii, spacing, useThemeColors } from '@/theme';
import type { ThemeColors } from '@/theme/palettes';

export default function AppearanceScreen() {
  const { t } = useTranslation();
  const colorScheme = useThemeStore((s) => s.colorScheme);
  const setColorScheme = useThemeStore((s) => s.setColorScheme);
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const set = (scheme: ColorScheme) => {
    setColorScheme(scheme);
  };

  return (
    <Screen scroll contentStyle={styles.pad}>
      <DetailHeader title={t('appearance.title')} />
      <AppText variant="body" color="textSecondary" style={styles.intro}>
        {t('appearance.subtitle')}
      </AppText>

      <Pressable
        style={[styles.option, colorScheme === 'light' && styles.optionOn]}
        onPress={() => set('light')}
        accessibilityRole="radio"
        accessibilityState={{ selected: colorScheme === 'light' }}
      >
        <View style={styles.optionLeft}>
          <Ionicons name="sunny-outline" size={26} color={colors.primary} />
          <View>
            <AppText variant="bodyMedium" color="text">
              {t('appearance.light')}
            </AppText>
            <AppText variant="caption" color="textMuted">
              {t('appearance.lightHint')}
            </AppText>
          </View>
        </View>
        {colorScheme === 'light' ? (
          <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
        ) : (
          <View style={styles.radio} />
        )}
      </Pressable>

      <Pressable
        style={[styles.option, colorScheme === 'dark' && styles.optionOn]}
        onPress={() => set('dark')}
        accessibilityRole="radio"
        accessibilityState={{ selected: colorScheme === 'dark' }}
      >
        <View style={styles.optionLeft}>
          <Ionicons name="moon-outline" size={26} color={colors.primary} />
          <View>
            <AppText variant="bodyMedium" color="text">
              {t('appearance.dark')}
            </AppText>
            <AppText variant="caption" color="textMuted">
              {t('appearance.darkHint')}
            </AppText>
          </View>
        </View>
        {colorScheme === 'dark' ? (
          <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
        ) : (
          <View style={styles.radio} />
        )}
      </Pressable>

      <AppText variant="caption" color="textMuted" style={styles.note}>
        {t('appearance.note')}
      </AppText>
    </Screen>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    pad: { paddingTop: spacing.md, gap: spacing.md },
    intro: { lineHeight: 22, marginBottom: spacing.sm },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: spacing.lg,
      borderRadius: radii.xl,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      gap: spacing.md,
    },
    optionOn: {
      borderColor: colors.primary,
      backgroundColor: colors.primaryMuted,
    },
    optionLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      flex: 1,
    },
    radio: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: colors.borderLight,
    },
    note: { marginTop: spacing.lg, lineHeight: 18 },
  });
}
