import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { AppText, EventCard, SearchBar, Screen } from '../../components';
import { PLACEHOLDER_EVENTS } from '../../data/eventPlaceholders';
import { colors, radii, shadows, spacing } from '../../theme';
import type { RootStackParamList } from '../../navigation/types';

export function ExploreScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { width } = useWindowDimensions();

  const columnWidth = useMemo(() => {
    const pad = spacing.md;
    const gap = spacing.sm + 4;
    return (width - pad * 2 - gap) / 2;
  }, [width]);

  const openEvent = (id: string) => {
    navigation.navigate('EventDetail', { eventId: id });
  };

  return (
    <>
      <StatusBar style="dark" />
      <Screen
        scroll={false}
        edges={['top', 'left', 'right']}
        contentStyle={styles.screenFill}
      >
        <View style={styles.top}>
          <View style={styles.searchRow}>
            <View style={styles.searchFlex}>
              <SearchBar onPress={() => {}} />
            </View>
            <Pressable
              style={({ pressed }) => [styles.filterBtn, shadows.sm, pressed && styles.filterPressed]}
              onPress={() => {}}
              accessibilityRole="button"
              accessibilityLabel="Filters"
            >
              <Ionicons name="options-outline" size={22} color={colors.primary} />
            </Pressable>
          </View>
          <AppText variant="caption" color="textSecondary" style={styles.subtitle}>
            Curated experiences to explore — sample content for layout.
          </AppText>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.gridContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.grid}>
            {PLACEHOLDER_EVENTS.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                variant="grid"
                style={{ width: columnWidth }}
                onPress={() => openEvent(event.id)}
              />
            ))}
          </View>
        </ScrollView>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  screenFill: {
    paddingHorizontal: 0,
  },
  top: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    gap: spacing.sm,
    backgroundColor: colors.background,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  searchFlex: {
    flex: 1,
  },
  filterBtn: {
    width: 52,
    height: 52,
    borderRadius: radii.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterPressed: {
    opacity: 0.9,
  },
  subtitle: {
    marginTop: 2,
  },
  scroll: {
    flex: 1,
  },
  gridContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xxl + spacing.lg,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    columnGap: spacing.sm + 4,
  },
});
