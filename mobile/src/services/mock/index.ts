/**
 * Mock data façade — import from here in app code so backend integration can
 * replace this module (or its internals) without sweeping screen edits.
 */
export { mergeMockUser } from '@/services/profileMerge';
export { CURRENT_USER } from '@/mock/users';

/** Entity getters — replace with API + normalizers later. */
export * from '@/mock/queries';

/** Curated aggregates used across tabs, search, and PDPs. */
export {
  MOCK_BOOKINGS,
  MOCK_EVENTS,
  MOCK_EXPERIENCES,
  MOCK_FLIGHTS,
  MOCK_HOTELS,
  MOCK_OFFERS,
  MOCK_PACKAGES,
  MOCK_RESTAURANTS,
  MOCK_VOUCHERS,
} from '@/mock';

/** Membership catalogue (mock). */
export {
  MEMBERSHIP_PLANS,
  TIER_TO_PLAN_ID,
  getPlanById,
} from '@/mock/membershipPlans';
export type { MembershipPlan, MembershipPlanId } from '@/mock/membershipPlans';
