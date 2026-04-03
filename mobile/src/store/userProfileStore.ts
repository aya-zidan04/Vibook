import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

/**
 * Client-only profile overrides (mock phase). Replace with API-backed user later.
 */
export type UserProfileOverrides = {
  firstName?: string;
  lastName?: string;
  email?: string;
  nameAr?: string;
  phone?: string;
  /** Legacy; applied when firstName/lastName are absent */
  name?: string;
};

type State = {
  overrides: UserProfileOverrides;
  setOverrides: (patch: Partial<UserProfileOverrides>) => void;
  reset: () => void;
};

export const useUserProfileStore = create<State>()(
  persist(
    (set) => ({
      overrides: {},
      setOverrides: (patch) =>
        set((s) => ({
          overrides: { ...s.overrides, ...patch },
        })),
      reset: () => set({ overrides: {} }),
    }),
    {
      name: 'vibook-profile-overrides',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ overrides: s.overrides }),
    },
  ),
);
