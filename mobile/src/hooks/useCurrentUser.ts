import { useMemo } from 'react';
import type { User } from '@/types';
import { mergeProfileUser } from '@/services/profileMerge';
import { useAppStore } from '@/store/appStore';
import { useSessionStore } from '@/store/sessionStore';
import { useUserProfileStore } from '@/store/userProfileStore';
import type { UserProfileOverrides } from '@/store/userProfileStore';

const GUEST_PLACEHOLDER: User = {
  id: '0',
  name: '',
  email: '',
  phone: '',
  avatarUrl: null,
  cityId: '',
  isPremiumMember: false,
  walletBalance: 0,
  preferredLanguage: 'en',
};

export type UseCurrentUserResult = {
  baseline: User | null;
  overrides: UserProfileOverrides;
  user: User;
  setOverrides: (patch: Partial<UserProfileOverrides>) => void;
  resetProfile: () => void;
  firstName: string;
};

/** Display user from GET /users/me (session) plus temporary profile overrides. */
export function useCurrentUser(): UseCurrentUserResult {
  const overrides = useUserProfileStore((s) => s.overrides);
  const setOverrides = useUserProfileStore((s) => s.setOverrides);
  const resetProfile = useUserProfileStore((s) => s.reset);
  const serverUser = useSessionStore((s) => s.serverUser);
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);

  const baseline: User | null = serverUser ?? (isAuthenticated ? GUEST_PLACEHOLDER : null);

  const user = useMemo(() => {
    if (!baseline) return GUEST_PLACEHOLDER;
    return mergeProfileUser(baseline, overrides);
  }, [baseline, overrides]);

  const firstName = useMemo(() => user.name.split(/\s+/)[0] ?? user.name, [user.name]);

  return useMemo(
    () => ({
      baseline: serverUser,
      overrides,
      user,
      setOverrides,
      resetProfile,
      firstName,
    }),
    [serverUser, overrides, user, setOverrides, resetProfile, firstName],
  );
}
