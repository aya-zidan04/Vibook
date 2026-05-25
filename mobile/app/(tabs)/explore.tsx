import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { listSubcategories } from '@/api/categoriesApi';
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
import type { ExploreMainCategory, ExploreSubcategory } from '@/mock/exploreCategories';
import { businessEventSummaryToEventItem } from '@/services/api/eventMap';
import { MOCK_EVENTS } from '@/services/mock';
import { useAppStore } from '@/store/appStore';
import { useReferenceStore } from '@/store/referenceStore';
import type { EventItem } from '@/types';
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
  const selectedCityId = useAppStore((s) => s.selectedCityId);
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const cities = useReferenceStore((s) => s.cities);

  const [subsByParent, setSubsByParent] = useState<Record<string, ExploreSubcategory[]>>({});
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string | null>(null);
  const [apiEvents, setApiEvents] = useState<EventItem[]>([]);
  const [loadingFeed, setLoadingFeed] = useState(false);

  useEffect(() => {
    if (categories.length === 0) return;
    let cancelled = false;
    void (async () => {
      const next: Record<string, ExploreSubcategory[]> = {};
      for (const c of categories) {
        try {
          const subs = await listSubcategories(Number(c.id));
          if (cancelled) return;
          next[c.id] = subs
            .filter((s) => s.active)
            .map((s) => ({
              id: String(s.id),
              parentId: c.id,
              name: s.name,
              nameAr: s.name,
            }));
        } catch {
          next[c.id] = [];
        }
      }
      if (!cancelled) setSubsByParent(next);
    })();
    return () => {
      cancelled = true;
    };
  }, [categories]);

  const exploreCategories = useMemo<ExploreMainCategory[]>(() => {
    return categories.map((c) => ({
      id: c.id,
      name: c.labelEn,
      nameAr: c.labelAr,
      icon: (c.icon as keyof typeof Ionicons.glyphMap) || 'grid-outline',
      subcategories: subsByParent[c.id] ?? [],
    }));
  }, [categories, subsByParent]);

  useEffect(() => {
    if (exploreCategories.length === 0) return;
    if (!exploreCategories.some((c) => c.id === selectedCategoryId)) {
      setSelectedCategoryId(exploreCategories[0].id);
      setSelectedSubcategoryId(null);
    }
  }, [exploreCategories, selectedCategoryId]);

  useEffect(() => {
    if (!isAuthenticated) {
      setApiEvents(MOCK_EVENTS);
      setLoadingFeed(false);
      return;
    }
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
        if (!cancelled) setApiEvents([]);
      } finally {
        if (!cancelled) setLoadingFeed(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, selectedCityId, selectedCategoryId, selectedSubcategoryId]);

  const heroSlides: HeroSlideItem[] = useMemo(() => {
    return apiEvents.slice(0, 4).map((e, i) => ({
      id: `hero-${e.id}-${i}`,
      imageUrl: e.imageUrl,
      title: e.title,
      subtitle: e.venueName,
      eyebrow: t('explore.event'),
      onPress: () => router.push(`/event/${e.id}`),
    }));
  }, [apiEvents, router, t]);

  const promo = useMemo(() => promoFromEvents(apiEvents, r, t), [apiEvents, r, t]);

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

  const cityLabelForCard = (cityId: string) => {
    const c = cities.find((x) => x.id === cityId);
    if (c) return locale === 'ar' ? c.nameAr : c.nameEn;
    return cityId;
  };

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

          {heroSlides.length > 0 ? <ExploreHeroCarousel slides={heroSlides} /> : null}

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
          </View>
          {exploreCategories.length > 0 ? (
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
          ) : (
            <View style={[styles.padH, { marginBottom: spacing.md }]}>
              <AppText variant="caption" color="textMuted">
                {t('explore.catalogFallbackHint')}
              </AppText>
            </View>
          )}

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
    horizontalPad: { paddingHorizontal: spacing.screen },
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
