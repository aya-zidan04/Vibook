import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/ui/AppText';
import { spacing, useThemeColors } from '@/theme';
import type { ThemeColors } from '@/theme/palettes';
import { ltrNavigationChrome } from '@/utils/navigationChrome';

export type ExploreCategory = {
  id: string;
  /** Ionicons glyph name (outline style for consistency). */
  icon: keyof typeof Ionicons.glyphMap;
  labelEn: string;
  labelAr: string;
};

type Props = {
  categories: ExploreCategory[];
  locale: 'en' | 'ar';
  onPress?: (id: string) => void;
};

/**
 * Full-width vertical list: outline icons + labels, minimal dividers (inspired by clean category grids,
 * not a pixel copy). LTR chrome keeps icon-on-left even in Arabic.
 */
export function ExploreCategoryStrip({ categories, locale, onPress }: Props) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.section}>
      <View style={ltrNavigationChrome}>
        {categories.map((c, i) => (
          <Pressable
            key={c.id}
            onPress={() => onPress?.(c.id)}
            style={({ pressed }) => [
              styles.row,
              i < categories.length - 1 && styles.rowDivider,
              pressed && styles.rowPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel={locale === 'ar' ? c.labelAr : c.labelEn}
          >
            <View style={styles.iconSlot}>
              <Ionicons name={c.icon} size={24} color={colors.text} />
            </View>
            <AppText variant="bodyMedium" color="text" style={styles.label} numberOfLines={2}>
              {locale === 'ar' ? c.labelAr : c.labelEn}
            </AppText>
            <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    section: {
      marginBottom: spacing.xl,
      paddingHorizontal: spacing.screen,
    },
    row: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.xs,
      backgroundColor: 'transparent',
    },
    rowDivider: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    rowPressed: {
      opacity: 0.72,
    },
    iconSlot: {
      width: 30,
      alignItems: 'center',
      justifyContent: 'center',
    },
    label: {
      flex: 1,
      lineHeight: 22,
    },
  });
}
