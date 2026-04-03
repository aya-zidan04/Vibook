import { create } from 'zustand';
import type { User } from '@/types';

/**
 * Server-backed user snapshot when {@code EXPO_PUBLIC_API_BASE_URL} is set and the user is authenticated.
 * Tokens live in secure storage; this store is memory-first (rebuilt on cold start via refresh).
 */
type SessionState = {
  serverUser: User | null;
  setServerUser: (user: User | null) => void;
};

export const useSessionStore = create<SessionState>((set) => ({
  serverUser: null,
  setServerUser: (user) => set({ serverUser: user }),
}));
