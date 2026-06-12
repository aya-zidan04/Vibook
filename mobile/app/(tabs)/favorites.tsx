import { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { listMyFavorites } from '@/api/favoritesApi';
import { mapApiError } from '@/utils/mapApiError';
import { AppText } from '@/components/ui/AppText';
import { PrimaryButton } from '@/components/ui/Button';
import { NavigationChevronForward } from '@/components/ui/NavigationChevron';
import { Screen } from '@/components/layout/Screen';
import { useFormatMoney } from '@/hooks/useFormatMoney';
import { useTranslation } from '@/i18n/useTranslation';
import { favoriteEventRowToEventItem } from '@/services/api/eventMap';
import { useFavoritesStore } from '@/store/favoritesStore';
import { useAppStore } from '@/store/appStore';
import type { EventItem } from '@/types';
import { spacing, useThemeColors } from '@/theme';
import type { ThemeColors } from '@/theme/palettes';

export default function FavoritesTabScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { t, locale } = useTranslation();
  const { formatMoney } = useFormatMoney();
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const [rows, setRows] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown | null>(null);

  const load = useCallback(() => {
    if (!isAuthenticated) {
      setRows([]);
      setError(null);
      return;
    }
    setLoading(true);
    void (async () => {
      try {
        const page = await listMyFavorites(0, 50);
        setRows(page.content.map(favoriteEventRowToEventItem));
        useFavoritesStore.getState().mergeFavoriteEventIds(page.content.map((row) => row.id));
        setError(null);
      } catch (e) {
        setRows([]);
        setError(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [isAuthenticated, t]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const headerEmpty = (
    <View style={styles.tabHeader}>
      <AppText variant="h1" color="text" style={styles.title}>
        {t('favorites.title')}
      </AppText>
      <AppText variant="body" color="textSecondary" style={styles.sub}>
        {t('favorites.subtitle')}
      </AppText>
    </View>
  );

  const headerList = (
    <View style={styles.tabHeader}>
      <AppText variant="h1" color="text" style={styles.title}>
        {t('favorites.title')}
      </AppText>
    </View>
  );

  if (!isAuthenticated) {
    return (
      <Screen scroll contentStyle={styles.pad} header={headerEmpty}>
        <AppText variant="caption" color="textMuted" style={styles.hintNote}>
          {t('favorites.backendSignInHint')}
        </AppText>
        <PrimaryButton sheet title={t('auth.loginCta')} onPress={() => router.push('/login')} />
      </Screen>
    );
  }

  if (loading && rows.length === 0) {
    return (
      <Screen scroll contentStyle={styles.pad} header={headerList}>
        <AppText variant="caption" color="textMuted">
          {t('common.loading')}
        </AppText>
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen scroll contentStyle={styles.pad} header={headerList}>
        <AppText variant="body" color="textSecondary">
          {mapApiError(error, t)}
        </AppText>
        <PrimaryButton title={t('common.retry')} onPress={load} />
      </Screen>
    );
  }

  if (rows.length === 0) {
    return (
      <Screen scroll contentStyle={styles.pad} header={headerEmpty}>
        <AppText variant="caption" color="textMuted" style={styles.hintNote}>
          {t('favorites.emptyBackend')}
        </AppText>
        <PrimaryButton title={t('favorites.discover')} onPress={() => router.push('/(tabs)/explore')} />
      </Screen>
    );
  }

  return (
    <Screen scroll contentStyle={styles.pad} header={headerList}>
      {rows.map((e) => {
        const cityLine = e.venueName || e.cityId;
        return (
          <Pressable
            key={e.id}
            style={({ pressed }) => [styles.row, pressed && { opacity: 0.92 }]}
            onPress={() => router.push(`/event/${e.id}`)}
          >
            <Image source={{ uri: e.imageUrl }} style={styles.thumb} contentFit="cover" />
            <View style={{ flex: 1, gap: 4 }}>
              <AppText variant="body-em" color="text" numberOfLines={2}>
                {e.title}
              </AppText>
              <AppText variant="caption" color="textMuted" numberOfLines={2}>
                {cityLine}
              </AppText>
              <AppText variant="h3" color="primaryLight">
                {t('common.from')} {formatMoney(e.priceFrom, e.currency)}
              </AppText>
            </View>
            <NavigationChevronForward size={20} color={colors.icon} />
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
    tabHeader: { paddingBottom: spacing.sm },
    title: { marginBottom: spacing.xs },
    sub: { lineHeight: 22 },
    hintNote: { marginBottom: spacing.sm, lineHeight: 18 },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      padding: spacing.md,
      backgroundColor: colors.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    thumb: { width: 72, height: 72, borderRadius: 12, backgroundColor: colors.surfaceMuted },
  });
}
