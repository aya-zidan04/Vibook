import { resolveBackendMediaUrl } from '@/api/env';
import type { UserResponse } from '@/api/types';
import type { User } from '@/types';

export function userResponseToUser(u: UserResponse): User {
  const name = `${u.firstName} ${u.lastName}`.trim() || u.email;
  return {
    id: String(u.id),
    name,
    nameAr: name,
    email: u.email,
    phone: u.phone,
    avatarUrl: resolveBackendMediaUrl(u.profileImageUrl),
    cityId: '1',
    membershipTier: 'standard',
    walletBalance: 0,
    preferredLanguage: 'en',
  };
}
