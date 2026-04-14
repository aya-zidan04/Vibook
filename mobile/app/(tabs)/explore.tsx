import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
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
import {
  MOCK_EXPLORE_CATEGORIES,
  MOCK_EXPLORE_EVENT_TAGS,
  type ExploreEventTaxonomyTag,
  type ExploreMainCategory,
} from '@/mock/exploreCategories';
import {
  MOCK_EVENTS,
  MOCK_EXPERIENCES,
  MOCK_OFFERS,
  MOCK_PACKAGES,
  getCityName,
} from '@/services/mock';
import type { EventItem } from '@/types';
import { spacing, useThemeColors } from '@/theme';
import type { ThemeColors } from '@/theme/palettes';

function mockHeroSlides(router: CatalogRouter, t: (key: string) => string): HeroSlideItem[] {
  return [
    {
      id: 'h1',
      imageUrl: MOCK_OFFERS[0].imageUrl,
      title: MOCK_OFFERS[0].title,
      subtitle: MOCK_OFFERS[0].subtitle,
      eyebrow: t('explore.featured'),
      onPress: () => router.push('/restaurant/r1'),
    },
    {
      id: 'h2',
      imageUrl: MOCK_EVENTS[0].imageUrl,
      title: MOCK_EVENTS[0].title,
      subtitle: MOCK_EVENTS[0].venueName,
      eyebrow: t('explore.event'),
      onPress: () => router.push(`/event/${MOCK_EVENTS[0].id}`),
    },
    {
      id: 'h3',
      imageUrl: MOCK_EXPERIENCES[1]?.imageUrl ?? MOCK_EXPERIENCES[0].imageUrl,
      title: MOCK_EXPERIENCES[1]?.title ?? MOCK_EXPERIENCES[0].title,
      subtitle: `${MOCK_EXPERIENCES[1]?.durationHours ?? MOCK_EXPERIENCES[0].durationHours} ${t('experience.hours')} · ${t('explore.experience')}`,
      eyebrow: t('explore.experience'),
      onPress: () =>
        router.push(`/experience/${MOCK_EXPERIENCES[1]?.id ?? MOCK_EXPERIENCES[0].id}`),
    },
    {
      id: 'h4',
      imageUrl: MOCK_OFFERS[1].imageUrl,
      title: MOCK_OFFERS[1].title,
      subtitle: MOCK_OFFERS[1].subtitle,
      eyebrow: t('explore.offer'),
      onPress: () => router.push('/flight/search'),
    },
  ];
}

function mockPromoGrid(router: CatalogRouter, t: (key: string) => string) {
  return {
    large: {
      id: 'p-large',
      imageUrl: MOCK_EVENTS[0].imageUrl,
      title: MOCK_EVENTS[0].title,
      subtitle: MOCK_EVENTS[0].description.slice(0, 72) + '…',
      kind: 'event' as const,
      kindLabel: t('explore.event'),
      onPress: () => router.push(`/event/${MOCK_EVENTS[0].id}`),
    },
    stackTop: {
      id: 'p-st1',
      imageUrl: MOCK_OFFERS[0].imageUrl,
      title: MOCK_OFFERS[0].title,
      subtitle: MOCK_OFFERS[0].subtitle,
      kind: 'offer' as const,
      kindLabel: t('explore.offer'),
      onPress: () => router.push('/package/p1'),
    },
    stackBottom: {
      id: 'p-st2',
      imageUrl: MOCK_EXPERIENCES[0].imageUrl,
      title: MOCK_EXPERIENCES[0].title,
      subtitle: `${MOCK_EXPERIENCES[0].durationHours} ${t('experience.hours')}`,
      kind: 'experience' as const,
      kindLabel: t('explore.experience'),
      onPress: () => router.push(`/experience/${MOCK_EXPERIENCES[0].id}`),
    },
    rowLeft: {
      id: 'p-r1',
      imageUrl: MOCK_PACKAGES[0].imageUrl,
      title: MOCK_PACKAGES[0].title,
      subtitle: `${MOCK_PACKAGES[0].nights} ${t('stay.nights')}`,
      kind: 'event' as const,
      kindLabel: t('explore.featured'),
      onPress: () => router.push(`/package/${MOCK_PACKAGES[0].id}`),
    },
    rowRight: {
      id: 'p-r2',
      imageUrl: MOCK_EVENTS[1].imageUrl,
      title: MOCK_EVENTS[1].title,
      subtitle: MOCK_EVENTS[1].venueName,
      kind: 'event' as const,
      kindLabel: t('explore.event'),
      onPress: () => router.push(`/event/${MOCK_EVENTS[1].id}`),
    },
  };
}

