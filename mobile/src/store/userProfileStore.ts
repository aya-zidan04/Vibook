import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

/**
 * Temporary profile overrides until PUT /users completes (API is source of truth).
 */
export type UserProfileOverrides = {
  firstName?: string;
  lastName?: string;
  email?: string;
  nameAr?: string;
  phone?: string;
  /** Local `file://` or remote URL; `null` clears the photo (optional field). */
  avatarUrl?: string | null;
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
