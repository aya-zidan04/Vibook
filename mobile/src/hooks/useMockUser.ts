import { useMemo } from 'react';
import type { User } from '@/types';
import { isApiConfigured } from '@/config/api';
import { CURRENT_USER, mergeMockUser } from '@/services/mock';
import { useAppStore } from '@/store/appStore';
import { useSessionStore } from '@/store/sessionStore';
import { useUserProfileStore } from '@/store/userProfileStore';
import type { UserProfileOverrides } from '@/store/userProfileStore';

export type UseMockUserResult = {
  /** `CURRENT_USER` baseline from mock layer (swap source when API exists). */
  baseline: User;
  /** Persisted local overrides; same shape you might PATCH to `/me` later. */
  overrides: UserProfileOverrides;
  /** Baseline merged with overrides — use for display everywhere. */
  user: User;
  setOverrides: (patch: Partial<UserProfileOverrides>) => void;
  resetProfile: () => void;
  /** First whitespace-delimited token of `user.name` (e.g. greetings). */
  firstName: string;
};

/**
 * Baseline user: API session when configured + signed in; otherwise mock {@link CURRENT_USER}.
 * Local overrides still layer on top for quick edits until PATCH /me runs.
 */
export function useMockUser(): UseMockUserResult {
  const overrides = useUserProfileStore((s) => s.overrides);
  const setOverrides = useUserProfileStore((s) => s.setOverrides);
  const resetProfile = useUserProfileStore((s) => s.reset);
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const serverUser = useSessionStore((s) => s.serverUser);

  const baseline = useMemo(() => {
    if (isApiConfigured() && isAuthenticated && serverUser) return serverUser;
    return CURRENT_USER;
  }, [isAuthenticated, serverUser]);

  const user = useMemo(() => mergeMockUser(baseline, overrides), [baseline, overrides]);

  const firstName = useMemo(() => user.name.split(/\s+/)[0] ?? user.name, [user.name]);

  return useMemo(
    () => ({
      baseline,
      overrides,
      user,
      setOverrides,
      resetProfile,
      firstName,
    }),
    [baseline, overrides, user, setOverrides, resetProfile, firstName],
  );
}
