import { useMemo } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/layout/Screen';
import { SectionHeader } from '@/components/layout/SectionHeader';
import { LogoutSprite } from '@/components/icons/LogoutSprite';
import { AppText } from '@/components/ui/AppText';
import { HeroAmbientOverlay } from '@/components/ui/HeroAmbientOverlay';
import { PrimaryButton, SecondaryButton } from '@/components/ui/Button';
import { NavigationChevronForward } from '@/components/ui/NavigationChevron';
import { useTranslation } from '@/i18n/useTranslation';
import { useMockUser } from '@/hooks/useMockUser';
import { useAppStore } from '@/store/appStore';
import { buttonMetrics, createShadows, radii, spacing, useThemeColors } from '@/theme';
import { lightColors as lightSw } from '@/theme/paletteColors';
import { meProfileCardLightEffect } from '@/theme/visualEffects';
import { useThemeStore } from '@/store/themeStore';
import { textAlignStart } from '@/utils/rtlText';
import type { ThemeColors } from '@/theme/palettes';

/** Me profile card base — light mode sage (#DCE7CC). */
const PROFILE_HEADER_BASE_LIGHT = lightSw.sageBorder;

const MENU_AUTH_ONLY: { key: string; labelKey: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'membership', labelKey: 'me.menuMembership', icon: 'diamond-outline' },
  { key: 'resell', labelKey: 'me.menuResell', icon: 'swap-horizontal-outline' },
  { key: 'payment', labelKey: 'me.menuPayment', icon: 'card-outline' },
];

const MENU_PUBLIC: { key: string; labelKey: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'help', labelKey: 'me.menuHelp', icon: 'help-circle-outline' },
  { key: 'about', labelKey: 'me.menuAbout', icon: 'information-circle-outline' },
  { key: 'settings', labelKey: 'me.menuSettings', icon: 'settings-outline' },
];

