import { useMemo } from 'react';
import type { User } from '@/types';
import { CURRENT_USER, mergeMockUser } from '@/services/mock';
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
 * Single source for mock identity + local profile overrides until backend auth exists.
 */
export function useMockUser(): UseMockUserResult {
  const overrides = useUserProfileStore((s) => s.overrides);
  const setOverrides = useUserProfileStore((s) => s.setOverrides);
  const resetProfile = useUserProfileStore((s) => s.reset);

  const user = useMemo(
    () => mergeMockUser(CURRENT_USER, overrides),
    [overrides],
  );

  const firstName = useMemo(() => user.name.split(/\s+/)[0] ?? user.name, [user.name]);

  return useMemo(
    () => ({
      baseline: CURRENT_USER,
      overrides,
      user,
      setOverrides,
      resetProfile,
      firstName,
    }),
    [overrides, user, setOverrides, resetProfile, firstName],
  );
}
