import type { User } from '@/types';

/** Premium-only: buy and sell tickets through Resell. */
export function canAccessResell(user: Pick<User, 'isPremiumMember'>): boolean {
  return user.isPremiumMember;
}

/** Premium booking discount applied at checkout when billing is connected (mock: 10%). */
export const PREMIUM_BOOKING_DISCOUNT_PERCENT = 10;
