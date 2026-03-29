import { ScrollView, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import {
  AppText,
  CategoryPill,
  EventCard,
  Screen,
  SearchBar,
  SectionHeader,
} from '../../components';
import { PLACEHOLDER_EVENTS } from '../../data/eventPlaceholders';
import { colors, spacing } from '../../theme';
import type { RootStackParamList } from '../../navigation/types';

const CATEGORIES = ['All', 'Music', 'Sports', 'Arts', 'Food', 'Wellness'];

export function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const selectedCategory = 'All';

  const openEvent = (id: string) => {
    navigation.navigate('EventDetail', { eventId: id });
  };

  const featured = PLACEHOLDER_EVENTS.slice(0, 3);
  const trending = PLACEHOLDER_EVENTS.slice(2, 6);

  return (
    <>
      <StatusBar style="dark" />
      <Screen
        scroll
        contentStyle={styles.scrollContent}
        edges={['top', 'left', 'right']}
      >
        <View style={styles.locationRow}>
          <Ionicons name="location-sharp" size={18} color={colors.primary} />
          <AppText variant="bodyMedium" color="text" style={styles.locationText}>
            Riyadh
          </AppText>
          <Ionicons name="chevron-down" size={16} color={colors.textMuted} />
        </View>

        <View style={styles.headerBlock}>
          <AppText variant="caption" color="textSecondary">
            Good morning
          </AppText>
          <AppText variant="title" color="text" style={styles.headline}>
            Discover events near you
          </AppText>
        </View>

        <SearchBar onPress={() => {}} />

        <View style={styles.section}>
          <SectionHeader title="Categories" actionLabel="See all" onActionPress={() => {}} />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.hScroll}
          >
            {CATEGORIES.map((label) => (
              <CategoryPill
                key={label}
                label={label}
                selected={label === selectedCategory}
                onPress={() => {}}
              />
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <SectionHeader
            eyebrow="Handpicked"
            title="Featured events"
            actionLabel="See all"
            onActionPress={() => {}}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.hScrollFeatured}
          >
            {featured.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                variant="featured"
                onPress={() => openEvent(event.id)}
              />
            ))}
          </ScrollView>
        </View>

        <View style={styles.sectionLast}>
          <SectionHeader
            eyebrow="Popular"
            title="Trending now"
            actionLabel="Explore"
            onActionPress={() => {}}
          />
          <View style={styles.trendingList}>
            {trending.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                variant="list"
                onPress={() => openEvent(event.id)}
              />
            ))}
          </View>
        </View>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingTop: spacing.sm,
    gap: spacing.section,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.xs,
  },
  locationText: {
    letterSpacing: -0.2,
  },
  headerBlock: {
    gap: 4,
    marginBottom: spacing.xs,
  },
  headline: {
    letterSpacing: -0.5,
  },
  section: {
    marginTop: spacing.xs,
  },
  sectionLast: {
    marginTop: spacing.xs,
    paddingBottom: spacing.lg,
  },
  hScroll: {
    paddingRight: spacing.md,
    marginHorizontal: -2,
  },
  hScrollFeatured: {
    paddingRight: spacing.md,
    paddingBottom: spacing.xs,
  },
  trendingList: {
    gap: 0,
  },
});
