import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import { colors, radii, spacing } from '@/theme';

export type ExploreCategory = {
  id: string;
  emoji: string;
  labelEn: string;
  labelAr: string;
};

type Props = {
  categories: ExploreCategory[];
  locale: 'en' | 'ar';
  onPress?: (id: string) => void;
};

export function ExploreCategoryStrip({ categories, locale, onPress }: Props) {
  return (
    <View style={styles.section}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
      >
        {categories.map((c) => (
          <Pressable
            key={c.id}
            onPress={() => onPress?.(c.id)}
            style={({ pressed }) => [styles.chip, pressed && { opacity: 0.9 }]}
          >
            <View style={styles.iconBubble}>
              <AppText style={styles.emoji}>{c.emoji}</AppText>
            </View>
            <AppText variant="meta" color="text" numberOfLines={2} style={styles.label}>
              {locale === 'ar' ? c.labelAr : c.labelEn}
            </AppText>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: spacing.xl },
  list: {
    gap: spacing.md,
    paddingHorizontal: spacing.screen,
    paddingVertical: 4,
  },
  chip: {
    width: 84,
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconBubble: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: { fontSize: 26 },
  label: { textAlign: 'center', lineHeight: 16 },
});
