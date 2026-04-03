import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/ui/AppText';
import { PrimaryButton } from '@/components/ui/Button';
import { EmptyState } from '@/components/feedback/EmptyState';
import { Screen } from '@/components/layout/Screen';
import { EventCard } from '@/components';
import { useFormatMoney } from '@/hooks/useFormatMoney';
import { useTranslation } from '@/i18n/useTranslation';
import { useIntegrationMode } from '@/hooks/useIntegrationMode';
import {
  catalogRouteSegment,
  loadFavoritePreview,
  type FavoritePreview,
} from '@/services/favorites/loadFavoritePreview';
import { isNumericCatalogId } from '@/services/catalog/mapCatalog';
import { MOCK_EVENTS } from '@/services/mock';
import { hydrateFavoritesFromApi, useFavoritesStore } from '@/store/favoritesStore';
import { spacing, useThemeColors } from '@/theme';
import type { ThemeColors } from '@/theme/palettes';
import { chevronForwardTrailing } from '@/utils/rtl';

export default function FavoritesTabScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { t } = useTranslation();
  const { formatMoney } = useFormatMoney();
  const { api, authenticated, liveAccount } = useIntegrationMode();
  const keys = useFavoritesStore((s) => s.keys);
  const listHydrating = useFavoritesStore((s) => s.listHydrating);

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
  const [previewsLoading, setPreviewsLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (liveAccount) {
        void hydrateFavoritesFromApi();
      }
    }, [liveAccount]),
  );

  useEffect(() => {
    if (!liveAccount || entries.length === 0) {
      setPreviews({});
      setPreviewsLoading(false);
      return;
    }
    let cancelled = false;
    setPreviewsLoading(true);
    (async () => {
      const next: Record<string, FavoritePreview> = {};
      await Promise.all(
        entries.map(async (e) => {
          if (!isNumericCatalogId(e.refId)) return;
          const p = await loadFavoritePreview(e.type, Number(e.refId));
          if (p && !cancelled) next[e.key] = p;
        }),
      );
      if (!cancelled) {
        setPreviews(next);
        setPreviewsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [liveAccount, entries]);

  if (api && !authenticated) {
    return (
      <Screen scroll contentStyle={styles.pad}>
        <AppText variant="h1" color="text" style={styles.title}>
          {t('favorites.title')}
        </AppText>
        <EmptyState
          icon="heart-outline"
          title={t('favorites.signInTitle')}
          description={t('favorites.signInDesc')}
          actionLabel={t('entry.loginSignup')}
          onAction={() => router.push('/(auth)/login')}
        />
      </Screen>
    );
  }

  if (!api) {
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

  if (listHydrating && entries.length === 0) {
    return (
      <Screen scroll contentStyle={styles.pad}>
        <AppText variant="h1" color="text" style={styles.title}>
          {t('favorites.title')}
        </AppText>
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
          <AppText variant="caption" color="textMuted" style={{ marginTop: spacing.md }}>
            {t('common.loading')}
          </AppText>
        </View>
      </Screen>
    );
  }

  if (entries.length === 0) {
    return (
      <Screen scroll contentStyle={styles.pad}>
        <AppText variant="h1" color="text" style={styles.title}>
          {t('favorites.title')}
        </AppText>
        <EmptyState
          icon="heart-outline"
          title={t('favorites.emptyTitle')}
          description={t('favorites.emptyDesc')}
          actionLabel={t('favorites.discover')}
          onAction={() => router.push('/(tabs)/explore')}
        />
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
      {previewsLoading ? (
        <View style={styles.inlineLoad}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : null}
      {entries.map((e) => {
        const p = previews[e.key];
        const segment = catalogRouteSegment(e.type);
        const href =
          segment === 'explore' ? '/(tabs)/explore' : `/${segment}/${e.refId}`;
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
                {p?.subtitle
                  ? p.subtitle
                  : isNumericCatalogId(e.refId)
                    ? t('favorites.tapToOpen')
                    : t('favorites.mockItemHint')}
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
    center: { paddingVertical: 48, alignItems: 'center' },
    inlineLoad: { paddingVertical: spacing.sm, alignItems: 'center' },
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
