import type { User } from '@/types';

export function dtoTierToUi(tier: string): User['membershipTier'] {
  const x = tier.toUpperCase();
  if (x === 'PLATINUM') return 'platinum';
  if (x === 'GOLD') return 'gold';
  return 'standard';
}

export function uiTierRank(tier: User['membershipTier']): number {
  if (tier === 'gold' || tier === 'platinum') return 1;
  return 0;
}

export function dtoTierRank(tier: string): number {
  return uiTierRank(dtoTierToUi(tier));
}

export function toNum(v: number | string | null | undefined): number {
  if (v == null) return 0;
  if (typeof v === 'number') return v;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

/** Match mock “yearly save” pattern for comparison UI. */
export function estimatedYearlyFromMonthlyMonthly(monthly: number): number {
  return Math.round(monthly * 10 * 100) / 100;
}
