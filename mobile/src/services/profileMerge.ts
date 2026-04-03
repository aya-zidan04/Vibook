import type { User } from '@/types';
import type { UserProfileOverrides } from '@/store/userProfileStore';
import { joinFirstLast, nameToFirstLast } from '@/utils/profilePatch';

/** Merge mock baseline user with persisted local overrides (no network). */
export function mergeMockUser(base: User, overrides: UserProfileOverrides): User {
  const baseParts = nameToFirstLast(base.name);
  const baseFirst = baseParts.firstName;
  const baseLast = baseParts.lastName ?? '';

  const hasSplitOverride =
    overrides.firstName !== undefined || overrides.lastName !== undefined;

  let first: string;
  let last: string;
  if (hasSplitOverride) {
    first = overrides.firstName ?? baseFirst;
    last = overrides.lastName ?? baseLast;
  } else if (overrides.name !== undefined) {
    const p = nameToFirstLast(overrides.name);
    first = p.firstName;
    last = p.lastName ?? '';
  } else {
    first = baseFirst;
    last = baseLast;
  }

  const name = joinFirstLast(first, last);

  return {
    ...base,
    name,
    nameAr: overrides.nameAr ?? base.nameAr,
    email: overrides.email ?? base.email,
    phone: overrides.phone ?? base.phone,
  };
}
