import type { User } from '@/types';

export type MembershipPlanId = 'basic' | 'premium' | 'vip';

export type MembershipPlan = {
  id: MembershipPlanId;
  priceMonthly: number;
  priceYearly: number;
  currency: string;
  /** Highlighted comparison card (middle tier). */
  recommended: boolean;
  benefitKeys: readonly string[];
};

/** Mock catalogue — prices illustrative; UI uses `useFormatMoney`. */
export const MEMBERSHIP_PLANS: MembershipPlan[] = [
  {
    id: 'basic',
    priceMonthly: 2.99,
    priceYearly: 28.99,
    currency: 'USD',
    recommended: false,
    benefitKeys: [
      'membership.benefit.basic1',
      'membership.benefit.basic2',
      'membership.benefit.basic3',
    ],
  },
  {
    id: 'premium',
    priceMonthly: 7.99,
    priceYearly: 74.99,
    currency: 'USD',
    recommended: true,
    benefitKeys: [
      'membership.benefit.premium1',
      'membership.benefit.premium2',
      'membership.benefit.premium3',
      'membership.benefit.premium4',
    ],
  },
  {
    id: 'vip',
    priceMonthly: 14.99,
    priceYearly: 139.99,
    currency: 'USD',
    recommended: false,
    benefitKeys: [
      'membership.benefit.vip1',
      'membership.benefit.vip2',
      'membership.benefit.vip3',
      'membership.benefit.vip4',
      'membership.benefit.vip5',
    ],
  },
];

/** Maps app membership tier (profile) to subscription plan for mock comparisons. */
export const TIER_TO_PLAN_ID: Record<User['membershipTier'], MembershipPlanId> = {
  standard: 'basic',
  gold: 'premium',
  platinum: 'vip',
};

export function getPlanById(id: MembershipPlanId): MembershipPlan | undefined {
  return MEMBERSHIP_PLANS.find((p) => p.id === id);
}
