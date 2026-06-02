import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { persistThemeSnapshot, THEME_PERSIST_KEY } from '@/store/persistSnapshot';
import { darkPalette, lightPalette, type ThemeColors } from '@/theme/palettes';

export type ColorScheme = 'light' | 'dark';

type ThemeState = {
  colorScheme: ColorScheme;
  setColorScheme: (scheme: ColorScheme) => void;
};

export function paletteFor(scheme: ColorScheme): ThemeColors {
  return scheme === 'light' ? lightPalette : darkPalette;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      colorScheme: 'light',
      setColorScheme: (colorScheme) => {
        set({ colorScheme });
        void persistThemeSnapshot(colorScheme);
      },
    }),
    {
      name: THEME_PERSIST_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ colorScheme: s.colorScheme }),
    },
  ),
);

/** Subscribe to the resolved semantic color object; use in every themed screen/component. */
export function useThemeColors(): ThemeColors {
  return useThemeStore((s) => paletteFor(s.colorScheme));
}
