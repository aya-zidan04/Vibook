import { create } from 'zustand';
import type { User } from '@/types';

/** Optional in-memory user snapshot (unused in mock-only mode; kept for store shape compatibility). */
type SessionState = {
  serverUser: User | null;
  setServerUser: (user: User | null) => void;
};

export const useSessionStore = create<SessionState>((set) => ({
  serverUser: null,
  setServerUser: (user) => set({ serverUser: user }),
}));
