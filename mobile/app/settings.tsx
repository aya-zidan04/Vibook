import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/ui/AppText';
import { DetailHeader } from '@/components/layout/DetailHeader';
import { Screen } from '@/components/layout/Screen';
import { useTranslation } from '@/i18n/useTranslation';
import { useThemeStore } from '@/store/themeStore';
import { radii, spacing, useThemeColors } from '@/theme';
import type { ThemeColors } from '@/theme/palettes';

export default function SettingsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const colorScheme = useThemeStore((s) => s.colorScheme);
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const appearanceLabel =
    colorScheme === 'light' ? t('appearance.shortLight') : t('appearance.shortDark');

  return (
    <Screen scroll contentStyle={styles.pad}>
      <DetailHeader title={t('settings.title')} />
      <Pressable style={styles.row} onPress={() => router.push('/appearance')}>
        <View style={styles.icon}>
          <Ionicons name="moon-outline" size={20} color={colors.primary} />
        </View>
        <AppText variant="bodyMedium" color="text" style={{ flex: 1 }}>
          {t('settings.appearance')}
        </AppText>
        <AppText variant="meta" color="textMuted">
          {appearanceLabel}
        </AppText>
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      </Pressable>
      <Pressable style={styles.row}>
        <View style={styles.icon}>
          <Ionicons name="globe-outline" size={20} color={colors.primary} />
        </View>
        <AppText variant="bodyMedium" color="text" style={{ flex: 1 }}>
          {t('settings.region')}
        </AppText>
        <AppText variant="meta" color="textMuted">
          {t('settings.regionVal')}
        </AppText>
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      </Pressable>
      <Pressable style={styles.row}>
        <View style={styles.icon}>
          <Ionicons name="notifications-outline" size={20} color={colors.primary} />
        </View>
        <AppText variant="bodyMedium" color="text" style={{ flex: 1 }}>
          {t('settings.push')}
        </AppText>
        <AppText variant="meta" color="textMuted">
          {t('settings.pushVal')}
        </AppText>
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      </Pressable>
      <AppText variant="caption" color="textMuted" style={styles.note}>
        {t('settings.note')}
      </AppText>
    </Screen>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    pad: { paddingTop: spacing.md, gap: spacing.sm },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      padding: spacing.md,
      backgroundColor: colors.surface,
      borderRadius: radii.lg,
      borderWidth: 1,
      borderColor: colors.border,
    },
    icon: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: colors.primaryMuted,
      alignItems: 'center',
      justifyContent: 'center',
    },
    note: { marginTop: spacing.lg, lineHeight: 20 },
  });
}
