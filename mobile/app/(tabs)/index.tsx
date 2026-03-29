import { ScrollView, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import {
  AppHeader,
  CategoryChip,
  EventCard,
  HeroCarousel,
  Screen,
  SearchBar,
  SectionHeader,
} from '@/components';
import type { HeroSlide } from '@/components/layout/HeroCarousel';
import {
  CURRENT_USER,
  MOCK_CATEGORIES,
  MOCK_CITIES,
  MOCK_EVENTS,
  MOCK_EXPERIENCES,
  MOCK_HOTELS,
  MOCK_OFFERS,
  MOCK_PACKAGES,
  MOCK_RESTAURANTS,
} from '@/mock';
import { useAppStore } from '@/store/appStore';
import { colors, radii, spacing } from '@/theme';
import { AppText } from '@/components/ui/AppText';
import { formatPrice } from '@/utils/format';

function categoryIcon(slug: string): keyof typeof Ionicons.glyphMap {
  const m: Record<string, keyof typeof Ionicons.glyphMap> = {
    events: 'calendar-outline',
    dining: 'restaurant-outline',
    stays: 'bed-outline',
    flights: 'airplane-outline',
    sports: 'football-outline',
    wellness: 'leaf-outline',
    travel: 'globe-outline',
    drops: 'flash-outline',
  };
  return m[slug] ?? 'apps-outline';
}

const HERO_SLIDES: HeroSlide[] = [
  {
    id: 'hero1',
    imageUrl: MOCK_OFFERS[0].imageUrl,
    title: MOCK_OFFERS[0].title,
    subtitle: MOCK_OFFERS[0].subtitle,
  },
  {
    id: 'hero2',
    imageUrl: MOCK_EVENTS[0].imageUrl,
    title: MOCK_EVENTS[0].title,
    subtitle: `${MOCK_EVENTS[0].venueName} · ${MOCK_EVENTS[0].description.slice(0, 72)}…`,
  },
  {
    id: 'hero3',
    imageUrl: MOCK_PACKAGES[0].imageUrl,
    title: MOCK_PACKAGES[0].title,
    subtitle: 'Curated stays · limited availability',
  },
];

export default function HomeScreen() {
  const cityId = useAppStore((s) => s.selectedCityId);
  const city = MOCK_CITIES.find((c) => c.id === cityId) ?? MOCK_CITIES[0];

  return (
    <Screen scroll contentStyle={styles.scroll}>
      <AppHeader
        greeting="Good evening"
        cityLabel={city.nameEn}
        avatarUrl={CURRENT_USER.avatarUrl}
      />

      <SearchBar />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
      >
        {MOCK_CATEGORIES.map((c, i) => (
          <CategoryChip
            key={c.id}
            label={c.labelEn}
            icon={categoryIcon(c.slug)}
            selected={i === 0}
          />
        ))}
      </ScrollView>

      <HeroCarousel slides={HERO_SLIDES} />

      <SectionHeader title="Trending now" subtitle="What everyone is booking this week" actionLabel="See all" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {MOCK_EVENTS.map((e) => (
          <EventCard key={e.id} event={e} variant="wide" />
        ))}
      </ScrollView>

      <SectionHeader title="Recommended for you" subtitle="Based on your tastes" />
      {MOCK_EVENTS.slice(0, 2).map((e) => (
        <EventCard key={`rec-${e.id}`} event={e} />
      ))}

      <SectionHeader title="This weekend" actionLabel="Calendar" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {MOCK_EVENTS.map((e) => (
          <EventCard key={`wk-${e.id}`} event={e} variant="wide" />
        ))}
      </ScrollView>

      <SectionHeader title="Top restaurants" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.restRow}>
        {MOCK_RESTAURANTS.map((r) => (
          <RestaurantMini key={r.id} name={r.name} imageUrl={r.imageUrl} rating={r.rating} />
        ))}
      </ScrollView>

      <SectionHeader title="Popular experiences" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {MOCK_EXPERIENCES.map((x) => (
          <ExperienceMini key={x.id} item={x} />
        ))}
      </ScrollView>

      <SectionHeader title="Travel escapes" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {MOCK_PACKAGES.map((p) => (
          <PackageMini key={p.id} pkg={p} />
        ))}
      </ScrollView>

      <SectionHeader title="Sports & activities" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {MOCK_EVENTS.filter((e) => e.id === 'e3').map((e) => (
          <EventCard key={e.id} event={e} variant="wide" />
        ))}
      </ScrollView>

      <SectionHeader title="Exclusive drops" />
      <PromoStrip />

      <SectionHeader title="Nearby places" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {MOCK_HOTELS.map((h) => (
          <HotelMini key={h.id} hotel={h} />
        ))}
      </ScrollView>

      <SectionHeader title="Recently viewed" />
      {MOCK_EVENTS.slice(0, 1).map((e) => (
        <EventCard key={`rv-${e.id}`} event={e} />
      ))}

      <SectionHeader title="Partner highlights" />
      <PartnerCard />
    </Screen>
  );
}

