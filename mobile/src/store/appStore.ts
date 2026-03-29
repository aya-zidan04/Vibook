import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type AppState = {
  selectedCityId: string;
  setSelectedCityId: (id: string) => void;
  hasCompletedOnboarding: boolean;
  setHasCompletedOnboarding: (v: boolean) => void;
  isGuest: boolean;
  setGuest: (v: boolean) => void;
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      selectedCityId: 'c1',
      setSelectedCityId: (id) => set({ selectedCityId: id }),
      hasCompletedOnboarding: false,
      setHasCompletedOnboarding: (v) => set({ hasCompletedOnboarding: v }),
      isGuest: true,
      setGuest: (v) => set({ isGuest: v }),
    }),
    {
      name: 'vibook-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        selectedCityId: state.selectedCityId,
        hasCompletedOnboarding: state.hasCompletedOnboarding,
      }),
    },
  ),
);
