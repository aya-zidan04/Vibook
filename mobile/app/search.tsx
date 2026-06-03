import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/layout/Screen';
import { HeaderSeparationChrome } from '@/components/layout/HeaderSeparationChrome';
import { SearchBar } from '@/components/layout/SearchBar';
import { SectionHeader } from '@/components/layout/SectionHeader';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { AppText } from '@/components/ui/AppText';
import { Badge } from '@/components/ui/Badge';
import { NavigationChevronBack } from '@/components/ui/NavigationChevron';
import { useFormatMoney } from '@/hooks/useFormatMoney';
import { filterEventsBySegment, useEventSearch } from '@/hooks/useEventSearch';
import { useTranslation } from '@/i18n/useTranslation';
import { mapApiError } from '@/utils/mapApiError';
import { useAppStore } from '@/store/appStore';
import { loadReferenceData, useReferenceStore } from '@/store/referenceStore';
import { useSearchStore } from '@/store/searchStore';
import { suggestedTagsFromEvents, trendingFromCategories } from '@/utils/searchTrending';
import { navigationRowStyle } from '@/utils/rtl';
import { radii, spacing, useThemeColors } from '@/theme';
import type { ThemeColors } from '@/theme/palettes';
import type { EventItem } from '@/types';
import { localizedCityLabel } from '@/utils/governorateLabels';

type Segment = 'all' | 'events' | 'restaurants';

const SEGMENTS: { key: Segment; labelKey: string }[] = [
  { key: 'all', labelKey: 'search.all' },
  { key: 'events', labelKey: 'search.events' },
  { key: 'restaurants', labelKey: 'search.dining' },
];

