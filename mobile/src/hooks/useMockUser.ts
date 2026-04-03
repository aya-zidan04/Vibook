import { useMemo } from 'react';
import type { User } from '@/types';
import { CURRENT_USER, mergeMockUser } from '@/services/mock';
import { useUserProfileStore } from '@/store/userProfileStore';
import type { UserProfileOverrides } from '@/store/userProfileStore';

export type UseMockUserResult = {
  baseline: User;
  overrides: UserProfileOverrides;
  user: User;
  setOverrides: (patch: Partial<UserProfileOverrides>) => void;
  resetProfile: () => void;
  firstName: string;
};

/** Display user from mock baseline plus local profile overrides. */
export function useMockUser(): UseMockUserResult {
  const overrides = useUserProfileStore((s) => s.overrides);
  const setOverrides = useUserProfileStore((s) => s.setOverrides);
  const resetProfile = useUserProfileStore((s) => s.reset);

  const baseline = CURRENT_USER;

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
