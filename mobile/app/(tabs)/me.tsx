import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/layout/Screen';
import { SectionHeader } from '@/components/layout/SectionHeader';
import { AppText } from '@/components/ui/AppText';
import { PrimaryButton } from '@/components/ui/Button';
import { formatIntForLocale } from '@/utils/format';
import { chevronForwardTrailing } from '@/utils/rtl';
import { useTranslation } from '@/i18n/useTranslation';
import { useMockUser } from '@/hooks/useMockUser';
import { MOCK_BOOKINGS, MOCK_VOUCHERS } from '@/services/mock';
import { useAppStore } from '@/store/appStore';
import { radii, spacing, useThemeColors } from '@/theme';
import type { ThemeColors } from '@/theme/palettes';

const MENU_ACCOUNT: { key: string; labelKey: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'vouchers', labelKey: 'me.menuVouchers', icon: 'pricetag-outline' },
  { key: 'favorites', labelKey: 'me.menuFavorites', icon: 'heart-outline' },
  { key: 'bookings', labelKey: 'me.menuBookings', icon: 'ticket-outline' },
  { key: 'membership', labelKey: 'me.menuMembership', icon: 'diamond-outline' },
  { key: 'payment', labelKey: 'me.menuPayment', icon: 'card-outline' },
  { key: 'notifications', labelKey: 'me.menuNotif', icon: 'notifications-outline' },
  { key: 'language', labelKey: 'me.menuLanguage', icon: 'language-outline' },
  { key: 'help', labelKey: 'me.menuHelp', icon: 'help-circle-outline' },
  { key: 'about', labelKey: 'me.menuAbout', icon: 'information-circle-outline' },
  { key: 'settings', labelKey: 'me.menuSettings', icon: 'settings-outline' },
];

export default function MeScreen() {
  const router = useRouter();
  const { t, locale } = useTranslation();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { user } = useMockUser();
  const displayName = locale === 'ar' && user.nameAr ? user.nameAr : user.name;
  const logout = useAppStore((s) => s.logout);
  const upcoming = MOCK_BOOKINGS.filter((b) => b.status === 'upcoming').length;

  const handleLogout = () => {
    logout();
    router.replace('/entry');
  };

  const openMenu = (key: string) => {
    switch (key) {
      case 'vouchers':
        router.push('/vouchers');
        break;
      case 'favorites':
        router.push('/(tabs)/favorites');
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
      case 'notifications':
        router.push('/notifications');
        break;
      case 'language':
        router.push('/language-currency');
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
            <AppText variant="meta" color="accent">
              {user.membershipTier.toUpperCase()}
            </AppText>
          </View>
        </View>
        <PrimaryButton title={t('me.editProfile')} onPress={() => router.push('/edit-profile')} style={styles.edit} />
      </LinearGradient>

      <View style={styles.stats}>
        <StatItem
          label={t('me.bookings')}
          value={formatIntForLocale(MOCK_BOOKINGS.length, locale)}
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

      <SectionHeader title={t('me.vouchersTitle')} />
      <ScrollView
        horizontal
        nestedScrollEnabled
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.voucherScrollContent}
        accessibilityRole="list"
      >
        {MOCK_VOUCHERS.map((v) => (
          <View key={v.id} style={styles.voucher}>
            <AppText variant="meta" color="accent">
              {v.code}
            </AppText>
            <AppText variant="h3" color="text" numberOfLines={2}>
              {locale === 'ar' && v.titleAr ? v.titleAr : v.title}
            </AppText>
            <AppText variant="caption" color="textMuted">
              {t('me.expires')} {v.expiresAt.slice(0, 10)}
            </AppText>
          </View>
        ))}
      </ScrollView>

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
          <AppText variant="bodyMedium" color="text">
            {t('settings.businessForPartners')}
          </AppText>
          <AppText variant="caption" color="textMuted" numberOfLines={2}>
            {t('settings.businessSubtitle')}
          </AppText>
        </View>
        <Ionicons name={chevronForwardTrailing()} size={20} color={colors.textMuted} />
      </Pressable>

      <SectionHeader title={t('me.account')} />
      <View style={styles.menu}>
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
            <AppText variant="bodyMedium" color="text" style={styles.menuLabel}>
              {t(item.labelKey)}
            </AppText>
            <Ionicons name={chevronForwardTrailing()} size={18} color={colors.textMuted} />
          </Pressable>
        ))}
      </View>

      <View style={styles.logoutGap} />

      <Pressable
        style={({ pressed }) => [styles.logoutButton, pressed && styles.logoutButtonPressed]}
        onPress={handleLogout}
        accessibilityRole="button"
        accessibilityLabel={t('me.logout')}
      >
        <View style={styles.logoutButtonInner}>
          <Ionicons name="log-out-outline" size={22} color={colors.error} />
          <AppText variant="bodyMedium" style={styles.logoutButtonLabel}>
            {t('me.logout')}
          </AppText>
        </View>
      </Pressable>

      <AppText variant="meta" color="textMuted" style={styles.version}>
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
    stats: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: spacing.lg,
      gap: spacing.sm,
    },
    stat: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: radii.md,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.sm,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      gap: 2,
    },
    voucherScrollContent: {
      flexDirection: 'row',
      gap: spacing.md,
      paddingBottom: 2,
      marginBottom: spacing.xl,
    },
    voucher: {
      width: 280,
      padding: spacing.md,
      backgroundColor: colors.surface,
      borderRadius: radii.xl,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 6,
    },
    businessCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      padding: spacing.lg,
      marginBottom: spacing.xl,
      backgroundColor: colors.surface,
      borderRadius: radii.xl,
      borderWidth: 1,
      borderColor: colors.border,
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
    menu: {
      backgroundColor: colors.surface,
      borderRadius: radii.xl,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
      marginBottom: spacing.xl,
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
    logoutGap: {
      height: spacing.xl,
    },
    logoutButton: {
      width: '100%',
      paddingVertical: 16,
      paddingHorizontal: spacing.lg,
      borderRadius: radii.lg,
      borderWidth: 2,
      borderColor: colors.error,
      backgroundColor: 'rgba(163, 90, 64, 0.18)',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.lg,
    },
    logoutButtonInner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    logoutButtonPressed: {
      opacity: 0.85,
    },
    logoutButtonLabel: {
      color: colors.error,
      fontWeight: '700',
    },
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
