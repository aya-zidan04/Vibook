import type { User } from '@/types';
import type { UserProfileOverrides } from '@/store/userProfileStore';

/** Merge mock baseline user with persisted local overrides (no network). */
export function mergeMockUser(base: User, overrides: UserProfileOverrides): User {
  return {
    ...base,
    name: overrides.name ?? base.name,
    nameAr: overrides.nameAr ?? base.nameAr,
    phone: overrides.phone ?? base.phone,
  };
}
