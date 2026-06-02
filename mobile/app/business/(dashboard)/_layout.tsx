import type { BottomTabBarProps, BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { Redirect, Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BusinessTabBar } from '@/components/navigation/BusinessTabBar';
import { useTranslation } from '@/i18n/useTranslation';
import { transparentTabScreenOptions } from '@/navigation/navigationCanvas';
import { bottomTabSoftCrossFade } from '@/navigation/transitionPresets';
import { refreshBusinessHubLists } from '@/services/businessHubSync';
import { useBusinessHubStore } from '@/store/businessHubStore';
import { useLocaleStore } from '@/store/localeStore';
import { useThemeColors } from '@/theme';
import { useThemeStore } from '@/store/themeStore';

function renderPartnerTabBar(props: BottomTabBarProps) {
  return <BusinessTabBar {...props} />;
}

function partnerTabOptions(
  routeName: string,
  t: (key: string) => string,
  colors: ReturnType<typeof useThemeColors>,
  colorScheme: 'light' | 'dark',
): BottomTabNavigationOptions {
  const title = (() => {
    switch (routeName) {
      case 'home':
        return t('businessHub.tabHome');
      case 'events':
        return t('businessHub.tabEvents');
      case 'bookings':
        return t('businessHub.tabBookings');
      case 'profile':
        return t('businessHub.tabBusiness');
      default:
        return routeName;
    }
  })();

  const tabBarIcon: BottomTabNavigationOptions['tabBarIcon'] = ({ color, focused, size }) => {
    const name = ((): keyof typeof Ionicons.glyphMap => {
      switch (routeName) {
        case 'home':
          return focused ? 'grid' : 'grid-outline';
        case 'events':
          return focused ? 'calendar' : 'calendar-outline';
        case 'bookings':
          return focused ? 'ticket' : 'ticket-outline';
        case 'profile':
          return focused ? 'business' : 'business-outline';
        default:
          return 'ellipse-outline';
      }
    })();
    return <Ionicons name={name} size={size} color={color} />;
  };

  return {
    headerShown: false,
    title,
    tabBarActiveTintColor: colors.primary,
    tabBarInactiveTintColor: colorScheme === 'light' ? colors.tabInactive : colors.textMuted,
    tabBarShowLabel: true,
    tabBarIcon,
  };
}

export default function BusinessDashboardLayout() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const colorScheme = useThemeStore((s) => s.colorScheme);
  const locale = useLocaleStore((s) => s.locale);
  const applicationStatus = useBusinessHubStore((s) => s.applicationStatus);

  useFocusEffect(
    useCallback(() => {
      if (applicationStatus !== 'approved') return;
      void refreshBusinessHubLists().catch(() => {
        /* offline / session — screens still show last fetch */
      });
    }, [applicationStatus]),
  );

  if (applicationStatus !== 'approved') {
    return <Redirect href="/business" />;
  }

  const opt = (name: string) => partnerTabOptions(name, t, colors, colorScheme);

  return (
    <Tabs
      key={locale}
      initialRouteName="home"
      tabBar={renderPartnerTabBar}
      screenOptions={{
        ...transparentTabScreenOptions,
        ...bottomTabSoftCrossFade,
      }}
    >
      <Tabs.Screen name="home" options={opt('home')} />
      <Tabs.Screen name="events" options={opt('events')} />
      <Tabs.Screen name="bookings" options={opt('bookings')} />
      <Tabs.Screen name="profile" options={opt('profile')} />
    </Tabs>
  );
}