export default function MeScreen() {
  const router = useRouter();
  const { t, locale, isRTL } = useTranslation();
  const colors = useThemeColors();
  const isLight = useThemeStore((s) => s.colorScheme) === 'light';
  const styles = useMemo(() => createStyles(colors, isLight), [colors, isLight]);
  const { user } = useMockUser();
  const displayName = locale === 'ar' && user.nameAr ? user.nameAr : user.name;
  const logout = useAppStore((s) => s.logout);
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);

  const menuItems = isAuthenticated ? [...MENU_AUTH_ONLY, ...MENU_PUBLIC] : MENU_PUBLIC;

  const handleLogout = () => {
    logout();
    router.replace('/entry');
  };

  const openMenu = (key: string) => {
    switch (key) {
      case 'membership':
        router.push('/membership');
        break;
      case 'resell':
        router.push('/resell');
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
        <View style={styles.header}>
          <LinearGradient
            colors={
              isLight
                ? [PROFILE_HEADER_BASE_LIGHT, PROFILE_HEADER_BASE_LIGHT]
                : [colors.sectionSurface, 'transparent']
            }
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
          <HeroAmbientOverlay />
          {user.avatarUrl ? (
            <Image source={{ uri: user.avatarUrl }} style={styles.avatar} contentFit="cover" />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Ionicons
                name="person"
                size={40}
                color={isLight ? colors.icon : colors.placeholder}
              />
            </View>
          )}
          <View style={styles.headerText}>
            <AppText variant="h1" color="text" style={styles.headerName}>
              {displayName}
            </AppText>
            {user.isPremiumMember ? (
              <View style={styles.tier}>
                <AppText variant="label" color="primaryLight">
                  {t('membership.planName').toUpperCase()}
                </AppText>
              </View>
            ) : null}
          </View>
          <PrimaryButton
            title={t('me.editProfile')}
            onPress={() => router.push('/edit-profile')}
            style={styles.edit}
          />
        </View>
      ) : (
        <View style={styles.guestHeader}>
          <LinearGradient
            colors={
              isLight
                ? [PROFILE_HEADER_BASE_LIGHT, PROFILE_HEADER_BASE_LIGHT]
                : [colors.sectionSurface, 'transparent']
            }
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
          <HeroAmbientOverlay />
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
            title={t('auth.loginCta')}
            onPress={() => router.push('/login')}
            style={styles.guestAuthBtn}
          />
          <SecondaryButton
            sheet
            title={t('auth.createAccountCta')}
            onPress={() => router.push('/signup')}
            style={styles.guestSecondaryBtn}
          />
        </View>
      )}

      <SectionHeader title={t('settings.businessForPartners')} />
      <Pressable
        style={({ pressed }) => [styles.businessCard, pressed && styles.businessCardPressed]}
        onPress={() => router.push('/business')}
        accessibilityRole="button"
        accessibilityLabel={t('settings.businessForPartners')}
      >
        <View style={styles.businessIcon}>
          <Ionicons name="business-outline" size={22} color={colors.primaryLight} />
        </View>
        <View style={styles.businessText}>
          <AppText variant="body-em" color="text">
            {t('settings.businessForPartners')}
          </AppText>
          <AppText variant="caption" color="rowDescription" numberOfLines={2}>
            {t('settings.businessSubtitle')}
          </AppText>
        </View>
        <NavigationChevronForward size={20} color={colors.chevron} />
      </Pressable>

      {isAuthenticated ? <SectionHeader title={t('me.account')} /> : null}
      <View style={[styles.menu, styles.accountMenu]}>
        {menuItems.map((item, index) => (
          <Pressable
            key={item.key}
            style={[styles.menuRow, index < menuItems.length - 1 && styles.menuRowDivider]}
            onPress={() => openMenu(item.key)}
            accessibilityRole="button"
            accessibilityLabel={t(item.labelKey)}
          >
            <View style={styles.menuIcon}>
              <Ionicons name={item.icon} size={20} color={colors.primaryLight} />
            </View>
            <AppText variant="body-em" color="text" style={styles.menuLabel}>
              {t(item.labelKey)}
            </AppText>
            <NavigationChevronForward size={18} color={colors.chevron} />
          </Pressable>
        ))}
      </View>

      {isAuthenticated ? (
        <Pressable
          style={({ pressed }) => [styles.logoutCard, pressed && styles.logoutCardPressed]}
          onPress={handleLogout}
          accessibilityRole="button"
          accessibilityLabel={t('me.logout')}
        >
          <View style={styles.logoutCardContent}>
            <LogoutSprite size={20} color={colors.error} />
            <AppText variant="body-em" color="error" style={styles.logoutLabel}>
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

function createStyles(colors: ThemeColors, isLight: boolean) {
  const shadows = createShadows(colors);
  const profileHeaderShadow = isLight
    ? Platform.select({
        ios: {
          shadowColor: colors.emptyStateIcon,
          shadowOffset: meProfileCardLightEffect.shadowOffset,
          shadowOpacity: meProfileCardLightEffect.shadowOpacity,
          shadowRadius: meProfileCardLightEffect.shadowRadius,
        },
        android: { elevation: meProfileCardLightEffect.androidElevation },
        default: {},
      })
    : {};
  return StyleSheet.create({
    pad: { paddingTop: spacing.md },
    header: {
      alignItems: 'center',
      borderRadius: radii.xxl,
      padding: spacing.lg,
      marginBottom: spacing.lg,
      borderWidth: 1,
      borderColor: isLight ? meProfileCardLightEffect.borderColor : colors.border,
      overflow: 'hidden',
      ...profileHeaderShadow,
    },
    avatar: {
      width: 88,
      height: 88,
      borderRadius: 44,
      borderWidth: 3,
      borderColor: isLight ? colors.primaryLight : colors.primary,
      marginBottom: spacing.md,
    },
    avatarPlaceholder: {
      backgroundColor: colors.card,
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
      overflow: 'hidden',
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
    guestSecondaryBtn: {
      alignSelf: 'stretch',
      width: '100%',
      marginTop: spacing.sm,
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
      backgroundColor: colors.iconContainerBg,
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
      backgroundColor: colors.errorBg,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.errorBorder,
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
      backgroundColor: colors.iconContainerBg,
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
