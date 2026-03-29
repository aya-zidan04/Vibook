import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { HomeScreen } from '../screens/home/HomeScreen';
import { ExploreScreen } from '../screens/explore/ExploreScreen';
import { PlaceholderTabScreen } from '../screens/placeholder/PlaceholderTabScreen';
import { colors, shadows } from '../theme';
import type { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

const tabIcon = (
  name: keyof typeof Ionicons.glyphMap,
  focused: boolean,
) => (
  <Ionicons
    name={name}
    size={24}
    color={focused ? colors.primary : colors.textMuted}
  />
);

export function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          paddingTop: 6,
          paddingBottom: 4,
          height: 62,
          ...shadows.tabBar,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ focused }) => tabIcon('home', focused),
        }}
      />
      <Tab.Screen
        name="Explore"
        component={ExploreScreen}
        options={{
          tabBarLabel: 'Explore',
          tabBarIcon: ({ focused }) => tabIcon('compass', focused),
        }}
      />
      <Tab.Screen
        name="Bookings"
        component={PlaceholderTabScreen}
        initialParams={{ title: 'My bookings' }}
        options={{
          tabBarIcon: ({ focused }) => tabIcon('ticket', focused),
        }}
      />
      <Tab.Screen
        name="Favorites"
        component={PlaceholderTabScreen}
        initialParams={{ title: 'Favorites' }}
        options={{
          tabBarIcon: ({ focused }) => tabIcon('heart', focused),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={PlaceholderTabScreen}
        initialParams={{ title: 'Profile' }}
        options={{
          tabBarIcon: ({ focused }) => tabIcon('person', focused),
        }}
      />
    </Tab.Navigator>
  );
}
