import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/ui/AppText';
import { PrimaryButton } from '@/components/ui/Button';
import { Screen } from '@/components/layout/Screen';
import { EventCard } from '@/components';
import { useFormatMoney } from '@/hooks/useFormatMoney';
import { useTranslation } from '@/i18n/useTranslation';
import {
  catalogRouteSegment,
  loadFavoritePreview,
  type FavoritePreview,
} from '@/services/favorites/loadFavoritePreview';
import { MOCK_EVENTS } from '@/services/mock';
import { useFavoritesStore } from '@/store/favoritesStore';
import { spacing, useThemeColors } from '@/theme';
import type { ThemeColors } from '@/theme/palettes';
import { chevronForwardTrailing } from '@/utils/rtl';

export default function FavoritesTabScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { t } = useTranslation();
  const { formatMoney } = useFormatMoney();
  const keys = useFavoritesStore((s) => s.keys);

  const entries = useMemo(() => {
    return Object.keys(keys).map((key) => {
      const colon = key.indexOf(':');
      return {
        type: colon >= 0 ? key.slice(0, colon) : '',
        refId: colon >= 0 ? key.slice(colon + 1) : '',
        key,
      };
    });
  }, [keys]);

  const [previews, setPreviews] = useState<Record<string, FavoritePreview>>({});

  useEffect(() => {
    if (entries.length === 0) {
      setPreviews({});
      return;
    }
    const next: Record<string, FavoritePreview> = {};
    for (const e of entries) {
      if (!e.refId) continue;
      const p = loadFavoritePreview(e.type, e.refId);
      if (p) next[e.key] = p;
    }
    setPreviews(next);
  }, [entries]);

  if (entries.length === 0) {
    return (
      <Screen scroll contentStyle={styles.pad}>
        <AppText variant="h1" color="text" style={styles.title}>
          {t('favorites.title')}
        </AppText>
        <AppText variant="body" color="textSecondary" style={styles.sub}>
          {t('favorites.subtitle')}
        </AppText>
        <AppText variant="caption" color="textMuted" style={styles.mockNote}>
          {t('favorites.mockNote')}
        </AppText>
        {MOCK_EVENTS.slice(0, 3).map((e) => (
          <EventCard key={e.id} event={e} />
        ))}
        <PrimaryButton title={t('favorites.discover')} onPress={() => router.push('/(tabs)/explore')} />
      </Screen>
    );
  }

  return (
    <Screen scroll contentStyle={styles.pad}>
      <AppText variant="h1" color="text" style={styles.title}>
        {t('favorites.title')}
      </AppText>
      <AppText variant="body" color="textSecondary" style={styles.sub}>
        {t('favorites.subtitleLive')}
      </AppText>
      {entries.map((e) => {
        const p = previews[e.key];
        const segment = catalogRouteSegment(e.type);
        const href = segment === 'explore' ? '/(tabs)/explore' : `/${segment}/${e.refId}`;
        return (
          <Pressable
            key={e.key}
            style={({ pressed }) => [styles.row, pressed && { opacity: 0.92 }]}
            onPress={() => router.push(href)}
          >
            {p ? (
              <Image source={{ uri: p.imageUrl }} style={styles.thumb} contentFit="cover" />
            ) : (
              <View style={[styles.thumb, styles.thumbPh]}>
                <Ionicons name="image-outline" size={28} color={colors.textMuted} />
              </View>
            )}
            <View style={{ flex: 1, gap: 4 }}>
              <AppText variant="bodyMedium" color="text" numberOfLines={2}>
                {p?.title ?? t('favorites.unresolvedTitle')}
              </AppText>
              <AppText variant="caption" color="textMuted" numberOfLines={2}>
                {p?.subtitle ? p.subtitle : t('favorites.tapToOpen')}
              </AppText>
              {p?.priceFrom != null && p.currency ? (
                <AppText variant="price" color="accent">
                  {t('common.from')} {formatMoney(p.priceFrom, p.currency)}
                </AppText>
              ) : null}
            </View>
            <Ionicons name={chevronForwardTrailing()} size={20} color={colors.textMuted} />
          </Pressable>
        );
      })}
      <PrimaryButton title={t('favorites.discover')} onPress={() => router.push('/(tabs)/explore')} />
    </Screen>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    pad: { paddingTop: spacing.md, gap: spacing.md },
    title: { marginBottom: spacing.xs },
    sub: { lineHeight: 22, marginBottom: spacing.sm },
    mockNote: { marginBottom: spacing.sm, lineHeight: 18 },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      padding: spacing.md,
      backgroundColor: colors.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    thumb: { width: 72, height: 72, borderRadius: 12, backgroundColor: colors.surfaceMuted },
    thumbPh: { alignItems: 'center', justifyContent: 'center' },
  });
}
