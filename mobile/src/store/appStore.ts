import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { logoutRequest } from '@/api/authApi';
import { clearTokens, getTokensSync } from '@/api/authSession';
import { useBookingDraftStore } from '@/store/bookingDraftStore';
import { useBusinessHubStore } from '@/store/businessHubStore';
import { useFavoritesStore } from '@/store/favoritesStore';
import { useSessionStore } from '@/store/sessionStore';
import { useUserProfileStore } from '@/store/userProfileStore';

type AppState = {
  selectedCityId: string;
  setSelectedCityId: (id: string) => void;
  hasCompletedOnboarding: boolean;
  setHasCompletedOnboarding: (v: boolean) => void;
  /** True after a successful sign-in. */
  isAuthenticated: boolean;
  setAuthenticated: (v: boolean) => void;
  isGuest: boolean;
  setGuest: (v: boolean) => void;
  logout: () => void;
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      selectedCityId: '5',
      setSelectedCityId: (id) => set({ selectedCityId: id }),
      hasCompletedOnboarding: false,
      setHasCompletedOnboarding: (v) => set({ hasCompletedOnboarding: v }),
      isAuthenticated: false,
      setAuthenticated: (v) => set({ isAuthenticated: v }),
      isGuest: true,
      setGuest: (v) => set({ isGuest: v }),
      logout: () => {
        void (async () => {
          const rt = getTokensSync()?.refreshToken;
          if (rt) {
            try {
              await logoutRequest(rt);
            } catch {
              /* still clear locally */
            }
          }
          await clearTokens();
        })();
        useSessionStore.getState().clearSession();
        useBookingDraftStore.getState().setDraft(null);
        useBookingDraftStore.getState().setLastOrderId(null);
        useUserProfileStore.getState().reset();
        useFavoritesStore.getState().reset();
        useBusinessHubStore.getState().resetApplicationGate();
        useBusinessHubStore.getState().replaceHubEvents([]);
        useBusinessHubStore.getState().replaceHubBookings([]);
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
