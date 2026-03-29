import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SplashScreen } from '../screens/splash/SplashScreen';
import { WelcomeScreen } from '../screens/welcome/WelcomeScreen';
import { EventDetailScreen } from '../screens/event/EventDetailScreen';
import { MainTabNavigator } from './MainTabNavigator';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Main" component={MainTabNavigator} />
      <Stack.Screen
        name="EventDetail"
        component={EventDetailScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
    </Stack.Navigator>
  );
}
