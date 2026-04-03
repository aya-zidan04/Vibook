import { useEffect, useMemo } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { AppText } from '@/components/ui/AppText';
import {
  ExploreCategoryStrip,
  ExploreEventFeedCard,
  ExploreHeader,
  ExploreHeroCarousel,
  ExplorePromoGrid,
  type ExploreCategory,
  type HeroSlideItem,
  type PromoTile,
} from '@/components/explore';
import { useMockUser } from '@/hooks/useMockUser';
import { useTranslation } from '@/i18n/useTranslation';
import { isApiConfigured } from '@/config/api';
import type { ExperienceDto, OfferDto, PackageDto } from '@/services/api/catalogReadApi';
import { backendIconToOutline } from '@/services/reference/mapReference';
import {
  experienceDurationHours,
  navigateForOffer,
  offerSuggestsFlights,
  type CatalogRouter,
} from '@/services/catalog/mapCatalog';
import {
  MOCK_EVENTS,
  MOCK_EXPERIENCES,
  MOCK_OFFERS,
  MOCK_PACKAGES,
  getCityName,
} from '@/services/mock';
import { useAppStore } from '@/store/appStore';
import { loadExploreCatalog, useExploreCatalogStore } from '@/store/exploreCatalogStore';
import { useReferenceStore } from '@/store/referenceStore';
import type { EventItem } from '@/types';
import { spacing, useThemeColors } from '@/theme';
import type { ThemeColors } from '@/theme/palettes';

const CATEGORIES: ExploreCategory[] = [
  { id: 'sports', icon: 'football-outline', labelEn: 'Match day', labelAr: 'يوم المباراة' },
  { id: 'dining', icon: 'restaurant-outline', labelEn: 'Fine dining', labelAr: 'مطاعم فاخرة' },
  { id: 'hotels', icon: 'bed-outline', labelEn: 'Stays', labelAr: 'إقامة' },
  { id: 'concerts', icon: 'mic-outline', labelEn: 'Live shows', labelAr: 'حفلات مباشرة' },
  { id: 'theater', icon: 'color-palette-outline', labelEn: 'Theatre', labelAr: 'مسرح' },
  { id: 'shopping', icon: 'bag-handle-outline', labelEn: 'Retail therapy', labelAr: 'تسوّق' },
];

const DISCOVER_IMAGE =
  'https://images.unsplash.com/photo-1540039155733-5bb30b53a388?w=1200&q=80&auto=format&fit=crop';

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

function buildApiHeroSlides(
  router: CatalogRouter,
  t: (key: string) => string,
  offers: OfferDto[],
  events: EventItem[],
  experiences: ExperienceDto[],
): HeroSlideItem[] {
  const slides: HeroSlideItem[] = [];
  const o0 = offers[0];
  if (o0) {
    slides.push({
      id: `hero-offer-${o0.id}`,
      imageUrl: o0.imageUrl,
      title: o0.title,
      subtitle: o0.subtitle,
      eyebrow: t('explore.offer'),
      onPress: () => navigateForOffer(router, o0),
    });
  }
  const e0 = events[0];
  if (e0) {
    slides.push({
      id: `hero-event-${e0.id}`,
      imageUrl: e0.imageUrl,
      title: e0.title,
      subtitle: e0.venueName,
      eyebrow: t('explore.event'),
      onPress: () => router.push(`/event/${e0.id}`),
    });
  }
  const x0 = experiences[0];
  if (x0) {
    slides.push({
      id: `hero-exp-${x0.id}`,
      imageUrl: x0.imageUrl,
      title: x0.title,
      subtitle: `${experienceDurationHours(x0)} ${t('experience.hours')} · ${t('explore.experience')}`,
      eyebrow: t('explore.experience'),
      onPress: () => router.push(`/experience/${x0.id}`),
    });
  }
  const o1 = offers[1];
  if (o1) {
    slides.push({
      id: `hero-offer-${o1.id}`,
      imageUrl: o1.imageUrl,
      title: o1.title,
      subtitle: o1.subtitle,
      eyebrow: t('explore.offer'),
      onPress: () =>
        offerSuggestsFlights(o1) ? router.push('/flight/search') : navigateForOffer(router, o1),
    });
  } else if (events[1]) {
    const e1 = events[1];
    slides.push({
      id: `hero-event-${e1.id}`,
      imageUrl: e1.imageUrl,
      title: e1.title,
      subtitle: e1.venueName,
      eyebrow: t('explore.event'),
      onPress: () => router.push(`/event/${e1.id}`),
    });
  }
  return slides;
}

