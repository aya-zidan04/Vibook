import { ScrollView, StyleSheet, View } from 'react-native';
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
import { useTranslation } from '@/i18n/useTranslation';
import { MOCK_EVENTS, MOCK_EXPERIENCES, MOCK_OFFERS, MOCK_PACKAGES } from '@/mock';
import { getCityName } from '@/mock/queries';
import { useLocaleStore } from '@/store/localeStore';
import { colors, spacing } from '@/theme';

const CATEGORIES: ExploreCategory[] = [
  { id: 'sports', emoji: '⚽', labelEn: 'Match day', labelAr: 'يوم المباراة' },
  { id: 'dining', emoji: '🍽️', labelEn: 'Fine dining', labelAr: 'مطاعم فاخرة' },
  { id: 'hotels', emoji: '🏨', labelEn: 'Stays', labelAr: 'إقامة' },
  { id: 'concerts', emoji: '🎤', labelEn: 'Live shows', labelAr: 'حفلات مباشرة' },
  { id: 'theater', emoji: '🎭', labelEn: 'Theatre', labelAr: 'مسرح' },
  { id: 'shopping', emoji: '🛍️', labelEn: 'Retail therapy', labelAr: 'تسوّق' },
];

export default function ExploreScreen() {
  const router = useRouter();
  const { t, locale } = useTranslation();
  const regionFromStore = useLocaleStore((s) => s.regionLabel);
  const regionLabel = locale === 'ar' ? t('explore.country') : regionFromStore;

  const heroSlides: HeroSlideItem[] = [
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
      onPress: () => router.push(`/experience/${MOCK_EXPERIENCES[1]?.id ?? MOCK_EXPERIENCES[0].id}`),
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

  const promoLarge: PromoTile = {
    id: 'p-large',
    imageUrl: MOCK_EVENTS[0].imageUrl,
    title: MOCK_EVENTS[0].title,
    subtitle: MOCK_EVENTS[0].description.slice(0, 72) + '…',
    kind: 'event',
    kindLabel: t('explore.event'),
    onPress: () => router.push(`/event/${MOCK_EVENTS[0].id}`),
  };

  const promoStackTop: PromoTile = {
    id: 'p-st1',
    imageUrl: MOCK_OFFERS[0].imageUrl,
    title: MOCK_OFFERS[0].title,
    subtitle: MOCK_OFFERS[0].subtitle,
    kind: 'offer',
    kindLabel: t('explore.offer'),
    onPress: () => router.push('/package/p1'),
  };

  const promoStackBottom: PromoTile = {
    id: 'p-st2',
    imageUrl: MOCK_EXPERIENCES[0].imageUrl,
    title: MOCK_EXPERIENCES[0].title,
    subtitle: `${MOCK_EXPERIENCES[0].durationHours} ${t('experience.hours')}`,
    kind: 'experience',
    kindLabel: t('explore.experience'),
    onPress: () => router.push(`/experience/${MOCK_EXPERIENCES[0].id}`),
  };

  const promoRowLeft: PromoTile = {
    id: 'p-r1',
    imageUrl: MOCK_PACKAGES[0].imageUrl,
    title: MOCK_PACKAGES[0].title,
    subtitle: `${MOCK_PACKAGES[0].nights} nights`,
    kind: 'event',
    kindLabel: t('explore.featured'),
    onPress: () => router.push(`/package/${MOCK_PACKAGES[0].id}`),
  };

  const promoRowRight: PromoTile = {
    id: 'p-r2',
    imageUrl: MOCK_EVENTS[1].imageUrl,
    title: MOCK_EVENTS[1].title,
    subtitle: MOCK_EVENTS[1].venueName,
    kind: 'event',
    kindLabel: t('explore.event'),
    onPress: () => router.push(`/event/${MOCK_EVENTS[1].id}`),
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.root}>
        <ExploreHeader
          brandLabel={t('common.brandDisplay')}
          regionLabel={regionLabel}
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
            <AppText variant="overline" color="accent">
              {t('explore.heroEyebrow')}
            </AppText>
            <AppText variant="h1" color="text">
              {t('explore.heroTitle')}
            </AppText>
          </View>

          <ExploreHeroCarousel slides={heroSlides} />

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
              large={promoLarge}
              stackTop={promoStackTop}
              stackBottom={promoStackBottom}
              rowLeft={promoRowLeft}
              rowRight={promoRowRight}
            />
          </View>

          <View style={[styles.sectionHead, styles.padH]}>
            <AppText variant="h2" color="text">
              {t('explore.categoriesTitle')}
            </AppText>
          </View>
          <ExploreCategoryStrip categories={CATEGORIES} locale={locale} onPress={() => router.push('/search')} />

          <View style={[styles.sectionHead, styles.padH]}>
            <AppText variant="h2" color="text">
              {t('explore.eventsTitle')}
            </AppText>
            <AppText variant="caption" color="textMuted">
              {t('explore.eventsSubtitle')}
            </AppText>
          </View>

          <View style={styles.feed}>
            {MOCK_EVENTS.map((e) => (
              <ExploreEventFeedCard
                key={e.id}
                event={e}
                cityName={getCityName(e.cityId, locale)}
                onPress={() => router.push(`/event/${e.id}`)}
              />
            ))}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
});
