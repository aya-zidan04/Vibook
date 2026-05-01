import { createContext } from 'react';
import type { UserResponse } from '@/api/types';

export type AuthContextValue = {
  token: string | null;
  user: UserResponse | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
