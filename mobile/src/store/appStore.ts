import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { useBookingDraftStore } from '@/store/bookingDraftStore';

type AppState = {
  selectedCityId: string;
  setSelectedCityId: (id: string) => void;
  hasCompletedOnboarding: boolean;
  setHasCompletedOnboarding: (v: boolean) => void;
  /** True after a successful sign-in (mock or real). */
  isAuthenticated: boolean;
  setAuthenticated: (v: boolean) => void;
  isGuest: boolean;
  setGuest: (v: boolean) => void;
  /**
   * Clears session-like state and resets entry flow so the user sees `/entry` again
   * (cold start also shows entry while `hasCompletedOnboarding` is false).
   */
  logout: () => void;
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      selectedCityId: 'c1',
      setSelectedCityId: (id) => set({ selectedCityId: id }),
      hasCompletedOnboarding: false,
      setHasCompletedOnboarding: (v) => set({ hasCompletedOnboarding: v }),
      isAuthenticated: false,
      setAuthenticated: (v) => set({ isAuthenticated: v }),
      isGuest: true,
      setGuest: (v) => set({ isGuest: v }),
      logout: () => {
        useBookingDraftStore.getState().setDraft(null);
        useBookingDraftStore.getState().setLastOrderId(null);
        set({
          isAuthenticated: false,
          hasCompletedOnboarding: false,
          isGuest: true,
        });
      },
    }),
    {
      name: 'vibook-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        selectedCityId: state.selectedCityId,
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
