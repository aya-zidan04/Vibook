import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/ui/AppText';
import { HeroAmbientOverlay } from '@/components/ui/HeroAmbientOverlay';
import { PrimaryButton, SecondaryButton } from '@/components/ui/Button';
import { NavigationChevronForward } from '@/components/ui/NavigationChevron';
import { Screen } from '@/components/layout/Screen';
import { useTranslation } from '@/i18n/useTranslation';
import { MicroBars, MicroSparkline } from '@/components/business/DashboardMicroViz';
import { useBusinessHubStore } from '@/store/businessHubStore';
import type { BusinessEventRecord } from '@/types/businessHub';
import { bookingBucketsLast7Days, eventBucketsNext7Days } from '@/utils/dashboardVitals';
import { createShadows, radii, spacing, useThemeColors, useThemeGradients } from '@/theme';
import type { ThemeColors } from '@/theme/palettes';

type DashboardHeroTypography = { primary: string; secondary: string };

/** Hero labels on the business dashboard gradient. */
function dashboardHeroTypography(colors: ThemeColors): DashboardHeroTypography {
  return {
    primary: colors.textPrimary,
    secondary: colors.textSecondary,
  };
}

function startOfTodayMs(): number {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function eventIsUpcoming(e: BusinessEventRecord): boolean {
  if (e.hidden) return false;
  const t = Date.parse(e.date);
  if (Number.isNaN(t)) return true;
  return t >= startOfTodayMs();
}

export default function BusinessDashboardHomeScreen() {
  const colors = useThemeColors();
  const gradients = useThemeGradients();
  const heroText = useMemo(() => dashboardHeroTypography(colors), [colors]);
  const sh = useMemo(() => createShadows(colors), [colors]);
  const styles = useMemo(() => createStyles(colors, sh), [colors, sh]);
  const router = useRouter();
  const { t, isRTL } = useTranslation();
  const profile = useBusinessHubStore((s) => s.profile);
  const events = useBusinessHubStore((s) => s.events);
  const bookings = useBusinessHubStore((s) => s.bookings);

  const pendingBookings = useMemo(
    () => bookings.filter((b) => b.status === 'pending').length,
    [bookings],
  );

  const upcomingEvents = useMemo(
    () =>
      [...events]
        .filter(eventIsUpcoming)
        .sort((a, b) => Date.parse(a.date) - Date.parse(b.date)),
    [events],
  );

  const booking7d = useMemo(() => bookingBucketsLast7Days(bookings), [bookings]);
  const events7d = useMemo(() => eventBucketsNext7Days(events), [events]);

  const businessName = profile.displayName.trim() || t('businessHub.dashUntitledBusiness');

  const dynamicMessage = useMemo(() => {
    if (pendingBookings > 0) {
      return pendingBookings === 1
        ? t('businessHub.dashControlBookingUrgentOne')
        : t('businessHub.dashControlBookingUrgentPlural').replace('{p}', String(pendingBookings));
    }
    if (upcomingEvents.length > 0) {
      return t('businessHub.dashControlEventsSoon').replace('{n}', String(upcomingEvents.length));
    }
    return t('businessHub.dashControlAllClear');
  }, [pendingBookings, upcomingEvents, t]);

  const attentionBlocks = useMemo(() => {
    type Block = {
      key: string;
      icon: keyof typeof Ionicons.glyphMap;
      title: string;
      subtitle: string;
      onPress: () => void;
      urgent?: boolean;
    };
    const blocks: Block[] = [];
    if (pendingBookings > 0) {
      blocks.push({
        key: 'bookings',
        icon: 'notifications-outline',
        title: t('businessHub.dashBookingsTitle'),
        subtitle:
          pendingBookings === 1
            ? t('businessHub.dashControlBookingUrgentOne')
            : t('businessHub.dashControlBookingUrgentPlural').replace('{p}', String(pendingBookings)),
        onPress: () => router.push('/business/bookings'),
        urgent: true,
      });
    }
    if (upcomingEvents.length > 0) {
      const next = upcomingEvents[0];
      blocks.push({
        key: 'events',
        icon: 'calendar-outline',
        title: t('businessHub.dashEventsTitle'),
        subtitle: `${next.title} · ${next.date}`,
        onPress: () => router.push(`/business/events/${next.id}`),
      });
    }
    return blocks;
  }, [pendingBookings, upcomingEvents, t, router]);

  const recentActivity = useMemo(() => {
    const rows: { id: string; icon: keyof typeof Ionicons.glyphMap; title: string; meta: string }[] =
      [];
    const sorted = [...bookings].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    sorted.slice(0, 2).forEach((b) => {
      rows.push({
        id: `b-${b.id}`,
        icon: 'ticket-outline',
        title: t('businessHub.dashActivityBooking').replace('{title}', b.listingTitle),
        meta: b.createdAt.slice(0, 10),
      });
    });
    return rows.slice(0, 4);
  }, [bookings, t]);

  const statItems = useMemo(
    () => [
      {
        key: 'events',
        value: events.length,
        label: t('businessHub.dashEventsTitle'),
        href: '/business/events' as const,
        icon: 'calendar-outline' as const,
      },
      {
        key: 'bookings',
        value: bookings.length,
        label: t('businessHub.dashBookingsTitle'),
        href: '/business/bookings' as const,
        icon: 'ticket-outline' as const,
        pending: pendingBookings,
      },
    ],
    [events.length, bookings.length, pendingBookings, t],
  );

  return (
    <Screen scroll contentStyle={styles.screenPad}>
      <View style={[styles.hero, sh.lg]}>
        <LinearGradient
          colors={[...gradients.hero]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
        <HeroAmbientOverlay />
        <View style={styles.heroTopRow}>
          <AppText variant="overline" color={heroText.secondary}>
            {t('businessHub.dashKicker')}
          </AppText>
        </View>
        <AppText variant="h1" color={heroText.primary} style={styles.heroBusinessName} numberOfLines={2}>
          {businessName}
        </AppText>
        <View style={[styles.pulseLine, { backgroundColor: colors.primaryMuted }]}>
          <AppText variant="body-em" color={heroText.primary} style={styles.heroDynamic}>
            {dynamicMessage}
          </AppText>
        </View>
        <View style={styles.heroTrend}>
          <View style={styles.heroSparkWrap}>
            <MicroSparkline
              values={booking7d}
              colors={colors}
              maxHeight={12}
              barColor={heroText.secondary}
            />
          </View>
          <AppText variant="label" color={heroText.secondary} style={styles.heroTrendLabel}>
            {t('businessHub.dashVizTrend')}
          </AppText>
        </View>
        <PrimaryButton
          title={t('businessHub.dashCreateEventCta')}
          onPress={() => router.push('/business/events/new')}
          style={styles.heroCta}
        />
      </View>

      <AppText variant="overline" color="textMuted" style={styles.sectionEyebrow}>
        {t('businessHub.dashAtAGlance')}
      </AppText>
      <View style={[styles.statsRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        {statItems.map((s) => {
          const urgent = s.key === 'bookings' && (s.pending ?? 0) > 0;
          return (
            <Pressable
              key={s.key}
              accessibilityRole="button"
              onPress={() => router.push(s.href)}
              style={({ pressed }) => [
                styles.statCell,
                {
                  borderColor: urgent ? colors.warning : colors.borderLight,
                  backgroundColor: urgent ? colors.primaryMuted : colors.surface,
                },
                sh.sm,
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.statHead}>
                <View
                  style={[
                    styles.statIconWrap,
                    { backgroundColor: urgent ? colors.backgroundElevated : colors.primaryMuted },
                  ]}
                >
                  <Ionicons name={s.icon} size={20} color={urgent ? colors.warning : colors.primary} />
                </View>
                <AppText variant="body-em" color="text" style={styles.statValueCompact}>
                  {s.value}
                </AppText>
                {urgent ? (
                  <View style={[styles.pendingDot, { backgroundColor: colors.warning }]} />
                ) : null}
              </View>
              {s.key === 'events' ? (
                <View style={styles.statVizBox}>
                  <MicroBars
                    values={events7d}
                    colors={colors}
                    maxHeight={26}
                    barColor={colors.accent}
                  />
                </View>
              ) : (
                <View style={styles.statVizBox}>
                  <MicroBars values={booking7d} colors={colors} maxHeight={26} />
                </View>
              )}
              <AppText variant="label" color="textSecondary" numberOfLines={1} style={styles.statLabel}>
                {s.label}
              </AppText>
            </Pressable>
          );
        })}
      </View>

      <AppText variant="overline" color="textMuted" style={styles.sectionEyebrow}>
        {t('businessHub.dashSectionAttention')}
      </AppText>
      <View style={[styles.attentionCard, { borderColor: colors.borderLight, backgroundColor: colors.surface }, sh.md]}>
        <View
          style={[
            styles.attentionVizInset,
            {
              backgroundColor: colors.surfaceMuted,
              borderBottomColor: colors.borderLight,
            },
          ]}
        >
          <View style={[styles.attentionVizRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <View style={[styles.attentionVizCol, styles.attentionVizColGrow]}>
              <AppText variant="label" color="textMuted" numberOfLines={1}>
                {t('businessHub.dashVizBookings7d')}
              </AppText>
              <MicroBars values={booking7d} colors={colors} maxHeight={24} />
            </View>
            <View style={[styles.attentionVizCol, styles.attentionVizColGrow]}>
              <AppText variant="label" color="textMuted" numberOfLines={1}>
                {t('businessHub.dashVizSchedule7d')}
              </AppText>
              <MicroBars values={events7d} colors={colors} maxHeight={24} barColor={colors.accent} />
            </View>
          </View>
        </View>
        {attentionBlocks.length === 0 ? (
          <View style={styles.attentionEmpty}>
            <Ionicons name="checkmark-done-circle-outline" size={36} color={colors.success} />
            <AppText variant="body-em" color="textSecondary" style={styles.attentionEmptyText}>
              {t('businessHub.dashAttentionNone')}
            </AppText>
          </View>
        ) : (
          attentionBlocks.map((b, i) => (
            <Pressable
              key={b.key}
              accessibilityRole="button"
              onPress={b.onPress}
              style={({ pressed }) => [
                styles.attentionRow,
                i < attentionBlocks.length - 1 && {
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderBottomColor: colors.borderLight,
                },
                pressed && styles.pressed,
              ]}
            >
              <View
                style={[
                  styles.attentionIcon,
                  {
                    backgroundColor: b.urgent ? colors.primaryMuted : colors.surfaceMuted,
                  },
                ]}
              >
                <Ionicons
                  name={b.icon}
                  size={22}
                  color={b.urgent ? colors.warning : colors.primary}
                />
              </View>
              <View style={styles.attentionCopy}>
                <AppText variant="body-em" color="text">
                  {b.title}
                </AppText>
                <AppText variant="caption" color="textMuted" numberOfLines={2}>
                  {b.subtitle}
                </AppText>
              </View>
              <NavigationChevronForward size={20} color={colors.icon} />
            </Pressable>
          ))
        )}
      </View>

      <AppText variant="overline" color="textMuted" style={styles.sectionEyebrow}>
        {t('businessHub.dashSectionActivity')}
      </AppText>
      <View style={[styles.activityCard, { borderColor: colors.borderLight, backgroundColor: colors.surfaceMuted }, sh.sm]}>
        {recentActivity.map((row, i) => (
          <View
            key={row.id}
            style={[
              styles.activityRow,
              i < recentActivity.length - 1 && {
                borderBottomWidth: StyleSheet.hairlineWidth,
                borderBottomColor: colors.borderLight,
              },
            ]}
          >
            <View style={[styles.activityIcon, { backgroundColor: colors.backgroundElevated }]}>
              <Ionicons name={row.icon} size={18} color={colors.primaryLight} />
            </View>
            <View style={styles.activityCopy}>
              <AppText variant="caption" color="text" numberOfLines={2}>
                {row.title}
              </AppText>
              <AppText variant="label" color="textMuted">
                {row.meta}
              </AppText>
            </View>
          </View>
        ))}
      </View>

      <SecondaryButton
        title={t('businessHub.exitBusiness')}
        onPress={() => router.replace('/(tabs)/explore')}
        style={styles.exitFull}
      />
    </Screen>
  );
}

function createStyles(colors: ThemeColors, sh: ReturnType<typeof createShadows>) {
  return StyleSheet.create({
    screenPad: {
      paddingTop: spacing.md,
      paddingBottom: spacing.xxxl + spacing.lg,
      gap: spacing.sm,
    },
    hero: {
      borderRadius: radii.xxl,
      padding: spacing.lg,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.borderLight,
      gap: spacing.md,
    },
    heroTopRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    heroBusinessName: {
      letterSpacing: -0.6,
      lineHeight: 34,
    },
    pulseLine: {
      alignSelf: 'stretch',
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: radii.lg,
    },
    heroDynamic: {
      lineHeight: 22,
    },
    heroCta: {
      alignSelf: 'stretch',
    },
    heroTrend: {
      alignSelf: 'stretch',
      gap: 6,
    },
    heroSparkWrap: {
      paddingHorizontal: spacing.xs,
    },
    heroTrendLabel: {
      letterSpacing: 0.3,
    },
    sectionEyebrow: {
      marginTop: spacing.md,
      textTransform: 'uppercase',
    },
    statsRow: {
      gap: spacing.sm,
      marginTop: 4,
    },
    statCell: {
      flex: 1,
      minWidth: 0,
      borderRadius: radii.xl,
      borderWidth: 1.5,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.sm,
      alignItems: 'stretch',
      gap: 6,
    },
    statHead: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.xs,
    },
    statIconWrap: {
      width: 32,
      height: 32,
      borderRadius: radii.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    statValueCompact: {
      flex: 1,
      textAlign: 'center',
    },
    statVizBox: {
      minHeight: 30,
      justifyContent: 'flex-end',
      gap: 4,
    },
    statLabel: {
      textAlign: 'center',
      marginTop: 2,
    },
    pendingDot: {
      width: 7,
      height: 7,
      borderRadius: 4,
    },
    attentionCard: {
      borderRadius: radii.xxl,
      borderWidth: 1,
      overflow: 'hidden',
      marginTop: 4,
    },
    attentionVizInset: {
      paddingHorizontal: spacing.md,
      paddingTop: spacing.md,
      paddingBottom: spacing.sm,
      borderBottomWidth: StyleSheet.hairlineWidth,
      gap: spacing.sm,
    },
    attentionVizRow: {
      gap: spacing.md,
      alignItems: 'flex-end',
    },
    attentionVizCol: {
      width: 72,
      gap: 6,
    },
    attentionVizColGrow: {
      flex: 1,
      width: undefined,
      minWidth: 0,
    },
    attentionEmpty: {
      paddingVertical: spacing.xl,
      paddingHorizontal: spacing.lg,
      alignItems: 'center',
      gap: spacing.sm,
    },
    attentionEmptyText: {
      textAlign: 'center',
    },
    attentionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.md,
      gap: spacing.md,
    },
    attentionIcon: {
      width: 44,
      height: 44,
      borderRadius: radii.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    attentionCopy: {
      flex: 1,
      gap: 4,
    },
    activityCard: {
      borderRadius: radii.xl,
      borderWidth: 1,
      overflow: 'hidden',
      marginTop: 4,
      marginBottom: spacing.sm,
    },
    activityRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.md,
      gap: spacing.md,
    },
    activityIcon: {
      width: 32,
      height: 32,
      borderRadius: radii.sm,
      alignItems: 'center',
      justifyContent: 'center',
    },
    activityCopy: {
      flex: 1,
      gap: 4,
    },
    pressed: { opacity: 0.88 },
    exitFull: {
      marginTop: spacing.lg,
      alignSelf: 'stretch',
    },
  });
}
