import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { AppText } from '@/components/ui/AppText';
import { fadeFromBackground, radii, spacing, useThemeColors } from '@/theme';
import type { ThemeColors } from '@/theme/palettes';

export type PromoTile = {
  id: string;
  imageUrl: string;
  title: string;
  subtitle: string;
  kind: 'event' | 'experience' | 'offer';
  kindLabel: string;
  onPress?: () => void;
};

type Props = {
  large: PromoTile;
  stackTop: PromoTile;
  stackBottom: PromoTile;
  rowLeft: PromoTile;
  rowRight: PromoTile;
};

function Tile({
  tile,
  height,
  variant = 'default',
}: {
  tile: PromoTile;
  height: number;
  variant?: 'default' | 'compact';
}) {
  const colors = useThemeColors();
  const styles = useMemo(() => tileStyles(colors), [colors]);

  return (
    <Pressable
      onPress={tile.onPress}
      style={({ pressed }) => [
        styles.tile,
        { height },
        variant === 'compact' && styles.tileCompact,
        pressed && { opacity: 0.92 },
      ]}
    >
      <Image source={{ uri: tile.imageUrl }} style={StyleSheet.absoluteFill} contentFit="cover" />
      <LinearGradient
        colors={['transparent', fadeFromBackground(colors, 0.88)]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.tileInner}>
        <AppText variant="label" color="accentText" style={styles.kindLabel}>
          {tile.kindLabel}
        </AppText>
        <AppText variant="body-em" color="text" numberOfLines={variant === 'compact' ? 2 : 3}>
          {tile.title}
        </AppText>
        {variant !== 'compact' ? (
          <AppText variant="caption" color="textMuted" numberOfLines={2}>
            {tile.subtitle}
          </AppText>
        ) : null}
      </View>
    </Pressable>
  );
}

function tileStyles(colors: ThemeColors) {
  return StyleSheet.create({
    tile: {
      borderRadius: radii.xl,
      overflow: 'hidden',
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    tileCompact: {},
    tileInner: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      padding: spacing.md,
      gap: 4,
    },
    kindLabel: {
      alignSelf: 'flex-start',
      paddingHorizontal: spacing.sm,
      paddingVertical: 3,
      borderRadius: radii.sm,
      backgroundColor: colors.accentBg,
      borderWidth: 1,
      borderColor: colors.accentBorder,
      overflow: 'hidden',
    },
  });
}

export function ExplorePromoGrid({ large, stackTop, stackBottom, rowLeft, rowRight }: Props) {
  const styles = useMemo(() => layoutStyles(), []);

  return (
    <View style={styles.wrap}>
      <View style={styles.row1}>
        <View style={styles.largeCol}>
          <Tile tile={large} height={232} />
        </View>
        <View style={styles.stackCol}>
          <Tile tile={stackTop} height={110} variant="compact" />
          <Tile tile={stackBottom} height={110} variant="compact" />
        </View>
      </View>
      <View style={styles.row2}>
        <View style={styles.half}>
          <Tile tile={rowLeft} height={136} variant="compact" />
        </View>
        <View style={styles.half}>
          <Tile tile={rowRight} height={136} variant="compact" />
        </View>
      </View>
    </View>
  );
}

function layoutStyles() {
  return StyleSheet.create({
    wrap: { gap: spacing.md, marginBottom: spacing.xl },
    row1: { flexDirection: 'row', gap: spacing.md, alignItems: 'stretch' },
    largeCol: { flex: 1.15 },
    stackCol: { flex: 1, gap: spacing.md, justifyContent: 'space-between' },
    row2: { flexDirection: 'row', gap: spacing.md },
    half: { flex: 1 },
  });
}
