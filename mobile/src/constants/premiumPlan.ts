/** Premium UI copy and illustrative pricing until billing API exists. */
export type PremiumPlan = {
  priceMonthly: number;
  priceYearly: number;
  currency: string;
  benefitKeys: readonly string[];
};

export const PREMIUM_PLAN: PremiumPlan = {
  priceMonthly: 7.99,
  priceYearly: 74.99,
  currency: 'USD',
  benefitKeys: [
    'membership.benefit.premium1',
    'membership.benefit.premium2',
    'membership.benefit.premium3',
    'membership.benefit.premium4',
    'membership.benefit.premium5',
  ],
};
