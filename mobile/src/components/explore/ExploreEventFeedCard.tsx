import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/ui/AppText';
import { Badge } from '@/components/ui/Badge';
import type { EventItem } from '@/types';
import { fadeFromBackground, radii, spacing, useThemeColors } from '@/theme';
import type { ThemeColors } from '@/theme/palettes';
import { useFormatMoney } from '@/hooks/useFormatMoney';
import { useTranslation } from '@/i18n/useTranslation';

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
  const { t, locale } = useTranslation();
  const { formatMoney } = useFormatMoney();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const start = new Date(event.startAt);
  const dateStr =
    locale === 'ar'
      ? start.toLocaleString('ar-JO', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
      : start.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

  const price = formatMoney(event.priceFrom, event.currency);

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && { opacity: 0.94 }]}>
      <View style={styles.thumbWrap}>
        <Image source={{ uri: event.imageUrl }} style={styles.thumb} contentFit="cover" />
        <LinearGradient colors={['transparent', fadeFromBackground(colors, 0.55)]} style={StyleSheet.absoluteFill} />
        {event.badge ? (
          <View style={styles.badge}>
            <Badge tone={event.badge} />
          </View>
        ) : null}
      </View>
      <View style={styles.body}>
        <AppText variant="h3" color="text" numberOfLines={2}>
          {event.title}
        </AppText>
        <View style={styles.metaRow}>
          <Ionicons name="calendar-outline" size={15} color={colors.textMuted} />
          <AppText variant="caption" color="textSecondary">
            {dateStr}
          </AppText>
        </View>
        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={15} color={colors.textMuted} />
          <AppText variant="caption" color="textMuted" numberOfLines={1}>
            {event.venueName} · {cityName}
          </AppText>
        </View>
        <View style={styles.priceRow}>
          <AppText variant="caption" color="textMuted">
            {t('common.from')}
          </AppText>
          <AppText variant="price" color="accent">
            {price}
          </AppText>
        </View>
      </View>
    </Pressable>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    card: {
      flexDirection: 'row',
      borderRadius: radii.xl,
      overflow: 'hidden',
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: spacing.md,
    },
    thumbWrap: {
      width: 120,
      minHeight: 140,
      position: 'relative',
    },
    thumb: { ...StyleSheet.absoluteFillObject },
    badge: {
      position: 'absolute',
      top: spacing.sm,
      end: spacing.md,
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
