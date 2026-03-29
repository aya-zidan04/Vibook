import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/ui/AppText';
import { DetailHeader } from '@/components/layout/DetailHeader';
import { Screen } from '@/components/layout/Screen';
import { useTranslation } from '@/i18n/useTranslation';
import { colors, radii, spacing } from '@/theme';

export default function SettingsScreen() {
  const { t } = useTranslation();
  const ROWS = [
    { icon: 'moon-outline' as const, labelKey: 'settings.appearance', valueKey: 'settings.appearanceVal' },
    { icon: 'globe-outline' as const, labelKey: 'settings.region', valueKey: 'settings.regionVal' },
    { icon: 'notifications-outline' as const, labelKey: 'settings.push', valueKey: 'settings.pushVal' },
  ];

  return (
    <Screen scroll contentStyle={styles.pad}>
      <DetailHeader title={t('settings.title')} />
      {ROWS.map((r) => (
        <Pressable key={r.labelKey} style={styles.row}>
          <View style={styles.icon}>
            <Ionicons name={r.icon} size={20} color={colors.primary} />
          </View>
          <AppText variant="bodyMedium" color="text" style={{ flex: 1 }}>
            {t(r.labelKey)}
          </AppText>
          <AppText variant="meta" color="textMuted">
            {t(r.valueKey)}
          </AppText>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </Pressable>
      ))}
      <AppText variant="caption" color="textMuted" style={styles.note}>
        {t('settings.note')}
      </AppText>
    </Screen>
  );
}

const styles = StyleSheet.create({
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
