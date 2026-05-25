import { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/layout/Screen';
import { SectionHeader } from '@/components/layout/SectionHeader';
import { LogoutSprite } from '@/components/icons/LogoutSprite';
import { AppText } from '@/components/ui/AppText';
import { PrimaryButton } from '@/components/ui/Button';
import { formatIntForLocale } from '@/utils/format';
import { chevronForwardTrailing } from '@/utils/rtl';
import { useTranslation } from '@/i18n/useTranslation';
import { useMockUser } from '@/hooks/useMockUser';
import { listMyBookings } from '@/api/bookingsApi';
import { bookingResponseToBooking } from '@/services/api/bookingMap';
import { useAppStore } from '@/store/appStore';
import type { Booking } from '@/types';
import { buttonMetrics, createShadows, radii, spacing, useThemeColors } from '@/theme';
import { textAlignStart } from '@/utils/rtlText';
import type { ThemeColors } from '@/theme/palettes';

const MENU_ACCOUNT: { key: string; labelKey: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'vouchers', labelKey: 'me.menuVouchers', icon: 'pricetag-outline' },
  { key: 'bookings', labelKey: 'me.menuBookings', icon: 'ticket-outline' },
  { key: 'membership', labelKey: 'me.menuMembership', icon: 'diamond-outline' },
  { key: 'payment', labelKey: 'me.menuPayment', icon: 'card-outline' },
  { key: 'help', labelKey: 'me.menuHelp', icon: 'help-circle-outline' },
  { key: 'about', labelKey: 'me.menuAbout', icon: 'information-circle-outline' },
  { key: 'settings', labelKey: 'me.menuSettings', icon: 'settings-outline' },
];

export default function MeScreen() {
  const router = useRouter();
  const { t, locale, isRTL } = useTranslation();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { user } = useMockUser();
  const displayName = locale === 'ar' && user.nameAr ? user.nameAr : user.name;
  const logout = useAppStore((s) => s.logout);
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const hasCompletedOnboarding = useAppStore((s) => s.hasCompletedOnboarding);
  const [bookings, setBookings] = useState<Booking[]>([]);

  /** Logout row was hidden for guests because it only checked `isAuthenticated`. */
  const showLogoutRow = isAuthenticated || hasCompletedOnboarding;

  const loadBookings = useCallback(() => {
    if (!isAuthenticated) {
      setBookings([]);
      return;
    }
    void (async () => {
      try {
        const rows = await listMyBookings();
        setBookings(rows.map(bookingResponseToBooking));
      } catch {
        setBookings([]);
      }
    })();
  }, [isAuthenticated]);

  useFocusEffect(
    useCallback(() => {
      loadBookings();
    }, [loadBookings]),
  );

  const upcoming = bookings.filter((b) => b.status === 'upcoming').length;

  const handleLogout = () => {
    logout();
    router.replace('/entry');
  };

  const openMenu = (key: string) => {
    switch (key) {
      case 'vouchers':
        router.push('/vouchers');
        break;
      case 'bookings':
        router.push('/(tabs)/booking');
        break;
      case 'membership':
        router.push('/membership');
        break;
      case 'payment':
        router.push('/payment-methods');
        break;
      case 'help':
        router.push('/help');
        break;
      case 'about':
        router.push('/about');
        break;
      case 'settings':
        router.push('/settings');
        break;
      default:
        break;
    }
  };

  return (
    <Screen scroll contentStyle={styles.pad}>
      {isAuthenticated ? (
        <LinearGradient colors={[colors.primaryMuted, 'transparent']} style={styles.header}>
          {user.avatarUrl ? (
            <Image source={{ uri: user.avatarUrl }} style={styles.avatar} contentFit="cover" />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Ionicons name="person" size={40} color={colors.textMuted} />
            </View>
          )}
          <View style={styles.headerText}>
            <AppText variant="h1" color="text" style={styles.headerName}>
              {displayName}
            </AppText>
            <View style={styles.tier}>
              <AppText variant="label" color="accent">
                {user.membershipTier.toUpperCase()}
              </AppText>
            </View>
          </View>
          <PrimaryButton
            title={t('me.editProfile')}
            onPress={() => router.push('/edit-profile')}
            style={styles.edit}
          />
        </LinearGradient>
      ) : (
        <LinearGradient colors={[colors.primaryMuted, 'transparent']} style={styles.guestHeader}>
          <AppText
            variant="h1"
            color="text"
            style={[styles.guestTitle, { textAlign: textAlignStart(isRTL) }]}
          >
            {t('me.account')}
          </AppText>
          <AppText
            variant="body"
            color="textSecondary"
            style={[styles.guestSubtitle, { textAlign: textAlignStart(isRTL) }]}
          >
            {t('me.guestAccountLead')}
          </AppText>
          <PrimaryButton
            title={t('me.guestAuthCta')}
            onPress={() => router.push('/login')}
            style={styles.guestAuthBtn}
          />
        </LinearGradient>
      )}

      <View style={styles.stats}>
        <StatItem
          label={t('me.bookings')}
          value={formatIntForLocale(bookings.length, locale)}
          icon="calendar-outline"
          colors={colors}
          boxStyle={styles.stat}
        />
        <StatItem
          label={t('me.upcoming')}
          value={formatIntForLocale(upcoming, locale)}
          icon="time-outline"
          colors={colors}
          boxStyle={styles.stat}
        />
      </View>

      <SectionHeader title={t('settings.businessForPartners')} />
      <Pressable
        style={({ pressed }) => [styles.businessCard, pressed && styles.businessCardPressed]}
        onPress={() => router.push('/business')}
        accessibilityRole="button"
        accessibilityLabel={t('settings.businessForPartners')}
      >
        <View style={styles.businessIcon}>
          <Ionicons name="business-outline" size={22} color={colors.primary} />
        </View>
        <View style={styles.businessText}>
          <AppText variant="body-em" color="text">
            {t('settings.businessForPartners')}
          </AppText>
          <AppText variant="caption" color="textMuted" numberOfLines={2}>
            {t('settings.businessSubtitle')}
          </AppText>
        </View>
        <Ionicons name={chevronForwardTrailing()} size={20} color={colors.textMuted} />
      </Pressable>

      {isAuthenticated ? <SectionHeader title={t('me.account')} /> : null}
      <View style={[styles.menu, styles.accountMenu]}>
        {MENU_ACCOUNT.map((item, index) => (
          <Pressable
            key={item.key}
            style={[styles.menuRow, index < MENU_ACCOUNT.length - 1 && styles.menuRowDivider]}
            onPress={() => openMenu(item.key)}
            accessibilityRole="button"
            accessibilityLabel={t(item.labelKey)}
          >
            <View style={styles.menuIcon}>
              <Ionicons name={item.icon} size={20} color={colors.primary} />
            </View>
            <AppText variant="body-em" color="text" style={styles.menuLabel}>
              {t(item.labelKey)}
            </AppText>
            <Ionicons name={chevronForwardTrailing()} size={18} color={colors.textMuted} />
          </Pressable>
        ))}
      </View>

      {showLogoutRow ? (
        <Pressable
          style={({ pressed }) => [styles.logoutCard, pressed && styles.logoutCardPressed]}
          onPress={handleLogout}
          accessibilityRole="button"
          accessibilityLabel={t('me.logout')}
        >
          <View style={styles.logoutCardContent}>
            <LogoutSprite size={20} color={colors.accent} />
            <AppText variant="body-em" color="accent" style={styles.logoutLabel}>
              {t('me.logout')}
            </AppText>
          </View>
        </Pressable>
      ) : null}

      <AppText variant="label" color="textMuted" style={styles.version}>
        {t('common.version')}
      </AppText>
    </Screen>
  );
}