function RestaurantMini({
  name,
  imageUrl,
  rating,
}: {
  name: string;
  imageUrl: string;
  rating: number;
}) {
  return (
    <View style={styles.miniCard}>
      <Image source={{ uri: imageUrl }} style={styles.miniImg} contentFit="cover" />
      <LinearGradient colors={['transparent', colors.background]} style={styles.miniGrad} />
      <AppText variant="h3" color="text" numberOfLines={1} style={styles.miniTitle}>
        {name}
      </AppText>
      <AppText variant="caption" color="accent">
        ★ {rating.toFixed(1)}
      </AppText>
    </View>
  );
}

function ExperienceMini({ item }: { item: (typeof MOCK_EXPERIENCES)[0] }) {
  return (
    <View style={[styles.miniCard, { width: 200 }]}>
      <Image source={{ uri: item.imageUrl }} style={styles.miniImg} contentFit="cover" />
      <LinearGradient colors={['transparent', colors.background]} style={styles.miniGrad} />
      <AppText variant="h3" color="text" numberOfLines={2} style={styles.miniTitle}>
        {item.title}
      </AppText>
      <AppText variant="caption" color="textMuted">
        {item.durationHours}h · {formatPrice(item.priceFrom, item.currency)}
      </AppText>
    </View>
  );
}

function PackageMini({ pkg }: { pkg: (typeof MOCK_PACKAGES)[0] }) {
  return (
    <View style={[styles.miniCard, { width: 220 }]}>
      <Image source={{ uri: pkg.imageUrl }} style={styles.miniImg} contentFit="cover" />
      <LinearGradient colors={['transparent', colors.background]} style={styles.miniGrad} />
      <AppText variant="h3" color="text" numberOfLines={2} style={styles.miniTitle}>
        {pkg.title}
      </AppText>
      <AppText variant="caption" color="accent">
        {pkg.nights} nights · {formatPrice(pkg.priceFrom, pkg.currency)}
      </AppText>
    </View>
  );
}

function HotelMini({ hotel }: { hotel: (typeof MOCK_HOTELS)[0] }) {
  return (
    <View style={[styles.miniCard, { width: 180 }]}>
      <Image source={{ uri: hotel.imageUrl }} style={styles.miniImg} contentFit="cover" />
      <LinearGradient colors={['transparent', colors.background]} style={styles.miniGrad} />
      <AppText variant="h3" color="text" numberOfLines={1} style={styles.miniTitle}>
        {hotel.name}
      </AppText>
      <AppText variant="caption" color="textMuted">
        {hotel.stars}★ · {formatPrice(hotel.priceFrom, hotel.currency)}
      </AppText>
    </View>
  );
}

function PromoStrip() {
  return (
    <LinearGradient
      colors={[colors.primaryMuted, colors.surface]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.promo}
    >
      <AppText variant="overline" color="accent">
        Members early access
      </AppText>
      <AppText variant="h2" color="text" style={styles.promoTitle}>
        Collector passes · drop tonight
      </AppText>
      <AppText variant="caption" color="textSecondary">
        Limited inventory · verified authenticity
      </AppText>
    </LinearGradient>
  );
}

function PartnerCard() {
  return (
    <View style={styles.partner}>
      <Image
        source={{
          uri: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80',
        }}
        style={styles.partnerImg}
        contentFit="cover"
      />
      <LinearGradient colors={['transparent', 'rgba(7,11,20,0.92)']} style={styles.partnerGrad}>
        <AppText variant="h3" color="text">
          Nebula Live
        </AppText>
        <AppText variant="caption" color="textSecondary">
          Official partner · GCC-wide events
        </AppText>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingTop: spacing.sm,
    gap: 0,
  },
  chips: {
    paddingVertical: spacing.md,
    paddingRight: spacing.screen,
  },
  restRow: {
    marginBottom: spacing.sm,
  },
  miniCard: {
    width: 160,
    marginRight: spacing.md,
    borderRadius: radii.xl,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  miniImg: {
    height: 100,
    width: '100%',
  },
  miniGrad: {
    ...StyleSheet.absoluteFillObject,
    top: 40,
  },
  miniTitle: {
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.sm,
  },
  promo: {
    borderRadius: radii.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  promoTitle: {
    marginVertical: spacing.sm,
  },
  partner: {
    borderRadius: radii.xl,
    overflow: 'hidden',
    marginBottom: spacing.xxxl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  partnerImg: { height: 160, width: '100%' },
  partnerGrad: {
    padding: spacing.lg,
  },
});
