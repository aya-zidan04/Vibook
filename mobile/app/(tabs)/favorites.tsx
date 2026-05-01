import { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { listMyFavorites } from '@/api/favoritesApi';
import { ApiError } from '@/api/http';
import { AppText } from '@/components/ui/AppText';
import { PrimaryButton } from '@/components/ui/Button';
import { Screen } from '@/components/layout/Screen';
import { useFormatMoney } from '@/hooks/useFormatMoney';
import { useTranslation } from '@/i18n/useTranslation';
import { favoriteEventRowToEventItem } from '@/services/api/eventMap';
import { useAppStore } from '@/store/appStore';
import type { EventItem } from '@/types';
import { spacing, useThemeColors } from '@/theme';
import type { ThemeColors } from '@/theme/palettes';
import { chevronForwardTrailing } from '@/utils/rtl';

export default function FavoritesTabScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { t, locale } = useTranslation();
  const { formatMoney } = useFormatMoney();
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const [rows, setRows] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        setError(null);
      } catch (e) {
        setRows([]);
        setError(e instanceof ApiError ? e.message : t('common.error'));
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
      <AppText variant="body" color="textSecondary" style={styles.sub}>
        {t('favorites.subtitleLive')}
      </AppText>
    </View>
  );

  if (!isAuthenticated) {
    return (
      <Screen scroll contentStyle={styles.pad} header={headerEmpty}>
        <AppText variant="caption" color="textMuted" style={styles.mockNote}>
          {t('favorites.backendSignInHint')}
        </AppText>
        <PrimaryButton title={t('auth.loginCta')} onPress={() => router.push('/login')} />
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
          {error}
        </AppText>
        <PrimaryButton title={t('common.retry')} onPress={load} />
      </Screen>
    );
  }

  if (rows.length === 0) {
    return (
      <Screen scroll contentStyle={styles.pad} header={headerEmpty}>
        <AppText variant="caption" color="textMuted" style={styles.mockNote}>
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
              <AppText variant="bodyMedium" color="text" numberOfLines={2}>
                {e.title}
              </AppText>
              <AppText variant="caption" color="textMuted" numberOfLines={2}>
                {cityLine}
              </AppText>
              <AppText variant="price" color="accent">
                {t('common.from')} {formatMoney(e.priceFrom, e.currency)}
              </AppText>
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
    tabHeader: { paddingTop: spacing.md, paddingBottom: spacing.sm },
    title: { marginBottom: spacing.xs },
    sub: { lineHeight: 22 },
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
  });
}