const statValueText = { fontWeight: '700' as const };

function StatItem({
  label,
  value,
  icon,
  colors,
  boxStyle,
}: {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  colors: ThemeColors;
  boxStyle: object;
}) {
  return (
    <View style={boxStyle}>
      <Ionicons name={icon} size={16} color={colors.accent} />
      <AppText variant="h3" color="text" style={statValueText}>
        {value}
      </AppText>
      <AppText variant="caption" color="textMuted">
        {label}
      </AppText>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  const shadows = createShadows(colors);
  return StyleSheet.create({
    pad: { paddingTop: spacing.md },
    header: {
      alignItems: 'center',
      borderRadius: radii.xxl,
      padding: spacing.lg,
      marginBottom: spacing.lg,
      borderWidth: 1,
      borderColor: colors.border,
    },
    avatar: {
      width: 88,
      height: 88,
      borderRadius: 44,
      borderWidth: 3,
      borderColor: colors.primary,
      marginBottom: spacing.md,
    },
    avatarPlaceholder: {
      backgroundColor: colors.surfaceMuted,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerText: {
      alignItems: 'center',
      gap: spacing.sm,
      width: '100%',
    },
    headerName: {
      textAlign: 'center',
    },
    tier: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: radii.xs,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    edit: { marginTop: spacing.lg, alignSelf: 'stretch', width: '100%' },
    guestHeader: {
      alignItems: 'stretch',
      borderRadius: radii.xxl,
      padding: spacing.lg,
      marginBottom: spacing.lg,
      borderWidth: 1,
      borderColor: colors.border,
    },
    guestTitle: {
      marginBottom: spacing.sm,
    },
    guestSubtitle: {
      marginBottom: spacing.xl,
    },
    guestAuthBtn: {
      alignSelf: 'stretch',
      width: '100%',
    },
    stats: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: spacing.lg,
      gap: spacing.sm,
    },
    stat: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: radii.md,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.sm,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      alignItems: 'center',
      gap: 2,
      ...shadows.sm,
    },
    businessCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      padding: spacing.lg,
      marginBottom: spacing.xl,
      backgroundColor: colors.card,
      borderRadius: radii.xl,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      ...shadows.md,
    },
    businessCardPressed: { opacity: 0.9 },
    businessIcon: {
      width: 48,
      height: 48,
      borderRadius: radii.lg,
      backgroundColor: colors.primaryMuted,
      alignItems: 'center',
      justifyContent: 'center',
    },
    businessText: { flex: 1, gap: 4 },
    accountMenu: {
      marginTop: spacing.md,
    },
    menu: {
      backgroundColor: colors.card,
      borderRadius: radii.xl,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      overflow: 'hidden',
      marginBottom: 0,
      ...shadows.md,
    },
    menuRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 14,
      paddingHorizontal: spacing.md,
      gap: spacing.md,
    },
    menuRowDivider: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    logoutCard: {
      marginTop: spacing.md,
      marginBottom: spacing.xl,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 14,
      paddingHorizontal: spacing.md,
      borderRadius: buttonMetrics.borderRadius,
      backgroundColor: colors.accentMuted,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.accentBorder,
      ...shadows.sm,
    },
    logoutCardPressed: {
      opacity: 0.9,
    },
    logoutCardContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.md,
    },
    logoutLabel: { textAlign: 'center' },
    menuIcon: {
      width: 40,
      height: 40,
      borderRadius: radii.md,
      backgroundColor: colors.primaryMuted,
      alignItems: 'center',
      justifyContent: 'center',
    },
    menuLabel: { flex: 1 },
    version: {
      textAlign: 'center',
      marginBottom: spacing.xxxl,
    },
  });
}
