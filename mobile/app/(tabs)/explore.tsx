import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { searchEvents } from '@/api/eventsApi';
import { AppText } from '@/components/ui/AppText';
import { PrimaryButton } from '@/components/ui/Button';
import {
  ExploreCategoryStrip,
  ExploreEventFeedCard,
  ExploreHeader,
  ExploreHeroCarousel,
  ExplorePromoGrid,
  type HeroSlideItem,
  type PromoTile,
} from '@/components/explore';
import { useTranslation } from '@/i18n/useTranslation';
import type { CatalogRouter } from '@/services/catalog/mapCatalog';
import type { ExploreMainCategory, ExploreSubcategory } from '@/types/exploreCategories';
import { useCatalogSubcategories } from '@/hooks/useCatalogSubcategories';
import { useCuratedExploreEvents } from '@/hooks/useCuratedExploreEvents';
import { backendIconToOutline } from '@/services/reference/mapReference';
import { businessEventSummaryToEventItem } from '@/services/api/eventMap';
import { useAppStore } from '@/store/appStore';
import { loadReferenceData, useReferenceStore } from '@/store/referenceStore';
import { localizedCityLabel } from '@/utils/governorateLabels';
import { localizedCategoryLabel, localizedSubcategoryLabel } from '@/utils/taxonomyLabels';
import type { EventItem } from '@/types';
import { pickCuratedHeroEvents } from '@/utils/exploreCurated';
import { radii, spacing, useThemeColors } from '@/theme';
import type { ThemeColors } from '@/theme/palettes';

function promoFromEvents(events: EventItem[], router: CatalogRouter, t: (k: string) => string): {
  large: PromoTile;
  stackTop: PromoTile;
  stackBottom: PromoTile;
  rowLeft: PromoTile;
  rowRight: PromoTile;
} | null {
  if (events.length < 5) return null;
  const e = events;
  return {
    large: {
      id: `p-${e[0].id}`,
      imageUrl: e[0].imageUrl,
      title: e[0].title,
      subtitle: (() => {
        const raw = (e[0].description || e[0].venueName || '').trim();
        return raw.length > 72 ? `${raw.slice(0, 72)}…` : raw;
      })(),
      kind: 'event',
      kindLabel: t('explore.event'),
      onPress: () => router.push(`/event/${e[0].id}`),
    },
    stackTop: {
      id: `p-${e[1].id}`,
      imageUrl: e[1].imageUrl,
      title: e[1].title,
      subtitle: e[1].venueName,
      kind: 'event',
      kindLabel: t('explore.event'),
      onPress: () => router.push(`/event/${e[1].id}`),
    },
    stackBottom: {
      id: `p-${e[2].id}`,
      imageUrl: e[2].imageUrl,
      title: e[2].title,
      subtitle: e[2].venueName,
      kind: 'event',
      kindLabel: t('explore.event'),
      onPress: () => router.push(`/event/${e[2].id}`),
    },
    rowLeft: {
      id: `p-${e[3].id}`,
      imageUrl: e[3].imageUrl,
      title: e[3].title,
      subtitle: e[3].venueName,
      kind: 'event',
      kindLabel: t('explore.featured'),
      onPress: () => router.push(`/event/${e[3].id}`),
    },
    rowRight: {
      id: `p-${e[4].id}`,
      imageUrl: e[4].imageUrl,
      title: e[4].title,
      subtitle: e[4].venueName,
      kind: 'event',
      kindLabel: t('explore.event'),
      onPress: () => router.push(`/event/${e[4].id}`),
    },
  };
}