function buildApiPromoGrid(
  router: CatalogRouter,
  t: (key: string) => string,
  events: EventItem[],
  offers: OfferDto[],
  experiences: ExperienceDto[],
  packages: PackageDto[],
) {
  const discoverTile = (slot: string): PromoTile => ({
    id: `promo-discover-${slot}`,
    imageUrl: DISCOVER_IMAGE,
    title: t('explore.heroTitle'),
    subtitle: t('explore.promoSubtitle'),
    kind: 'event',
    kindLabel: t('explore.featured'),
    onPress: () => router.push('/search'),
  });

  const eventTile = (e: EventItem, suffix: string, kindLabel: string): PromoTile => ({
    id: `p-event-${e.id}-${suffix}`,
    imageUrl: e.imageUrl,
    title: e.title,
    subtitle:
      e.description.length > 72 ? `${e.description.slice(0, 72)}…` : e.description || e.venueName,
    kind: 'event',
    kindLabel,
    onPress: () => router.push(`/event/${e.id}`),
  });

  const offerTile = (o: OfferDto, suffix: string): PromoTile => ({
    id: `p-offer-${o.id}-${suffix}`,
    imageUrl: o.imageUrl,
    title: o.title,
    subtitle: o.subtitle,
    kind: 'offer',
    kindLabel: t('explore.offer'),
    onPress: () => navigateForOffer(router, o),
  });

  const expTile = (x: ExperienceDto, suffix: string): PromoTile => ({
    id: `p-exp-${x.id}-${suffix}`,
    imageUrl: x.imageUrl,
    title: x.title,
    subtitle: `${experienceDurationHours(x)} ${t('experience.hours')}`,
    kind: 'experience',
    kindLabel: t('explore.experience'),
    onPress: () => router.push(`/experience/${x.id}`),
  });

  const pkgTile = (p: PackageDto, suffix: string): PromoTile => ({
    id: `p-pkg-${p.id}-${suffix}`,
    imageUrl: p.imageUrl,
    title: p.title,
    subtitle: `${p.nights} ${t('stay.nights')}`,
    kind: 'event',
    kindLabel: t('explore.featured'),
    onPress: () => router.push(`/package/${p.id}`),
  });

  const e0 = events[0];
  const e1 = events[1];
  const o0 = offers[0];
  const x0 = experiences[0];
  const x1 = experiences[1];
  const p0 = packages[0];

  const large = e0
    ? eventTile(e0, 'lg', t('explore.event'))
    : o0
      ? offerTile(o0, 'lg')
      : p0
        ? pkgTile(p0, 'lg')
        : discoverTile('lg');

  const stackTop = o0
    ? offerTile(o0, 'st1')
    : e1
      ? eventTile(e1, 'st1', t('explore.event'))
      : x0
        ? expTile(x0, 'st1')
        : discoverTile('st1');

  const stackBottom = x0
    ? expTile(x0, 'st2')
    : e0
      ? eventTile(e0, 'st2', t('explore.event'))
      : discoverTile('st2');

  const rowLeft = p0
    ? pkgTile(p0, 'r1')
    : x1
      ? expTile(x1, 'r1')
      : e0
        ? eventTile(e0, 'r1', t('explore.featured'))
        : discoverTile('r1');

  const rowRight = e1
    ? eventTile(e1, 'r2', t('explore.event'))
    : e0
      ? eventTile(e0, 'r2', t('explore.event'))
      : o0
        ? offerTile(o0, 'r2')
        : discoverTile('r2');

  return {
    large,
    stackTop,
    stackBottom,
    rowLeft,
    rowRight,
  };
}

