import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { AppText } from './AppText';
import { colors, radii, shadows, spacing } from '../../theme';
import type { PlaceholderEvent } from '../../data/eventPlaceholders';

export type EventCardVariant = 'featured' | 'list' | 'grid';

type Props = {
  event: Pick<
    PlaceholderEvent,
    'title' | 'location' | 'dateLabel' | 'priceLabel' | 'imageUrl'
  >;
  variant?: EventCardVariant;
  onPress?: () => void;
  style?: ViewStyle;
};

export function EventCard({ event, variant = 'list', onPress, style }: Props) {
  const [favorite, setFavorite] = useState(false);

  const onFavoritePress = useCallback(() => {
    setFavorite((f) => !f);
  }, []);

  const isFeatured = variant === 'featured';
  const isGrid = variant === 'grid';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        isFeatured && styles.cardFeatured,
        isGrid && styles.cardGrid,
        shadows.md,
        variant === 'list' && styles.cardList,
        pressed && styles.pressed,
        style,
      ]}
    >
      <View
        style={[
          styles.imageWrap,
          isFeatured && styles.imageWrapFeatured,
          isGrid && styles.imageWrapGrid,
        ]}
      >
        <Image
          source={{ uri: event.imageUrl }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={200}
          accessibilityLabel=""
        />
        <LinearGradient
          colors={['transparent', 'rgba(18,19,26,0.15)']}
          style={styles.imageGradient}
          pointerEvents="none"
        />
        <Pressable
          style={styles.favoriteBtn}
          onPress={onFavoritePress}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={favorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <View style={styles.favoriteInner}>
            <Ionicons
              name={favorite ? 'heart' : 'heart-outline'}
              size={18}
              color={favorite ? colors.favorite : colors.surface}
            />
          </View>
        </Pressable>
      </View>

      <View style={[styles.body, isGrid && styles.bodyGrid]}>
        <AppText variant="cardTitle" color="text" numberOfLines={isGrid ? 2 : 2}>
          {event.title}
        </AppText>
        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={14} color={colors.textMuted} />
          <AppText variant="caption" color="textSecondary" style={styles.metaText} numberOfLines={1}>
            {event.location}
          </AppText>
        </View>
        <View style={styles.metaRow}>
          <Ionicons name="calendar-outline" size={14} color={colors.textMuted} />
          <AppText variant="caption" color="textSecondary" style={styles.metaText}>
            {event.dateLabel}
          </AppText>
        </View>
        <AppText variant="price" color="primary" style={styles.price}>
          {event.priceLabel}
        </AppText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  cardFeatured: {
    width: 300,
    marginRight: spacing.md,
  },
  cardList: {
    width: '100%',
    marginBottom: spacing.md,
  },
  cardGrid: {
    marginBottom: spacing.md,
  },
  pressed: {
    opacity: 0.94,
    transform: [{ scale: 0.992 }],
  },
  imageWrap: {
    height: 200,
    backgroundColor: colors.surfaceMuted,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    overflow: 'hidden',
  },
  imageWrapFeatured: {
    height: 220,
  },
  imageWrapGrid: {
    height: 132,
  },
  imageGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  favoriteBtn: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
  },
  favoriteInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.overlayLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  body: {
    padding: spacing.md,
    gap: 6,
  },
  bodyGrid: {
    padding: spacing.sm + 2,
    gap: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    flex: 1,
  },
  price: {
    marginTop: 4,
  },
});