export default function ExploreScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { t, locale } = useTranslation();
  const [selectedCategoryId, setSelectedCategoryId] = useState(MOCK_EXPLORE_CATEGORIES[0]?.id ?? '');
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string | null>(null);

  const r = router as CatalogRouter;

  const heroSlides = useMemo(() => mockHeroSlides(r, t), [r, t]);
  const promo = useMemo(() => mockPromoGrid(r, t), [r, t]);
  const selectedCategory = useMemo<ExploreMainCategory | undefined>(
    () => MOCK_EXPLORE_CATEGORIES.find((c) => c.id === selectedCategoryId),
    [selectedCategoryId],
  );
  const selectedSubcategories = selectedCategory?.subcategories ?? [];

  const feedEvents: EventItem[] = useMemo(() => {
    const fallbackTag = (event: EventItem): ExploreEventTaxonomyTag => {
      if (event.categoryId === 'cat5') {
        return { mainId: 'sports', subcategoryId: 'activities' };
      }
      return { mainId: 'entertainment', subcategoryId: 'concerts' };
    };

    return MOCK_EVENTS.filter((event) => {
      const tag = MOCK_EXPLORE_EVENT_TAGS[event.id] ?? fallbackTag(event);
      if (selectedCategoryId && tag.mainId !== selectedCategoryId) return false;
      if (selectedSubcategoryId && tag.subcategoryId !== selectedSubcategoryId) return false;
      return true;
    });
  }, [selectedCategoryId, selectedSubcategoryId]);

  const selectedCategoryLabel = selectedCategory
    ? locale === 'ar'
      ? selectedCategory.nameAr
      : selectedCategory.name
    : '';
  const selectedSubcategoryLabel = selectedSubcategoryId
    ? selectedSubcategories.find((sub) => sub.id === selectedSubcategoryId)
    : undefined;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.root}>
        <ExploreHeader
          brandLabel={t('common.brandDisplay')}
          onSearch={() => router.push('/search')}
          onLanguageCurrency={() => router.push('/language-currency')}
          a11yLanguageCurrency={t('explore.a11yLanguageCurrency')}
          a11ySearch={t('common.search')}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
          style={styles.scrollView}
        >
          <View style={styles.sectionHead}>
            <AppText variant="overline" color="accent" style={styles.heroEyebrow}>
              {t('explore.heroEyebrow')}
            </AppText>
            <AppText variant="h1" color="text">
              {t('explore.heroTitle')}
            </AppText>
          </View>

          {heroSlides.length > 0 ? <ExploreHeroCarousel slides={heroSlides} /> : null}

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

          <View style={[styles.sectionHead, styles.padH]}>
            <AppText variant="h2" color="text">
              {t('explore.categoriesTitle')}
            </AppText>
          </View>
          <ExploreCategoryStrip
            categories={MOCK_EXPLORE_CATEGORIES}
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
            {feedEvents.length > 0 ? (
              feedEvents.map((e) => (
                <ExploreEventFeedCard
                  key={e.id}
                  event={e}
                  cityName={getCityName(e.cityId, locale)}
                  onPress={() => router.push(`/event/${e.id}`)}
                />
              ))
            ) : (
              <View style={styles.emptyCard}>
                <AppText variant="h3" color="text">
                  {t('search.noMatches')}
                </AppText>
                <AppText variant="caption" color="textSecondary" style={styles.emptyBody}>
                  {t('search.noMatchesDesc')}
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
      fontSize: 14,
      lineHeight: 18,
      letterSpacing: 1.1,
    },
    safe: { flex: 1, backgroundColor: colors.background },
    root: { flex: 1 },
    scrollView: { flex: 1 },
    scroll: { paddingBottom: spacing.xxxl },
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
      backgroundColor: colors.surface,
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
