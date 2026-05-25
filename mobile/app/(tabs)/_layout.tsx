import { useMemo } from 'react';
import { Platform, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '@/i18n/useTranslation';
import { bottomTabSoftCrossFade } from '@/navigation/transitionPresets';
import { useLocaleStore } from '@/store/localeStore';
import { createShadows, useThemeColors } from '@/theme';
import { tabBarLabelTextStyle } from '@/theme/typography';
import type { ThemeColors } from '@/theme/palettes';

/** Tab bar stays LTR: Explore → Booking → Resell → Favorites → Me (even when app UI is RTL). */
export default function TabsLayout() {
  const { t } = useTranslation();
  const locale = useLocaleStore((s) => s.locale);
  const colors = useThemeColors();
  const styles = useMemo(() => createTabStyles(colors), [colors]);
  const tabLabelStyle = useMemo(() => tabBarLabelTextStyle(locale), [locale]);

  return (
    <Tabs
      initialRouteName="explore"
      screenOptions={{
        headerShown: false,
        ...bottomTabSoftCrossFade,
        tabBarStyle: [
          styles.tabBar,
          {
            paddingBottom: Platform.OS === 'ios' ? 22 : 12,
            height: Platform.OS === 'ios' ? 88 : 68,
            direction: 'ltr',
          },
        ],
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: tabLabelStyle,
        tabBarItemStyle: styles.tabItem,
        tabBarShowLabel: true,
      }}
    >
      <Tabs.Screen
        name="explore"
        options={{
          title: t('tabs.explore'),
          tabBarAccessibilityLabel: t('tabs.explore'),
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons name={focused ? 'compass' : 'compass-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="booking"
        options={{
          title: t('tabs.booking'),
          tabBarAccessibilityLabel: t('tabs.booking'),
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons name={focused ? 'calendar' : 'calendar-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="resell"
        options={{
          title: t('tabs.resell'),
          tabBarAccessibilityLabel: t('tabs.resell'),
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons
              name={focused ? 'swap-horizontal' : 'swap-horizontal-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: t('tabs.favorites'),
          tabBarAccessibilityLabel: t('tabs.favorites'),
          tabBarActiveTintColor: colors.accent,
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons name={focused ? 'heart' : 'heart-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="me"
        options={{
          title: t('tabs.me'),
          tabBarAccessibilityLabel: t('tabs.me'),
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
function createTabStyles(colors: ThemeColors) {
  const sh = createShadows(colors);
  return StyleSheet.create({
    tabBar: {
      backgroundColor: colors.sheetSurface,
      paddingTop: 8,
      ...sh.tabBar,
    },
    tabItem: {
      paddingVertical: 4,
    },
  });
}