export default function SearchScreen() {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const params = useLocalSearchParams<{ q?: string }>();
  const { t, locale, isRTL } = useTranslation();
  const { formatMoney } = useFormatMoney();
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const selectedCityId = useAppStore((s) => s.selectedCityId);
  const categories = useReferenceStore((s) => s.categories);
  const refStatus = useReferenceStore((s) => s.status);

  const filters = useSearchStore((s) => s.filters);
  const recentQueries = useSearchStore((s) => s.recentQueries);
  const addRecentQuery = useSearchStore((s) => s.addRecentQuery);
  const removeRecentQuery = useSearchStore((s) => s.removeRecentQuery);

  const [q, setQ] = useState(typeof params.q === 'string' ? params.q : '');
  const [seg, setSeg] = useState<Segment>('all');

  const governorateId = useMemo(() => {
    const n = Number(selectedCityId);
    return Number.isFinite(n) ? n : undefined;
  }, [selectedCityId]);

  const hasActiveQuery = q.trim().length > 0;
  const hasActiveFilters =
    filters.categoryIds.length > 0 || filters.subcategoryIds.length > 0;
  const showResults = hasActiveQuery || hasActiveFilters;

  const searchEnabled = showResults;

  const { events, loading, error, retry } = useEventSearch(
    q,
    filters,
    governorateId,
    searchEnabled,
  );

  const { events: browseEvents } = useEventSearch('', filters, governorateId, !showResults);

  const filteredEvents = useMemo(
    () => filterEventsBySegment(events, seg),
    [events, seg],
  );

  const trending = useMemo(
    () => trendingFromCategories(categories, locale),
    [categories, locale],
  );

  const suggestedTags = useMemo(
    () => suggestedTagsFromEvents(browseEvents.length > 0 ? browseEvents : events, locale),
    [browseEvents, events, locale],
  );

  useEffect(() => {
    if (refStatus === 'idle') void loadReferenceData();
  }, [refStatus]);

  useEffect(() => {
    if (!showResults || loading || error) return;
    if (q.trim().length >= 2) addRecentQuery(q);
  }, [showResults, loading, error, q, addRecentQuery]);

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/explore');
  };

  const runSearch = useCallback((term: string) => {
    setQ(term);
  }, []);

  const openFilters = () => router.push('/filters');

  const segmentEmpty =
    showResults &&
    !loading &&
    !error &&
    isAuthenticated &&
    events.length > 0 &&
    filteredEvents.length === 0;

  const fullyEmpty =
    showResults && !loading && !error && isAuthenticated && events.length === 0;

  return (
    <Screen scroll contentStyle={styles.pad}>
      <HeaderSeparationChrome>
        <View style={[styles.header, isRTL ? styles.headerRtl : styles.headerLtr]}>
          <View style={[styles.headerGroup, navigationRowStyle(isRTL)]}>
            <Pressable
              onPress={goBack}
              hitSlop={12}
              style={styles.back}
              accessibilityRole="button"
              accessibilityLabel={t('common.a11yGoBack')}
            >
              <NavigationChevronBack size={28} color={colors.text} />
            </Pressable>
            <AppText variant="h1" color="text" style={styles.title}>
              {t('search.title')}
            </AppText>
          </View>
        </View>
      </HeaderSeparationChrome>

      <SearchBar
        editable
        autoFocus
        value={q}
        onChangeText={setQ}
        placeholder={t('search.placeholder')}
        onFilterPress={openFilters}
      />

      {hasActiveFilters ? (
        <AppText variant="caption" color="rowDescription" style={styles.filtersHint}>
          {t('search.filtersActive')}
        </AppText>
      ) : null}

      <View style={styles.segWrap}>
        {SEGMENTS.map(({ key, labelKey }) => (
          <Pressable
            key={key}
            onPress={() => setSeg(key)}
            style={[styles.segBtn, seg === key && styles.segOn]}
          >
            <AppText variant="label" color={seg === key ? 'text' : 'textMuted'}>
              {t(labelKey)}
            </AppText>
          </Pressable>
        ))}
      </View>

      {!isAuthenticated ? (
        <View style={styles.centerBlock}>
          <EmptyState
            icon="lock-closed-outline"
            title={t('search.signInTitle')}
            description={t('search.signInDesc')}
            actionLabel={t('auth.loginCta')}
            onAction={() => router.push('/login')}
          />
        </View>
      ) : !showResults ? (
        <>
          <SectionHeader title={t('search.recent')} />
          {recentQueries.length === 0 ? (
            <AppText variant="body" color="textMuted" style={styles.emptyHint}>
              {t('search.noRecent')}
            </AppText>
          ) : (
            recentQueries.map((term) => (
              <Pressable key={term} style={styles.recentRow} onPress={() => runSearch(term)}>
                <Ionicons name="time-outline" size={18} color={colors.icon} />
                <AppText variant="body" color="textSecondary" style={styles.recentLabel}>
                  {term}
                </AppText>
                <Pressable
                  onPress={() => removeRecentQuery(term)}
                  hitSlop={8}
                  accessibilityLabel={t('search.removeRecent')}
                >
                  <Ionicons name="close" size={16} color={colors.icon} />
                </Pressable>
              </Pressable>
            ))
          )}

          {trending.length > 0 ? (
            <>
              <SectionHeader title={t('search.popular')} />
              <View style={styles.tags}>
                {trending.map((label) => (
                  <Pressable key={label} style={styles.tag} onPress={() => runSearch(label)}>
                    <AppText variant="caption" color="rowDescription">
                      {label}
                    </AppText>
                  </Pressable>
                ))}
              </View>
            </>
          ) : null}

          {suggestedTags.length > 0 ? (
            <>
              <SectionHeader title={t('search.tags')} />
              <View style={styles.tags}>
                {suggestedTags.map((label) => (
                  <Pressable key={label} style={styles.tag} onPress={() => runSearch(label)}>
                    <AppText variant="caption" color="textSecondary">
                      #{label}
                    </AppText>
                  </Pressable>
                ))}
              </View>
            </>
          ) : null}
        </>
      ) : (
        <>
          <SectionHeader
            title={t('search.results')}
            subtitle={hasActiveQuery ? `${t('search.query')}: “${q.trim()}”` : t('search.filtersActive')}
          />

          {loading ? (
            <View style={styles.centerBlock}>
              <ActivityIndicator size="large" color={colors.primary} />
              <AppText variant="caption" color="textMuted" style={styles.loadingText}>
                {t('common.loading')}
              </AppText>
            </View>
          ) : error ? (
            <ErrorState
              title={t('search.loadError')}
              message={mapApiError(error, t)}
              onRetry={retry}
            />
          ) : fullyEmpty ? (
            <EmptyState
              icon="search-outline"
              title={t('search.noMatches')}
              description={t('search.noMatchesDesc')}
              actionLabel={t('search.clear')}
              onAction={() => {
                setQ('');
                useSearchStore.getState().resetFilters();
              }}
            />
          ) : segmentEmpty ? (
            <EmptyState
              icon="filter-outline"
              title={t('search.segmentEmpty')}
              description={t('search.segmentEmptyDesc')}
              actionLabel={t('search.all')}
              onAction={() => setSeg('all')}
            />
          ) : (
            <View style={styles.results}>
              {filteredEvents.map((e) => (
                <EventResultRow
                  key={e.id}
                  event={e}
                  locale={locale}
                  formatMoney={formatMoney}
                  onPress={() => router.push(`/event/${e.id}`)}
                />
              ))}
            </View>
          )}
        </>
      )}

      <Pressable style={styles.filterFab} onPress={openFilters}>
        <Ionicons name="options" size={22} color={colors.icon} />
        <AppText variant="label" color="text">
          {t('common.filters')}
        </AppText>
      </Pressable>
    </Screen>
  );
}

