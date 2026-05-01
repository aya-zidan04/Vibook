import { create } from 'zustand';
import type { UserResponse } from '@/api/types';
import type { User } from '@/types';
import { userResponseToUser } from '@/services/api/userMap';

type SessionState = {
  serverUser: User | null;
  /** Raw backend profile (for PUT /users/{id} and field-level edits). */
  authSource: UserResponse | null;
  setSessionFromAuthResponse: (user: UserResponse) => void;
  patchSessionUser: (user: UserResponse) => void;
  setServerUser: (user: User | null) => void;
  clearSession: () => void;
};

export const useSessionStore = create<SessionState>((set) => ({
  serverUser: null,
  authSource: null,
  setSessionFromAuthResponse: (user) =>
    set({
      authSource: user,
      serverUser: userResponseToUser(user),
    }),
  patchSessionUser: (user) =>
    set({
      authSource: user,
      serverUser: userResponseToUser(user),
    }),
  setServerUser: (user) => set({ serverUser: user }),
  clearSession: () => set({ serverUser: null, authSource: null }),
}));
