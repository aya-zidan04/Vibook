import { DarkTheme, DefaultTheme, type Theme } from '@react-navigation/native';
import type { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import type { ColorScheme } from '@/store/themeStore';

/** Opaque navigator scenes default to system white — force see-through so the app canvas shows. */
export const transparentScene = { backgroundColor: 'transparent' as const };

export const transparentStackScreenOptions: NativeStackNavigationOptions = {
  contentStyle: transparentScene,
};

export const transparentTabScreenOptions: BottomTabNavigationOptions = {
  sceneStyle: transparentScene,
};

function withTransparentCanvas(base: Theme): Theme {
  return {
    ...base,
    colors: {
      ...base.colors,
      background: 'transparent',
      card: 'transparent',
    },
  };
}

export const lightNavigationTheme = withTransparentCanvas(DefaultTheme);
export const darkNavigationTheme = withTransparentCanvas(DarkTheme);

export function navigationThemeFor(scheme: ColorScheme): Theme {
  return scheme === 'dark' ? darkNavigationTheme : lightNavigationTheme;
}
