import { type ReactNode, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/layout/Screen';
import { SearchBar } from '@/components/layout/SearchBar';
import { SectionHeader } from '@/components/layout/SectionHeader';
import { EmptyState } from '@/components/feedback/EmptyState';
import { AppText } from '@/components/ui/AppText';
import { Badge } from '@/components/ui/Badge';
import { MOCK_EVENTS, MOCK_FLIGHTS, MOCK_HOTELS, MOCK_RESTAURANTS } from '@/mock';
import { colors, radii, spacing } from '@/theme';
import { formatPrice } from '@/utils/format';

const RECENT = ['Jazz night Riyadh', 'Dubai weekend', 'Chef’s table'];
const POPULAR = ['Concerts', 'Fine dining', 'Boutique hotels', 'Flights DXB'];
const TAGS = ['Family', 'Romantic', 'Last minute', 'Luxury', 'Outdoor'];

type Segment = 'all' | 'events' | 'restaurants' | 'hotels' | 'flights';

export default function SearchScreen() {
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

  return (
    <Screen scroll contentStyle={styles.pad}>
      <AppText variant="h1" color="text" style={styles.title}>
        Search
      </AppText>
      <SearchBar placeholder="Places, events, flights, restaurants…" onPress={() => setQ('')} />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.seg}>
        {(
          [
            ['all', 'All'],
            ['events', 'Events'],
            ['restaurants', 'Dining'],
            ['hotels', 'Stays'],
            ['flights', 'Flights'],
          ] as const
        ).map(([key, label]) => (
          <Pressable
            key={key}
            onPress={() => setSeg(key)}
            style={[styles.segBtn, seg === key && styles.segOn]}
          >
            <AppText variant="meta" color={seg === key ? 'text' : 'textMuted'}>
              {label}
            </AppText>
          </Pressable>
        ))}
      </ScrollView>

      {!q.length ? (
        <>
          <SectionHeader title="Recent searches" />
          {RECENT.map((t) => (
            <Pressable key={t} style={styles.recentRow} onPress={() => setQ(t)}>
              <Ionicons name="time-outline" size={18} color={colors.textMuted} />
              <AppText variant="body" color="textSecondary">
                {t}
              </AppText>
            </Pressable>
          ))}
          <SectionHeader title="Popular now" />
          <View style={styles.tags}>
            {POPULAR.map((t) => (
              <Pressable key={t} style={styles.tag} onPress={() => setQ(t)}>
                <AppText variant="caption" color="accent">
                  {t}
                </AppText>
              </Pressable>
            ))}
          </View>
          <SectionHeader title="Suggested tags" />
          <View style={styles.tags}>
            {TAGS.map((t) => (
              <Pressable key={t} style={styles.tag} onPress={() => setQ(t)}>
                <AppText variant="caption" color="textSecondary">
                  #{t}
                </AppText>
              </Pressable>
            ))}
          </View>
        </>
      ) : null}

      {q.length > 0 ? (
        <>
          <SectionHeader title="Results" subtitle={`Query: “${q}”`} />
          {empty ? (
            <EmptyState
              icon="search-outline"
              title="No matches"
              description="Try another keyword or clear filters in Phase 3."
              actionLabel="Clear"
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
                    price={formatPrice(e.priceFrom, e.currency)}
                    badge={e.badge ? <Badge tone={e.badge} /> : undefined}
                  />
                ))}
              {(seg === 'all' || seg === 'restaurants') &&
                results.r.map((r) => (
                  <ResultRow
                    key={r.id}
                    imageUrl={r.imageUrl}
                    title={r.name}
                    meta="Restaurant"
                    price={`${r.priceLevel}/4`}
                  />
                ))}
              {(seg === 'all' || seg === 'hotels') &&
                results.h.map((h) => (
                  <ResultRow
                    key={h.id}
                    imageUrl={h.imageUrl}
                    title={h.name}
                    meta={`${h.stars}★ hotel`}
                    price={formatPrice(h.priceFrom, h.currency)}
                  />
                ))}
              {(seg === 'all' || seg === 'flights') &&
                results.f.map((fl) => (
                  <ResultRow
                    key={fl.id}
                    imageUrl="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=200&q=80"
                    title={`${fl.from} → ${fl.to}`}
                    meta={fl.airline}
                    price={formatPrice(fl.price, fl.currency)}
                  />
                ))}
            </View>
          )}
        </>
      ) : null}

      <Pressable style={styles.filterFab}>
        <Ionicons name="options" size={22} color={colors.text} />
        <AppText variant="meta" color="text">
          Filters
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
}: {
  imageUrl: string;
  title: string;
  meta: string;
  price: string;
  badge?: ReactNode;
}) {
  return (
    <View style={styles.resultCard}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  pad: { paddingTop: spacing.md },
  title: { marginBottom: spacing.md },
  seg: { marginVertical: spacing.md },
  segBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
    borderRadius: radii.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
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
