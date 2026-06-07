import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppText } from '@/components/ui/AppText';
import { NavigationChevronBack } from '@/components/ui/NavigationChevron';
import { useTranslation } from '@/i18n/useTranslation';
import { navigationRowStyle } from '@/utils/rtl';
import { spacing, useThemeColors } from '@/theme';

type Props = {
  title?: string;
  right?: ReactNode;
  /** Override back chevron color (e.g. on photo hero overlays). */
  iconColor?: string;
};

export function DetailHeader({ title, right, iconColor }: Props) {
  const router = useRouter();
  const { t, isRTL } = useTranslation();
  const colors = useThemeColors();
  const chevronColor = iconColor ?? colors.icon;

  return (
    <View style={[navigationRowStyle(isRTL), styles.row]}>
      <Pressable
        onPress={() => router.back()}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel={t('common.a11yGoBack')}
      >
        <NavigationChevronBack size={28} color={chevronColor} />
      </Pressable>
      {title ? (
        <AppText variant="h3" color="text" numberOfLines={1} style={styles.title}>
          {title}
        </AppText>
      ) : (
        <View style={styles.spacer} />
      )}
      {right ?? <View style={styles.rightPad} />}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  title: { flex: 1, textAlign: 'center' },
  spacer: { flex: 1 },
  rightPad: { width: 28 },
});