export default function ExploreScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { t, locale } = useTranslation();
  const r = router as CatalogRouter;
  const categories = useReferenceStore((s) => s.categories);
  const refStatus = useReferenceStore((s) => s.status);
  const catalogFromApi = useReferenceStore((s) => s.catalogFromApi);
  const selectedCityId = useAppStore((s) => s.selectedCityId);
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const cities = useReferenceStore((s) => s.cities);

  const subsByParentRaw = useCatalogSubcategories(categories);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string | null>(null);
  const { events: curatedEvents, loading: loadingCurated } = useCuratedExploreEvents(selectedCityId);
  const [apiEvents, setApiEvents] = useState<EventItem[]>([]);
  const [loadingFeed, setLoadingFeed] = useState(false);
  /** Last non-empty curated list — keeps hero mounted if a transient empty state occurs. */
  const stableCuratedRef = useRef<EventItem[]>([]);

  useEffect(() => {
    if (refStatus === 'idle') void loadReferenceData();
  }, [refStatus]);

  const exploreCategories = useMemo<ExploreMainCategory[]>(() => {
    return categories.map((c) => ({
      id: c.id,
      name: localizedCategoryLabel(c.slug, 'en', c.labelEn),
      nameAr: localizedCategoryLabel(c.slug, 'ar', c.labelAr),
      icon: backendIconToOutline(c.icon),
      subcategories: (subsByParentRaw[c.id] ?? []).map((sub) => ({
        id: sub.id,
        parentId: sub.parentId,
        slug: sub.slug,
        name: localizedSubcategoryLabel(sub.slug, 'en', sub.name),
        nameAr: localizedSubcategoryLabel(sub.slug, 'ar', sub.nameAr),
      })),
    }));
  }, [categories, subsByParentRaw, locale]);

  useEffect(() => {
    if (exploreCategories.length === 0) return;
    if (!exploreCategories.some((c) => c.id === selectedCategoryId)) {
      setSelectedCategoryId(exploreCategories[0].id);
      setSelectedSubcategoryId(null);
    }
  }, [exploreCategories, selectedCategoryId]);

  // Happening soon feed only — category / subcategory scoped.
  useEffect(() => {
    let cancelled = false;
    setLoadingFeed(true);
    void (async () => {
      try {
        const gid = Number(selectedCityId);
        const cat = selectedCategoryId ? Number(selectedCategoryId) : undefined;
        const sub = selectedSubcategoryId ? Number(selectedSubcategoryId) : undefined;
        const page = await searchEvents({
          page: 0,
          size: 40,
          governorateId: Number.isFinite(gid) ? gid : undefined,
          categoryId: sub == null ? cat : undefined,
          subcategoryId: sub ?? undefined,
        });
        if (cancelled) return;
        setApiEvents(page.content.map(businessEventSummaryToEventItem));
      } catch {
        // Keep prior feed on error; do not touch curated state.
      } finally {
        if (!cancelled) setLoadingFeed(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedCityId, selectedCategoryId, selectedSubcategoryId]);

  const curatedForHero =
    curatedEvents.length > 0 ? curatedEvents : stableCuratedRef.current;

  useEffect(() => {
    if (curatedEvents.length > 0) {
      stableCuratedRef.current = curatedEvents;
    }
  }, [curatedEvents]);

  const heroEvents = useMemo(() => pickCuratedHeroEvents(curatedForHero), [curatedForHero]);

  const heroSlides: HeroSlideItem[] = useMemo(() => {
    return heroEvents.map((e, i) => ({
      id: `hero-${e.id}-${i}`,
      imageUrl: e.imageUrl,
      title: e.title,
      subtitle: e.venueName,
      eyebrow: e.reviewCount > 0 && e.rating > 0 ? t('explore.featured') : t('explore.event'),
      onPress: () => router.push(`/event/${e.id}`),
    }));
  }, [heroEvents, router, t]);

  const promo = useMemo(() => promoFromEvents(curatedForHero, r, t), [curatedForHero, r, t]);

  useEffect(() => {
    if (!__DEV__) return;
    console.log('[explore-curated]', {
      selectedCityId,
      selectedCategoryId,
      selectedSubcategoryId,
      curatedEventsLength: curatedEvents.length,
      apiEventsLength: apiEvents.length,
      heroEventsLength: heroEvents.length,
      curatedIds: curatedEvents.map((e) => e.id),
      heroIds: heroEvents.map((e) => e.id),
    });
  }, [
    selectedCityId,
    selectedCategoryId,
    selectedSubcategoryId,
    curatedEvents,
    apiEvents.length,
    heroEvents,
  ]);

  const selectedCategory = useMemo(
    () => exploreCategories.find((c) => c.id === selectedCategoryId),
    [exploreCategories, selectedCategoryId],
  );
  const selectedSubcategories = selectedCategory?.subcategories ?? [];

  const selectedCategoryLabel = selectedCategory
    ? locale === 'ar'
      ? selectedCategory.nameAr
      : selectedCategory.name
    : '';
  const selectedSubcategoryLabel = selectedSubcategoryId
    ? selectedSubcategories.find((sub) => sub.id === selectedSubcategoryId)
    : undefined;

  const showCatalogError = refStatus === 'error';
  const showCatalogWarning = refStatus === 'ready' && !catalogFromApi;
  const cityLabelForCard = (cityId: string) => localizedCityLabel(cityId, locale, cities);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.root}>
        <ExploreHeader
          brandLabel={t('common.brandDisplay')}
          onSearch={() => router.push('/search')}
          a11ySearch={t('common.search')}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
          style={styles.scrollView}
        >
          <View style={styles.sectionHead}>
            <AppText variant="overline" color="accentText" style={styles.heroEyebrow}>
              {t('explore.heroEyebrow')}
            </AppText>
            <AppText variant="h1" color="text">
              {t('explore.heroTitle')}
            </AppText>
          </View>

          {heroSlides.length > 0 ? (
            <ExploreHeroCarousel slides={heroSlides} />
          ) : loadingCurated ? (
            <ActivityIndicator color={colors.primary} style={{ marginVertical: spacing.lg }} />
          ) : null}

          {!isAuthenticated ? (
            <View style={[styles.guestBanner, styles.padH]}>
              <AppText variant="h3" color="text">
                {t('explore.guestEventsTitle')}
              </AppText>
              <AppText variant="body" color="textSecondary" style={styles.guestBannerBody}>
                {t('explore.guestEventsBody')}
              </AppText>
              <PrimaryButton
                title={t('auth.loginCta')}
                onPress={() => router.push('/login')}
                style={styles.guestBannerCta}
              />
            </View>
          ) : null}

          {promo ? (
            <>
              <View style={styles.sectionHead}>
                <AppText variant="h2" color="text">
                  {t('explore.promoTitle')}
                </AppText>
                <AppText variant="caption" color="textMuted">
                  {t('explore.promoSubtitle')}
                </AppText>
              </View>
              <View style={styles.horizontalPad}>
                <ExplorePromoGrid
                  large={promo.large}
                  stackTop={promo.stackTop}
                  stackBottom={promo.stackBottom}
                  rowLeft={promo.rowLeft}
                  rowRight={promo.rowRight}
                />
              </View>
            </>
          ) : null}

          <View style={[styles.sectionHead, styles.padH]}>
            <AppText variant="h2" color="text">
              {t('explore.categoriesTitle')}
            </AppText>
            {showCatalogError ? (
              <View style={styles.catalogError}>
                <AppText variant="caption" color="textMuted" style={styles.catalogWarn}>
                  {t('common.error')}
                </AppText>
                <PrimaryButton
                  title={t('common.retry')}
                  onPress={() => void loadReferenceData()}
                  style={styles.catalogRetry}
                />
              </View>
            ) : showCatalogWarning ? (
              <AppText variant="caption" color="textMuted" style={styles.catalogWarn}>
                {t('explore.catalogFallbackHint')}
              </AppText>
            ) : null}
          </View>
          <ExploreCategoryStrip
            categories={exploreCategories}
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={(id) => {
              setSelectedCategoryId(id);
              setSelectedSubcategoryId(null);
            }}
            subcategories={selectedSubcategories}
            selectedSubcategoryId={selectedSubcategoryId}
            onSelectSubcategory={setSelectedSubcategoryId}
            locale={locale}
          />

          <View style={[styles.sectionHead, styles.padH]}>
            <AppText variant="h2" color="text">
              {t('explore.eventsTitle')}
            </AppText>
            <AppText variant="caption" color="textMuted">
              {selectedSubcategoryLabel
                ? `${selectedCategoryLabel} · ${locale === 'ar' ? selectedSubcategoryLabel.nameAr : selectedSubcategoryLabel.name}`
                : selectedCategoryLabel}
            </AppText>
          </View>

          <View style={styles.feed}>
            {loadingFeed ? (
              <ActivityIndicator color={colors.primary} style={{ marginVertical: spacing.xl }} />
            ) : apiEvents.length > 0 ? (
              apiEvents.map((e) => (
                <ExploreEventFeedCard
                  key={e.id}
                  event={e}
                  cityName={cityLabelForCard(e.cityId)}
                  onPress={() => router.push(`/event/${e.id}`)}
                />
              ))
            ) : (
              <View style={styles.emptyCard}>
                <AppText variant="h3" color="text">
                  {t('search.noMatches')}
                </AppText>
                <AppText variant="caption" color="textSecondary" style={styles.emptyBody}>
                  {t('explore.noEventsForCity')}
                </AppText>
                <PrimaryButton
                  title={t('booking.exploreCta')}
                  onPress={() => {
                    setSelectedSubcategoryId(null);
                    router.push('/search');
                  }}
                  style={styles.emptyCta}
                />
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    heroEyebrow: {
      alignSelf: 'flex-start',
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
      borderRadius: radii.sm,
      backgroundColor: colors.accentBg,
      borderWidth: 1,
      borderColor: colors.accentBorder,
      overflow: 'hidden',
      fontWeight: '700',
    },
    safe: { flex: 1, backgroundColor: 'transparent' },
    root: { flex: 1 },
    scrollView: { flex: 1 },
    scroll: { paddingTop: spacing.sm, paddingBottom: spacing.xxxl },
    sectionHead: {
      paddingHorizontal: spacing.screen,
      marginBottom: spacing.md,
      gap: 4,
    },
    padH: { paddingHorizontal: spacing.screen },
    catalogWarn: {
      lineHeight: 18,
      marginTop: 2,
    },
    catalogError: {
      gap: spacing.sm,
      marginTop: spacing.xs,
    },
    catalogRetry: {
      alignSelf: 'flex-start',
    },
    horizontalPad: { paddingHorizontal: spacing.screen },
    guestBanner: {
      marginBottom: spacing.lg,
      padding: spacing.lg,
      borderRadius: radii.xl,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      gap: spacing.sm,
    },
    guestBannerBody: { lineHeight: 22 },
    guestBannerCta: { marginTop: spacing.sm, alignSelf: 'stretch' },
    feed: { paddingHorizontal: spacing.screen, paddingTop: spacing.sm },
    emptyCard: {
      marginTop: spacing.xs,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 18,
      backgroundColor: colors.card,
      padding: spacing.lg,
      alignItems: 'center',
      gap: spacing.sm,
    },
    emptyBody: {
      textAlign: 'center',
      lineHeight: 20,
    },
    emptyCta: {
      width: '100%',
      marginTop: spacing.xs,
    },
  });
}
