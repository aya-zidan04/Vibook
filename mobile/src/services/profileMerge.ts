import type { User } from '@/types';
import type { UserProfileOverrides } from '@/store/userProfileStore';
import { joinFirstLast, nameToFirstLast } from '@/utils/profilePatch';

function resolveAvatarUrl(base: User, overrides: UserProfileOverrides): string | null {
  if (overrides.avatarUrl === undefined) {
    return base.avatarUrl;
  }
  if (overrides.avatarUrl === null) {
    return null;
  }
  const trimmed = overrides.avatarUrl.trim();
  return trimmed === '' ? null : trimmed;
}

/** Merge API user with temporary local overrides before save completes. */
export function mergeProfileUser(base: User, overrides: UserProfileOverrides): User {
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
    avatarUrl: resolveAvatarUrl(base, overrides),
  };
}
