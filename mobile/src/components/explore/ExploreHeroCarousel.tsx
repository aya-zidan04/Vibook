import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { AppText } from '@/components/ui/AppText';
import { createShadows, fadeFromBackground, radii, spacing, useThemeColors } from '@/theme';
import type { ThemeColors } from '@/theme/palettes';

export type HeroSlideItem = {
  id: string;
  imageUrl: string;
  title: string;
  subtitle: string;
  eyebrow?: string;
  onPress?: () => void;
};

type Props = {
  slides: HeroSlideItem[];
};

const CARD_W = 300;
const CARD_H = 168;

export function ExploreHeroCarousel({ slides }: Props) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const sh = useMemo(() => createShadows(colors), [colors]);

  return (
    <View style={styles.section}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.list}>
        {slides.map((s) => (
          <Pressable
            key={s.id}
            onPress={s.onPress}
            style={({ pressed }) => [styles.card, sh.md, pressed && { opacity: 0.94 }]}
          >
            <Image source={{ uri: s.imageUrl }} style={StyleSheet.absoluteFill} contentFit="cover" />
            <LinearGradient
              colors={['transparent', fadeFromBackground(colors, 0.15), fadeFromBackground(colors, 0.92)]}
              locations={[0, 0.45, 1]}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.copy}>
              {s.eyebrow ? (
                <AppText variant="overline" color="accent">
                  {s.eyebrow}
                </AppText>
              ) : null}
              <AppText variant="h2" color="text" numberOfLines={2} style={styles.title}>
                {s.title}
              </AppText>
              <AppText variant="caption" color="textSecondary" numberOfLines={2}>
                {s.subtitle}
              </AppText>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    section: { marginBottom: spacing.xl },
    list: {
      gap: spacing.md,
      paddingHorizontal: spacing.screen,
      paddingVertical: 4,
    },
    card: {
      width: CARD_W,
      height: CARD_H,
      borderRadius: radii.xl,
      overflow: 'hidden',
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    copy: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      padding: spacing.md,
      gap: 4,
    },
    title: { marginTop: 2 },
  });
}
