import { NavigatorScreenParams } from '@react-navigation/native';

export type MainTabParamList = {
  Home: undefined;
  Explore: undefined;
  Bookings: { title: string };
  Favorites: { title: string };
  Profile: { title: string };
};

export type RootStackParamList = {
  Splash: undefined;
  Welcome: undefined;
  Main: NavigatorScreenParams<MainTabParamList>;
  EventDetail: { eventId: string };
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
