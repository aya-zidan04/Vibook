import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme';

type Props = {
  regionLabel: string;
  onSearch: () => void;
  onLanguageCurrency: () => void;
  onRegionPress?: () => void;
};

/** Top bar uses app background; with `direction: 'rtl'`, row starts from the right. */
export function ExploreHeader({ regionLabel, onSearch, onLanguageCurrency, onRegionPress }: Props) {
  return (
    <View style={styles.bar}>
      <View style={styles.left}>
        <Text style={styles.wordmark}>Vibook</Text>
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
          accessibilityLabel="Language and currency"
          hitSlop={12}
        >
          <Ionicons name="globe-outline" size={24} color={colors.text} />
        </Pressable>
        <Pressable
          onPress={onSearch}
          style={({ pressed }) => [styles.iconHit, pressed && styles.pressed]}
          accessibilityLabel="Search"
          hitSlop={12}
        >
          <Ionicons name="search-outline" size={24} color={colors.text} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
