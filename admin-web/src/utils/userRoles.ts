import type { RoleName } from '@/api/types';

/** Backend requires ROLE_USER to remain in the set. */
export function withAdminRole(roles: RoleName[], isAdmin: boolean): RoleName[] {
  const next = new Set(roles);
  if (isAdmin) next.add('ROLE_ADMIN');
  else next.delete('ROLE_ADMIN');
  if (!next.has('ROLE_USER')) next.add('ROLE_USER');
  return Array.from(next);
}

export function userIsAdmin(roles: RoleName[] | undefined): boolean {
  return roles?.includes('ROLE_ADMIN') ?? false;
}
