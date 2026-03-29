import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AppText, PrimaryButton } from '../../components';
import { getPlaceholderEventById } from '../../data/eventPlaceholders';
import { colors, radii, shadows, spacing } from '../../theme';
import type { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'EventDetail'>;

export function EventDetailScreen({ route }: Props) {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { eventId } = route.params;
  const event = getPlaceholderEventById(eventId);

  if (!event) {
    return (
      <View style={[styles.fallback, { paddingTop: insets.top + spacing.lg }]}>
        <StatusBar style="dark" />
        <AppText variant="title">Event not found</AppText>
        <PrimaryButton title="Go back" onPress={() => navigation.goBack()} style={styles.fallbackBtn} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollInner}
        showsVerticalScrollIndicator={false}
        bounces
      >
        <View style={styles.hero}>
          <Image
            source={{ uri: event.imageUrl }}
            style={styles.heroImage}
            contentFit="cover"
            transition={200}
          />
          <LinearGradient
            colors={['rgba(18,19,26,0.1)', 'rgba(18,19,26,0.55)']}
            style={styles.heroGradient}
          />
          <Pressable
            style={[styles.backBtn, { top: insets.top + 8 }]}
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={24} color={colors.surface} />
          </Pressable>
        </View>

        <View style={styles.sheet}>
          <View style={styles.badge}>
            <AppText variant="label" color="primary">
              {event.category}
            </AppText>
          </View>
          <AppText variant="title" color="text" style={styles.title}>
            {event.title}
          </AppText>
          <AppText variant="price" color="primary" style={styles.price}>
            {event.priceLabel}
          </AppText>

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Ionicons name="calendar-outline" size={20} color={colors.primary} />
              </View>
              <View style={styles.infoText}>
                <AppText variant="caption" color="textMuted">
                  Date
                </AppText>
                <AppText variant="bodyMedium" color="text">
                  {event.dateLabel}
                </AppText>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Ionicons name="time-outline" size={20} color={colors.primary} />
              </View>
              <View style={styles.infoText}>
                <AppText variant="caption" color="textMuted">
                  Time
                </AppText>
                <AppText variant="bodyMedium" color="text">
                  {event.timeLabel}
                </AppText>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Ionicons name="location-outline" size={20} color={colors.primary} />
              </View>
              <View style={styles.infoText}>
                <AppText variant="caption" color="textMuted">
                  Location
                </AppText>
                <AppText variant="bodyMedium" color="text">
                  {event.location}
                </AppText>
              </View>
            </View>
          </View>

          <View style={styles.descBlock}>
            <AppText variant="subtitle" color="text" style={styles.descTitle}>
              About this event
            </AppText>
            <AppText variant="body" color="textSecondary" style={styles.descBody}>
              {event.description}
            </AppText>
          </View>

          <View style={{ height: insets.bottom + 100 }} />
        </View>
      </ScrollView>

      <View
        style={[
          styles.footer,
          shadows.lg,
          {
            paddingBottom: Math.max(insets.bottom, spacing.md),
            paddingTop: spacing.md,
          },
        ]}
      >
        <PrimaryButton title="Book now" onPress={() => {}} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollInner: {
    paddingBottom: 0,
  },
  hero: {
    height: 320,
    backgroundColor: colors.surfaceMuted,
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  backBtn: {
    position: 'absolute',
    left: spacing.md,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.overlayLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  sheet: {
    marginTop: -spacing.xl,
    backgroundColor: colors.background,
    borderTopLeftRadius: radii.xxl,
    borderTopRightRadius: radii.xxl,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryMuted,
    paddingVertical: 6,
    paddingHorizontal: spacing.sm + 2,
    borderRadius: radii.sm,
    marginBottom: spacing.sm,
  },
  title: {
    letterSpacing: -0.4,
    marginBottom: spacing.sm,
  },
  price: {
    marginBottom: spacing.lg,
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoText: {
    flex: 1,
    gap: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: spacing.md,
  },
  descBlock: {
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  descTitle: {
    letterSpacing: -0.2,
  },
  descBody: {
    lineHeight: 24,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  fallback: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
    gap: spacing.md,
  },
  fallbackBtn: {
    alignSelf: 'flex-start',
  },
});
