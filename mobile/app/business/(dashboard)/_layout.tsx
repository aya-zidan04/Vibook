import type { BottomTabBarProps, BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import { Redirect, Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BusinessTabBar } from '@/components/navigation/BusinessTabBar';
import { useTranslation } from '@/i18n/useTranslation';
import { useBusinessHubStore } from '@/store/businessHubStore';
import { useThemeColors } from '@/theme';

function renderPartnerTabBar(props: BottomTabBarProps) {
  return <BusinessTabBar {...props} />;
}

function partnerTabOptions(
  routeName: string,
  t: (key: string) => string,
  colors: ReturnType<typeof useThemeColors>,
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
    tabBarActiveTintColor: colors.accent,
    tabBarInactiveTintColor: colors.textMuted,
    tabBarShowLabel: true,
    tabBarIcon,
  };
}

export default function BusinessDashboardLayout() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const applicationStatus = useBusinessHubStore((s) => s.applicationStatus);

  if (applicationStatus !== 'approved') {
    return <Redirect href="/business" />;
  }

  const opt = (name: string) => partnerTabOptions(name, t, colors);

  return (
    <Tabs initialRouteName="home" tabBar={renderPartnerTabBar}>
      <Tabs.Screen name="home" options={opt('home')} />
      <Tabs.Screen name="events" options={opt('events')} />
      <Tabs.Screen name="bookings" options={opt('bookings')} />
      <Tabs.Screen name="profile" options={opt('profile')} />
    </Tabs>
  );
}
