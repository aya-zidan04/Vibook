import { Ionicons } from '@expo/vector-icons';
import { type ReactNode, useMemo, useRef } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import type { ExploreMainCategory, ExploreSubcategory } from '@/types/exploreCategories';
import { radii, spacing, useThemeColors } from '@/theme';
import type { ThemeColors } from '@/theme/palettes';

type Props = {
  categories: ExploreMainCategory[];
  selectedCategoryId: string;
  onSelectCategory: (id: string) => void;
  subcategories?: ExploreSubcategory[];
  selectedSubcategoryId?: string | null;
  onSelectSubcategory?: (id: string | null) => void;
  locale: 'en' | 'ar';
};

/**
 * Horizontal Explore category + subcategory selectors with gentle press feedback.
 */
export function ExploreCategoryStrip({
  categories,
  selectedCategoryId,
  onSelectCategory,
  subcategories = [],
  selectedSubcategoryId = null,
  onSelectSubcategory,
  locale,
}: Props) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.section}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.mainRow}
      >
        {categories.map((c) => (
          <AnimatedChip
            key={c.id}
            active={selectedCategoryId === c.id}
            onPress={() => onSelectCategory(c.id)}
            accessibilityLabel={locale === 'ar' ? c.nameAr : c.name}
            style={[
              styles.mainChip,
              selectedCategoryId === c.id && styles.mainChipActive,
            ]}
          >
            <Ionicons
              name={c.icon}
              size={18}
              color={selectedCategoryId === c.id ? colors.textOnPrimary : colors.primary}
            />
            <AppText
              variant="body-em"
              color={selectedCategoryId === c.id ? 'textOnPrimary' : 'text'}
              style={styles.mainChipLabel}
            >
              {locale === 'ar' ? c.nameAr : c.name}
            </AppText>
          </AnimatedChip>
        ))}
      </ScrollView>

      {subcategories.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.subRow}
        >
          {subcategories.map((s) => {
            const active = selectedSubcategoryId === s.id;
            return (
              <AnimatedChip
                key={s.id}
                active={active}
                onPress={() => onSelectSubcategory?.(active ? null : s.id)}
                accessibilityLabel={locale === 'ar' ? s.nameAr : s.name}
                style={[styles.subChip, active && styles.subChipActive]}
              >
                <AppText variant="caption" color={active ? 'textOnPrimary' : 'primaryLight'}>
                  {locale === 'ar' ? s.nameAr : s.name}
                </AppText>
              </AnimatedChip>
            );
          })}
        </ScrollView>
      ) : null}
    </View>
  );
}

function AnimatedChip({
  children,
  active,
  onPress,
  accessibilityLabel,
  style,
}: {
  children: ReactNode;
  active: boolean;
  onPress: () => void;
  accessibilityLabel: string;
  style?: object | object[];
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const onPressIn = () => {
    Animated.spring(scale, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 24,
      bounciness: 6,
    }).start();
  };
  const onPressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 24,
      bounciness: 6,
    }).start();
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
    >
      <Animated.View style={[style, { transform: [{ scale }] }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    section: {
      marginBottom: spacing.xl,
      gap: spacing.sm,
    },
    mainRow: {
      paddingHorizontal: spacing.screen,
      gap: spacing.sm,
      paddingBottom: 2,
    },
    mainChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: radii.full,
      borderWidth: 1,
      borderColor: colors.borderLight,
      backgroundColor: colors.card,
      minHeight: 44,
    },
    mainChipLabel: {
      marginTop: 1,
    },
    mainChipActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    subRow: {
      paddingHorizontal: spacing.screen,
      gap: spacing.xs,
      paddingBottom: 2,
    },
    subChip: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 7,
      paddingHorizontal: spacing.md,
      borderRadius: radii.full,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    subChipActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
  });
}
