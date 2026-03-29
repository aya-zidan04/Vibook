import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/theme';
import type { ThemeColors } from '@/theme/palettes';

type Props = {
  brandLabel: string;
  regionLabel: string;
  onSearch: () => void;
  onLanguageCurrency: () => void;
  onRegionPress?: () => void;
  a11yLanguageCurrency: string;
  a11ySearch: string;
};

/** Top bar uses app background; with `direction: 'rtl'`, row starts from the right. */
export function ExploreHeader({
  brandLabel,
  regionLabel,
  onSearch,
  onLanguageCurrency,
  onRegionPress,
  a11yLanguageCurrency,
  a11ySearch,
}: Props) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.bar}>
      <View style={styles.left}>
        <Text style={styles.wordmark}>{brandLabel}</Text>
        <Pressable
          onPress={onRegionPress}
          style={({ pressed }) => [styles.regionBtn, pressed && styles.pressed]}
          hitSlop={8}
        >
          <Text style={styles.regionText}>{regionLabel}</Text>
          <Ionicons name="chevron-down" size={14} color={colors.text} />
        </Pressable>
      </View>

      <View style={styles.right}>
        <Pressable
          onPress={onLanguageCurrency}
          style={({ pressed }) => [styles.iconHit, pressed && styles.pressed]}
          accessibilityLabel={a11yLanguageCurrency}
          hitSlop={12}
        >
          <Ionicons name="globe-outline" size={24} color={colors.text} />
        </Pressable>
        <Pressable
          onPress={onSearch}
          style={({ pressed }) => [styles.iconHit, pressed && styles.pressed]}
          accessibilityLabel={a11ySearch}
          hitSlop={12}
        >
          <Ionicons name="search-outline" size={24} color={colors.text} />
        </Pressable>
      </View>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    bar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.background,
      paddingHorizontal: 20,
      paddingVertical: 14,
    },
    left: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      flexShrink: 1,
    },
    wordmark: {
      color: colors.text,
      fontSize: 22,
      fontWeight: '700',
      letterSpacing: -0.5,
    },
    regionBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingVertical: 4,
    },
    regionText: {
      color: colors.text,
      fontSize: 15,
      fontWeight: '500',
      textDecorationLine: 'underline',
      textDecorationColor: colors.text,
    },
    right: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 20,
    },
    iconHit: {
      padding: 4,
    },
    pressed: { opacity: 0.65 },
  });
}
