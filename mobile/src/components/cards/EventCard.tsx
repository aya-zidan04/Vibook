import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { AppText } from '@/components/ui/AppText';
import { Badge } from '@/components/ui/Badge';
import { createShadows, fadeFromBackground, radii, spacing, useThemeColors } from '@/theme';
import type { ThemeColors } from '@/theme/palettes';
import type { EventItem } from '@/types';
import { EventFavoriteButton } from '@/components/event/EventFavoriteButton';
import { useFormatMoney } from '@/hooks/useFormatMoney';
import { useTranslation } from '@/i18n/useTranslation';
import { formatDateShort, formatDecimalForLocale } from '@/utils/format';

type Props = {
  event: EventItem;
  onPress?: () => void;
  variant?: 'wide' | 'compact';
};

export function EventCard({ event, onPress, variant = 'compact' }: Props) {
  const router = useRouter();
  const { locale } = useTranslation();
  const { formatMoney } = useFormatMoney();
  const wide = variant === 'wide';
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors, wide), [colors, wide]);
  const sh = useMemo(() => createShadows(colors), [colors]);

  const handlePress = () => {
    if (onPress) onPress();
    else router.push(`/event/${event.id}`);
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.card,
        wide ? styles.wide : styles.compact,
        sh.md,
        pressed && { opacity: 0.94 },
      ]}
    >
      <View style={[styles.imageWrap, wide && styles.imageWide]}>
        {event.imageUrl ? (
          <Image source={{ uri: event.imageUrl }} style={StyleSheet.absoluteFill} contentFit="cover" />
        ) : (
          <View style={[StyleSheet.absoluteFill, styles.imagePlaceholder]} />
        )}
        <LinearGradient
          colors={['transparent', fadeFromBackground(colors, 0.85)]}
          style={styles.grad}
        />
        {event.badge ? (
          <View style={styles.badgePos}>
            <Badge tone={event.badge} />
          </View>
        ) : null}
        <EventFavoriteButton
          eventId={event.id}
          style={styles.fav}
          onRequiresAuth={() => router.push('/login')}
        />
      </View>
      <View style={styles.body}>
        <AppText variant="h3" color="text" numberOfLines={2}>
          {event.title}
        </AppText>
        <AppText variant="caption" color="textMuted" numberOfLines={1} style={styles.meta}>
          {formatDateShort(event.startAt, locale)} · {event.venueName}
        </AppText>
        <View style={styles.row}>
          <AppText variant="h3" color="primaryLight">
            {formatMoney(event.priceFrom, event.currency)}
          </AppText>
          <View style={styles.rating}>
            <Ionicons name="star" size={14} color={colors.primaryLight} />
            <AppText variant="label" color="textSecondary">
              {formatDecimalForLocale(event.rating, locale, 1)}
            </AppText>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

function createStyles(colors: ThemeColors, wide: boolean) {
  return StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: radii.xl,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.border,
    },
    wide: {
      width: 280,
      marginEnd: spacing.md,
    },
    compact: {
      width: '100%',
      marginBottom: spacing.md,
    },
    imageWrap: {
      height: wide ? 160 : 140,
      backgroundColor: colors.surfaceMuted,
    },
    imagePlaceholder: {
      backgroundColor: colors.surfaceMuted,
    },
    imageWide: {},
    grad: {
      ...StyleSheet.absoluteFillObject,
    },
    badgePos: {
      position: 'absolute',
      top: spacing.sm,
      start: spacing.sm,
    },
    fav: {
      position: 'absolute',
      top: spacing.sm,
      end: spacing.sm,
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.iconOverlay,
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
}