function EventResultRow({
  event,
  locale,
  formatMoney,
  onPress,
}: {
  event: EventItem;
  locale: 'en' | 'ar';
  formatMoney: (amount: number, currency: string) => string;
  onPress: () => void;
}) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const cities = useReferenceStore((s) => s.cities);
  const cityLabel = localizedCityLabel(event.cityId, locale, cities);
  const metaLine = [event.venueName, cityLabel].filter(Boolean).join(' · ');

  return (
    <Pressable style={styles.resultCard} onPress={onPress}>
      <Image source={{ uri: event.imageUrl }} style={styles.resultImg} contentFit="cover" />
      <View style={styles.resultBody}>
        <View style={styles.resultTop}>
          <AppText variant="h3" color="text" numberOfLines={2}>
            {event.title}
          </AppText>
          {event.badge ? <Badge tone={event.badge} /> : null}
        </View>
        {metaLine ? (
          <AppText variant="caption" color="textMuted">
            {metaLine}
          </AppText>
        ) : null}
        <AppText variant="h3" color="primaryLight" style={styles.price}>
          {formatMoney(event.priceFrom, event.currency)}
        </AppText>
      </View>
    </Pressable>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    pad: { paddingTop: spacing.md },
    header: {
      width: '100%',
      marginBottom: spacing.sm,
    },
    headerLtr: {
      alignItems: 'flex-start',
    },
    headerRtl: {
      alignItems: 'flex-end',
    },
    headerGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    back: {
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    title: {
      flexShrink: 0,
    },
    filtersHint: {
      marginTop: spacing.xs,
    },
    segWrap: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
      marginVertical: spacing.md,
    },
    segBtn: {
      paddingHorizontal: spacing.lg,
      paddingVertical: 10,
      borderRadius: radii.full,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    segOn: {
      borderColor: colors.primary,
      backgroundColor: colors.primaryMuted,
    },
    emptyHint: {
      marginBottom: spacing.lg,
    },
    recentRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      paddingVertical: spacing.sm,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    recentLabel: {
      flex: 1,
    },
    tags: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
      marginBottom: spacing.lg,
    },
    tag: {
      paddingHorizontal: spacing.md,
      paddingVertical: 8,
      borderRadius: radii.full,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    centerBlock: {
      alignItems: 'center',
      paddingVertical: spacing.xxxl,
      gap: spacing.md,
    },
    loadingText: {
      marginTop: spacing.sm,
    },
    results: { gap: spacing.md, marginBottom: spacing.xxxl },
    resultCard: {
      flexDirection: 'row',
      backgroundColor: colors.card,
      borderRadius: radii.xl,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.border,
    },
    resultImg: { width: 100, height: 110 },
    resultBody: { flex: 1, padding: spacing.md, justifyContent: 'center', gap: 4 },
    resultTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: spacing.sm,
    },
    price: { marginTop: 4 },
    filterFab: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      alignSelf: 'center',
      backgroundColor: colors.surfaceHover,
      paddingHorizontal: spacing.xl,
      paddingVertical: 12,
      borderRadius: radii.full,
      borderWidth: 1,
      borderColor: colors.border,
      marginTop: spacing.lg,
      marginBottom: spacing.xxxl,
    },
  });
}
