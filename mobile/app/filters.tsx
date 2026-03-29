import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppText } from '@/components/ui/AppText';
import { PrimaryButton } from '@/components/ui/Button';
import { DetailHeader } from '@/components/layout/DetailHeader';
import { Screen } from '@/components/layout/Screen';
import { useTranslation } from '@/i18n/useTranslation';
import { radii, spacing, useThemeColors } from '@/theme';
import type { ThemeColors } from '@/theme/palettes';

export default function FiltersScreen() {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const { t } = useTranslation();
  const CHIPS = ['filters.chipTonight', 'filters.chipBudget', 'filters.chipFamily', 'filters.chipOutdoor'] as const;

  return (
    <Screen scroll contentStyle={styles.pad}>
      <DetailHeader title={t('filters.title')} />
      <AppText variant="body" color="textSecondary">
        {t('filters.body')}
      </AppText>
      <View style={styles.chips}>
        {CHIPS.map((key) => (
          <Pressable key={key} style={styles.chip}>
            <AppText variant="caption" color="textSecondary">
              {t(key)}
            </AppText>
          </Pressable>
        ))}
      </View>
      <PrimaryButton title={t('filters.done')} onPress={() => router.back()} />
    </Screen>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
  pad: { paddingTop: spacing.md, gap: spacing.lg },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
});

}
