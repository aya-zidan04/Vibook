import type { ReactNode } from 'react';
import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '@/auth/authContext';
import { login as loginRequest } from '@/api/adminApi';
import { getStoredToken, getStoredUser, setStoredToken, setStoredUser } from '@/api/client';
import type { RoleName, UserResponse } from '@/api/types';
import { ADMIN_ACCESS_DENIED } from '@/auth/authErrors';

function hasAdminRole(roles: RoleName[] | undefined): boolean {
  return roles?.includes('ROLE_ADMIN') ?? false;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [token, setToken] = useState<string | null>(() => getStoredToken());
  const [user, setUser] = useState<UserResponse | null>(() => getStoredUser());

  const login = useCallback(
    async (email: string, password: string) => {
      const data = await loginRequest(email.trim(), password);
      if (!hasAdminRole(data.user?.roles)) {
        throw new Error(ADMIN_ACCESS_DENIED);
      }
      setStoredToken(data.token);
      setStoredUser(data.user);
      setToken(data.token);
      setUser(data.user);
      navigate('/dashboard', { replace: true });
    },
    [navigate],
  );

  const logout = useCallback(() => {
    setStoredToken(null);
    setStoredUser(null);
    setToken(null);
    setUser(null);
    navigate('/login', { replace: true });
  }, [navigate]);

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token),
      login,
      logout,
    }),
    [token, user, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