export default function ExploreScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { t, locale } = useTranslation();
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const selectedCityId = useAppStore((s) => s.selectedCityId);
  const refCategories = useReferenceStore((s) => s.categories);
  const refStatus = useReferenceStore((s) => s.status);
  const catalogStatus = useExploreCatalogStore((s) => s.status);
  const catalogError = useExploreCatalogStore((s) => s.errorMessage);
  const apiEvents = useExploreCatalogStore((s) => s.events);
  const apiOffers = useExploreCatalogStore((s) => s.offers);
  const apiExperiences = useExploreCatalogStore((s) => s.experiences);
  const apiPackages = useExploreCatalogStore((s) => s.packages);
  const { firstName } = useMockUser();

  const apiMode = isApiConfigured();
  const useMockCatalog = !apiMode || catalogStatus === 'error';
  const catalogLoading =
    apiMode && (catalogStatus === 'idle' || catalogStatus === 'loading');

  useEffect(() => {
    if (!apiMode) return;
    void loadExploreCatalog();
  }, [apiMode, selectedCityId]);

  const stripCategories = useMemo(() => {
    if (isApiConfigured() && refCategories.length > 0) {
      return refCategories.map((c) => ({
        id: c.id,
        icon: backendIconToOutline(c.icon),
        labelEn: c.labelEn,
        labelAr: c.labelAr,
      }));
    }
    return CATEGORIES;
  }, [refCategories]);

  const greetingLine = isAuthenticated
    ? `${t('explore.greetingHi')} ${firstName}`
    : t('explore.greetingGuest');

  const r = router as CatalogRouter;

  const heroSlides = useMemo(() => {
    if (useMockCatalog) return mockHeroSlides(r, t);
    return buildApiHeroSlides(r, t, apiOffers, apiEvents, apiExperiences);
  }, [useMockCatalog, r, t, apiOffers, apiEvents, apiExperiences]);

  const promo = useMemo(() => {
    if (useMockCatalog) return mockPromoGrid(r, t);
    return buildApiPromoGrid(r, t, apiEvents, apiOffers, apiExperiences, apiPackages);
  }, [useMockCatalog, r, t, apiEvents, apiOffers, apiExperiences, apiPackages]);

  const feedEvents = useMockCatalog ? MOCK_EVENTS : apiEvents;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.root}>
        <ExploreHeader
          brandLabel={t('common.brandDisplay')}
          onSearch={() => router.push('/search')}
          onLanguageCurrency={() => router.push('/language-currency')}
          a11yLanguageCurrency={t('explore.a11yLanguageCurrency')}
          a11ySearch={t('common.search')}
          greetingLine={greetingLine}
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

          {apiMode && catalogStatus === 'error' && catalogError ? (
            <AppText variant="caption" color="textMuted" style={styles.fallbackHint}>
              {t('explore.catalogFallbackHint')}
            </AppText>
          ) : null}

          {catalogLoading ? (
            <View style={styles.sectionLoading}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : heroSlides.length > 0 ? (
            <ExploreHeroCarousel slides={heroSlides} />
          ) : null}

          <View style={styles.sectionHead}>
            <AppText variant="h2" color="text">
              {t('explore.promoTitle')}
            </AppText>
            <AppText variant="caption" color="textMuted">
              {t('explore.promoSubtitle')}
            </AppText>
          </View>

          {catalogLoading ? (
            <View style={styles.sectionLoading}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : (
            <View style={styles.horizontalPad}>
              <ExplorePromoGrid
                large={promo.large}
                stackTop={promo.stackTop}
                stackBottom={promo.stackBottom}
                rowLeft={promo.rowLeft}
                rowRight={promo.rowRight}
              />
            </View>
          )}

          <View style={[styles.sectionHead, styles.padH]}>
            <AppText variant="h2" color="text">
              {t('explore.categoriesTitle')}
            </AppText>
          </View>
          {isApiConfigured() && refStatus === 'loading' && refCategories.length === 0 ? (
            <View style={styles.refLoading}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : (
            <ExploreCategoryStrip
              categories={stripCategories}
              locale={locale}
              onPress={() => router.push('/search')}
            />
          )}

          <View style={[styles.sectionHead, styles.padH]}>
            <AppText variant="h2" color="text">
              {t('explore.eventsTitle')}
            </AppText>
            <AppText variant="caption" color="textMuted">
              {t('explore.eventsSubtitle')}
            </AppText>
          </View>

          {catalogLoading ? (
            <View style={styles.sectionLoading}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : feedEvents.length === 0 && !useMockCatalog ? (
            <AppText variant="body" color="textMuted" style={styles.emptyFeed}>
              {t('explore.noEventsForCity')}
            </AppText>
          ) : (
            <View style={styles.feed}>
              {feedEvents.map((e) => (
                <ExploreEventFeedCard
                  key={e.id}
                  event={e}
                  cityName={getCityName(e.cityId, locale)}
                  onPress={() => router.push(`/event/${e.id}`)}
                />
              ))}
            </View>
          )}
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
    refLoading: {
      paddingVertical: spacing.lg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sectionLoading: {
      paddingVertical: spacing.xl,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 120,
    },
    fallbackHint: {
      paddingHorizontal: spacing.screen,
      marginBottom: spacing.sm,
    },
    emptyFeed: {
      paddingHorizontal: spacing.screen,
      paddingBottom: spacing.lg,
    },
  });
}
