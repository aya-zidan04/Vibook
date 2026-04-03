import { type ReactNode, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/layout/Screen';
import { SearchBar } from '@/components/layout/SearchBar';
import { SectionHeader } from '@/components/layout/SectionHeader';
import { EmptyState } from '@/components/feedback/EmptyState';
import { AppText } from '@/components/ui/AppText';
import { Badge } from '@/components/ui/Badge';
import { useFormatMoney } from '@/hooks/useFormatMoney';
import { useTranslation } from '@/i18n/useTranslation';
import { MOCK_EVENTS, MOCK_FLIGHTS, MOCK_HOTELS, MOCK_RESTAURANTS } from '@/services/mock';
import { radii, spacing, useThemeColors } from '@/theme';
import { ltrNavigationChrome } from '@/utils/navigationChrome';
import { chevronForwardTrailing } from '@/utils/rtl';
import type { ThemeColors } from '@/theme/palettes';

const RECENT = ['Jazz night Irbid', 'Aqaba weekend', 'Chef’s table'];
const POPULAR = ['Concerts', 'Fine dining', 'Boutique hotels', 'Flights AMM'];
const TAGS = ['Family', 'Romantic', 'Last minute', 'Luxury', 'Outdoor'];

type Segment = 'all' | 'events' | 'restaurants' | 'hotels' | 'flights';

const SEGMENTS: { key: Segment; labelKey: string }[] = [
  { key: 'all', labelKey: 'search.all' },
  { key: 'events', labelKey: 'search.events' },
  { key: 'restaurants', labelKey: 'search.dining' },
  { key: 'hotels', labelKey: 'search.stays' },
  { key: 'flights', labelKey: 'search.flights' },
];

export default function SearchScreen() {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const { t } = useTranslation();
  const { formatMoney } = useFormatMoney();
  const [q, setQ] = useState('');
  const [seg, setSeg] = useState<Segment>('all');

  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    const ev = MOCK_EVENTS.filter((e) =>
      query ? e.title.toLowerCase().includes(query) : true,
    );
    const r = MOCK_RESTAURANTS.filter((x) =>
      query ? x.name.toLowerCase().includes(query) : true,
    );
    const h = MOCK_HOTELS.filter((x) =>
      query ? x.name.toLowerCase().includes(query) : true,
    );
    const f = MOCK_FLIGHTS.filter((x) =>
      query ? x.airline.toLowerCase().includes(query) || x.to.toLowerCase().includes(query) : true,
    );
    return { ev, r, h, f };
  }, [q]);

  const empty =
    q.length > 0 &&
    results.ev.length + results.r.length + results.h.length + results.f.length === 0;

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/explore');
    }
  };

  return (
    <Screen scroll contentStyle={styles.pad}>
      <View style={ltrNavigationChrome}>
        <Pressable
          onPress={goBack}
          hitSlop={12}
          style={styles.back}
          accessibilityRole="button"
          accessibilityLabel={t('common.a11yGoBack')}
        >
          <Ionicons name="chevron-back" size={28} color={colors.text} />
        </Pressable>
        <AppText variant="h1" color="text" style={styles.title}>
          {t('search.title')}
        </AppText>
      </View>
      <Pressable style={styles.flightLink} onPress={() => router.push('/flight/search')}>
        <Ionicons name="airplane-outline" size={18} color={colors.accent} />
        <AppText variant="bodyMedium" color="accent">
          {t('search.flightSearch')}
        </AppText>
        <Ionicons name={chevronForwardTrailing()} size={18} color={colors.accent} />
      </Pressable>
      <SearchBar placeholder={t('search.placeholder')} onPress={() => setQ('')} />

      <View style={styles.segWrap}>
        {SEGMENTS.map(({ key, labelKey }) => (
          <Pressable
            key={key}
            onPress={() => setSeg(key)}
            style={[styles.segBtn, seg === key && styles.segOn]}
          >
            <AppText variant="meta" color={seg === key ? 'text' : 'textMuted'}>
              {t(labelKey)}
            </AppText>
          </Pressable>
        ))}
      </View>

      {!q.length ? (
        <>
          <SectionHeader title={t('search.recent')} />
          {RECENT.map((recent) => (
            <Pressable key={recent} style={styles.recentRow} onPress={() => setQ(recent)}>
              <Ionicons name="time-outline" size={18} color={colors.textMuted} />
              <AppText variant="body" color="textSecondary">
                {recent}
              </AppText>
            </Pressable>
          ))}
          <SectionHeader title={t('search.popular')} />
          <View style={styles.tags}>
            {POPULAR.map((p) => (
              <Pressable key={p} style={styles.tag} onPress={() => setQ(p)}>
                <AppText variant="caption" color="accent">
                  {p}
                </AppText>
              </Pressable>
            ))}
          </View>
          <SectionHeader title={t('search.tags')} />
          <View style={styles.tags}>
            {TAGS.map((tag) => (
              <Pressable key={tag} style={styles.tag} onPress={() => setQ(tag)}>
                <AppText variant="caption" color="textSecondary">
                  #{tag}
                </AppText>
              </Pressable>
            ))}
          </View>
        </>
      ) : null}

      {q.length > 0 ? (
        <>
          <SectionHeader title={t('search.results')} subtitle={`${t('search.query')}: “${q}”`} />
          {empty ? (
            <EmptyState
              icon="search-outline"
              title={t('search.noMatches')}
              description={t('search.noMatchesDesc')}
              actionLabel={t('search.clear')}
              onAction={() => setQ('')}
            />
          ) : (
            <View style={styles.results}>
              {(seg === 'all' || seg === 'events') &&
                results.ev.map((e) => (
                  <ResultRow
                    key={e.id}
                    imageUrl={e.imageUrl}
                    title={e.title}
                    meta={e.venueName}
                    price={formatMoney(e.priceFrom, e.currency)}
                    badge={e.badge ? <Badge tone={e.badge} /> : undefined}
                    onPress={() => router.push(`/event/${e.id}`)}
                  />
                ))}
              {(seg === 'all' || seg === 'restaurants') &&
                results.r.map((r) => (
                  <ResultRow
                    key={r.id}
                    imageUrl={r.imageUrl}
                    title={r.name}
                    meta={t('search.restaurantMeta')}
                    price={`${r.priceLevel}/4`}
                    onPress={() => router.push(`/restaurant/${r.id}`)}
                  />
                ))}
              {(seg === 'all' || seg === 'hotels') &&
                results.h.map((h) => (
                  <ResultRow
                    key={h.id}
                    imageUrl={h.imageUrl}
                    title={h.name}
                    meta={`${h.stars}★ ${t('search.hotelSuffix')}`}
                    price={formatMoney(h.priceFrom, h.currency)}
                    onPress={() => router.push(`/stay/${h.id}`)}
                  />
                ))}
              {(seg === 'all' || seg === 'flights') &&
                results.f.map((fl) => (
                  <ResultRow
                    key={fl.id}
                    imageUrl="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=200&q=80"
                    title={`${fl.from} → ${fl.to}`}
                    meta={fl.airline}
                    price={formatMoney(fl.price, fl.currency)}
                    onPress={() => router.push(`/flight/${fl.id}`)}
                  />
                ))}
            </View>
          )}
        </>
      ) : null}

      <Pressable style={styles.filterFab} onPress={() => router.push('/filters')}>
        <Ionicons name="options" size={22} color={colors.text} />
        <AppText variant="meta" color="text">
          {t('common.filters')}
        </AppText>
      </Pressable>
    </Screen>
  );
}

function ResultRow({
  imageUrl,
  title,
  meta,
  price,
  badge,
  onPress,
}: {
  imageUrl: string;
  title: string;
  meta: string;
  price: string;
  badge?: ReactNode;
  onPress?: () => void;
}) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <Pressable style={styles.resultCard} onPress={onPress}>
      <Image source={{ uri: imageUrl }} style={styles.resultImg} contentFit="cover" />
      <View style={styles.resultBody}>
        <View style={styles.resultTop}>
          <AppText variant="h3" color="text" numberOfLines={2}>
            {title}
          </AppText>
          {badge}
        </View>
        <AppText variant="caption" color="textMuted">
          {meta}
        </AppText>
        <AppText variant="price" color="accent" style={styles.price}>
          {price}
        </AppText>
      </View>
    </Pressable>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
  pad: { paddingTop: spacing.md },
  back: {
    padding: 8,
    alignSelf: 'flex-start',
    marginStart: -8,
    marginBottom: 4,
  },
  title: { marginBottom: spacing.sm },
  flightLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
    paddingVertical: spacing.sm,
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
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  segOn: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryMuted,
  },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
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
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  results: { gap: spacing.md, marginBottom: spacing.xxxl },
  resultCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
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
