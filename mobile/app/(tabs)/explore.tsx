import { ScrollView, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/layout/Screen';
import { SectionHeader } from '@/components/layout/SectionHeader';
import { CategoryChip } from '@/components/ui/CategoryChip';
import { AppText } from '@/components/ui/AppText';
import { MOCK_CATEGORIES, MOCK_CITIES, MOCK_EVENTS, MOCK_PACKAGES } from '@/mock';
import { colors, radii, spacing } from '@/theme';

const THEMES = [
  'Concerts',
  'Sports',
  'Dining',
  'Family',
  'Nightlife',
  'Wellness',
  'Travel',
  'Premium',
  'Workshops',
  'Art & culture',
];

export default function ExploreScreen() {
  return (
    <Screen scroll contentStyle={styles.pad}>
      <LinearGradient colors={[colors.primaryMuted, 'transparent']} style={styles.hero}>
        <AppText variant="overline" color="accent">
          Discover
        </AppText>
        <AppText variant="display" color="text" style={styles.heroTitle}>
          Curated for your city
        </AppText>
        <AppText variant="body" color="textSecondary">
          Editorial picks, hidden gems, and premium venues — updated weekly.
        </AppText>
      </LinearGradient>

      <SectionHeader title="Browse by theme" subtitle="Tap to filter (UI only in Phase 1)" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.row}>
        {THEMES.map((t, i) => (
          <CategoryChip key={t} label={t} selected={i === 0} icon="sparkles-outline" />
        ))}
      </ScrollView>

      <SectionHeader title="Category grid" actionLabel="All cities" />
      <View style={styles.grid}>
        {MOCK_CATEGORIES.map((c) => (
          <View key={c.id} style={styles.gridItem}>
            <Ionicons name="ellipse" size={8} color={colors.primary} />
            <AppText variant="meta" color="text" numberOfLines={2} style={styles.gridLabel}>
              {c.labelEn}
            </AppText>
          </View>
        ))}
      </View>

      <SectionHeader title="Trending destinations" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {MOCK_CITIES.map((city) => (
          <View key={city.id} style={styles.cityCard}>
            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&q=80',
              }}
              style={styles.cityImg}
              contentFit="cover"
            />
            <LinearGradient colors={['transparent', colors.background]} style={styles.cityGrad} />
            <AppText variant="h3" color="text" style={styles.cityText}>
              {city.nameEn}
            </AppText>
          </View>
        ))}
      </ScrollView>

      <SectionHeader title="Weekend picks" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {MOCK_EVENTS.map((e) => (
          <View key={e.id} style={styles.pick}>
            <Image source={{ uri: e.imageUrl }} style={styles.pickImg} contentFit="cover" />
            <AppText variant="bodyMedium" color="text" numberOfLines={2}>
              {e.title}
            </AppText>
          </View>
        ))}
      </ScrollView>

      <SectionHeader title="Premium venues" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {MOCK_PACKAGES.map((p) => (
          <View key={p.id} style={styles.pick}>
            <Image source={{ uri: p.imageUrl }} style={styles.pickImg} contentFit="cover" />
            <AppText variant="bodyMedium" color="text" numberOfLines={2}>
              {p.title}
            </AppText>
          </View>
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  pad: { paddingTop: spacing.md },
  hero: {
    borderRadius: radii.xxl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  heroTitle: { marginVertical: spacing.sm },
  row: { marginBottom: spacing.lg },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  gridItem: {
    width: '31%',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
    minHeight: 88,
    justifyContent: 'space-between',
  },
  gridLabel: { flex: 1 },
  cityCard: {
    width: 140,
    height: 180,
    marginRight: spacing.md,
    borderRadius: radii.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  cityImg: { ...StyleSheet.absoluteFillObject },
  cityGrad: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    padding: spacing.sm,
  },
  cityText: {},
  pick: {
    width: 200,
    marginRight: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    paddingBottom: spacing.sm,
  },
  pickImg: { height: 120, width: '100%' },
});
