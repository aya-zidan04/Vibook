import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/ui/AppText';
import { Badge } from '@/components/ui/Badge';
import type { EventItem } from '@/types';
import { createShadows, fadeFromBackground, radii, spacing, useThemeColors } from '@/theme';
import type { ThemeColors } from '@/theme/palettes';
import { EventFavoriteButton } from '@/components/event/EventFavoriteButton';
import { useFormatMoney } from '@/hooks/useFormatMoney';
import { useTranslation } from '@/i18n/useTranslation';
import { useRouter } from 'expo-router';

type Props = {
  event: EventItem;
  cityName: string;
  onPress: () => void;
};

export function ExploreEventFeedCard({
  event,
  cityName,
  onPress,
}: Props) {
  const router = useRouter();
  const { t, locale } = useTranslation();
  const { formatMoney } = useFormatMoney();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const start = new Date(event.startAt);
  const dateStr =
    locale === 'ar'
      ? start.toLocaleString('ar-JO', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          numberingSystem: 'arab',
        })
      : start.toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          numberingSystem: 'latn',
        });

  const price = formatMoney(event.priceFrom, event.currency);
  const locationLine = [event.venueName, cityName].map((p) => p?.trim()).filter(Boolean).join(' · ');

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && { opacity: 0.94 }]}>
      <View style={styles.thumbWrap}>
        {event.imageUrl ? (
          <Image source={{ uri: event.imageUrl }} style={styles.thumb} contentFit="cover" />
        ) : (
          <View style={[styles.thumb, styles.thumbPlaceholder]} />
        )}
        <LinearGradient colors={['transparent', fadeFromBackground(colors, 0.55)]} style={StyleSheet.absoluteFill} />
        {event.badge ? (
          <View style={styles.badge}>
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
        <View style={styles.metaRow}>
          <Ionicons name="calendar-outline" size={15} color={colors.icon} />
          <AppText variant="caption" color="textSecondary">
            {dateStr}
          </AppText>
        </View>
        {locationLine ? (
          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={15} color={colors.icon} />
            <AppText variant="caption" color="textMuted" numberOfLines={1}>
              {locationLine}
            </AppText>
          </View>
        ) : null}
        <View style={styles.priceRow}>
          <AppText variant="caption" color="textMuted">
            {t('common.from')}
          </AppText>
          <AppText variant="h3" color="primaryLight">
            {price}
          </AppText>
        </View>
      </View>
    </Pressable>
  );
}

function createStyles(colors: ThemeColors) {
  const shadows = createShadows(colors);
  const isLight = colors.bgRgb.r > 200;
  return StyleSheet.create({
    card: {
      flexDirection: 'row',
      borderRadius: radii.xl,
      overflow: 'hidden',
      backgroundColor: colors.card,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      marginBottom: spacing.md,
      ...(isLight ? shadows.sm : shadows.md),
    },
    thumbWrap: {
      width: 120,
      minHeight: 140,
      position: 'relative',
    },
    thumb: { ...StyleSheet.absoluteFillObject },
    thumbPlaceholder: { backgroundColor: colors.surfaceMuted },
    badge: {
      position: 'absolute',
      top: spacing.sm,
      start: spacing.sm,
    },
    fav: {
      position: 'absolute',
      top: spacing.sm,
      end: spacing.sm,
    },
    body: {
      flex: 1,
      padding: spacing.md,
      gap: 6,
      justifyContent: 'center',
    },
    metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    priceRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  });
}
