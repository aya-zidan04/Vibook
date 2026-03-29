import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { AppText } from '@/components/ui/AppText';
import { Badge } from '@/components/ui/Badge';
import { colors, radii, shadows, spacing } from '@/theme';
import type { EventItem } from '@/types';
import { formatDateShort, formatPrice } from '@/utils/format';

type Props = {
  event: EventItem;
  onPress?: () => void;
  variant?: 'wide' | 'compact';
};

export function EventCard({ event, onPress, variant = 'compact' }: Props) {
  const [fav, setFav] = useState(false);
  const wide = variant === 'wide';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        wide ? styles.wide : styles.compact,
        shadows.md,
        pressed && { opacity: 0.94 },
      ]}
    >
      <View style={[styles.imageWrap, wide && styles.imageWide]}>
        <Image source={{ uri: event.imageUrl }} style={StyleSheet.absoluteFill} contentFit="cover" />
        <LinearGradient
          colors={['transparent', 'rgba(7,11,20,0.85)']}
          style={styles.grad}
        />
        {event.badge ? (
          <View style={styles.badgePos}>
            <Badge tone={event.badge} />
          </View>
        ) : null}
        <Pressable style={styles.fav} onPress={() => setFav((x) => !x)} hitSlop={10}>
          <Ionicons
            name={fav ? 'heart' : 'heart-outline'}
            size={18}
            color={colors.text}
          />
        </Pressable>
      </View>
      <View style={styles.body}>
        <AppText variant="h3" color="text" numberOfLines={2}>
          {event.title}
        </AppText>
        <AppText variant="caption" color="textMuted" numberOfLines={1} style={styles.meta}>
          {formatDateShort(event.startAt)} · {event.venueName}
        </AppText>
        <View style={styles.row}>
          <AppText variant="price" color="accent">
            {formatPrice(event.priceFrom, event.currency)}
          </AppText>
          <View style={styles.rating}>
            <Ionicons name="star" size={14} color={colors.warning} />
            <AppText variant="meta" color="textSecondary">
              {event.rating.toFixed(1)}
            </AppText>
          </View>
        </View>
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
    borderColor: colors.border,
  },
  wide: {
    width: 280,
    marginRight: spacing.md,
  },
  compact: {
    width: '100%',
    marginBottom: spacing.md,
  },
  imageWrap: {
    height: 140,
    backgroundColor: colors.surfaceMuted,
  },
  imageWide: {
    height: 160,
  },
  grad: {
    ...StyleSheet.absoluteFillObject,
  },
  badgePos: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
  },
  fav: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    padding: spacing.md,
    gap: 6,
  },
  meta: { marginTop: 2 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 4 },
});
