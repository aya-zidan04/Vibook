/** Mock data façade — fixtures and helpers for the standalone app. */
export { mergeMockUser } from '@/services/profileMerge';
export { CURRENT_USER } from '@/mock/users';

/** Entity getters — replace with API + normalizers later. */
export * from '@/mock/queries';

/** Curated aggregates used across tabs, search, and PDPs. */
export {
  MOCK_BOOKINGS,
  MOCK_CATEGORIES,
  MOCK_CITIES,
  MOCK_EXPLORE_CATEGORIES,
  MOCK_EXPLORE_EVENT_TAGS,
  MOCK_EVENTS,
  MOCK_EXPERIENCES,
  MOCK_HOTELS,
  MOCK_OFFERS,
  MOCK_PACKAGES,
  MOCK_RESTAURANTS,
  MOCK_VOUCHERS,
} from '@/mock';

/** Premium membership (mock). */
export { PREMIUM_PLAN } from '@/mock/membershipPlans';
export type { PremiumPlan } from '@/mock/membershipPlans';
