import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { useBookingDraftStore } from '@/store/bookingDraftStore';
import { useFavoritesStore } from '@/store/favoritesStore';
import { useSessionStore } from '@/store/sessionStore';
import { useUserProfileStore } from '@/store/userProfileStore';

type AppState = {
  selectedCityId: string;
  setSelectedCityId: (id: string) => void;
  hasCompletedOnboarding: boolean;
  setHasCompletedOnboarding: (v: boolean) => void;
  /** True after a successful sign-in (mock). */
  isAuthenticated: boolean;
  setAuthenticated: (v: boolean) => void;
  isGuest: boolean;
  setGuest: (v: boolean) => void;
  /** Local preference; does not call the OS push API in this build. */
  pushNotificationsEnabled: boolean;
  setPushNotificationsEnabled: (v: boolean) => void;
  logout: () => void;
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      selectedCityId: 'gov-amman',
      setSelectedCityId: (id) => set({ selectedCityId: id }),
      hasCompletedOnboarding: false,
      setHasCompletedOnboarding: (v) => set({ hasCompletedOnboarding: v }),
      isAuthenticated: false,
      setAuthenticated: (v) => set({ isAuthenticated: v }),
      isGuest: true,
      setGuest: (v) => set({ isGuest: v }),
      pushNotificationsEnabled: true,
      setPushNotificationsEnabled: (v) => set({ pushNotificationsEnabled: v }),
      logout: () => {
        useSessionStore.getState().setServerUser(null);
        useBookingDraftStore.getState().setDraft(null);
        useBookingDraftStore.getState().setLastOrderId(null);
        useUserProfileStore.getState().reset();
        useFavoritesStore.getState().reset();
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
        pushNotificationsEnabled: state.pushNotificationsEnabled,
      }),
    },
  ),
);
