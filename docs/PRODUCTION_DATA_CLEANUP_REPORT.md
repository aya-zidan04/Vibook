# Production data cleanup report

**Date:** 2026-06-04 (final pass)  
**Scope:** Remove runtime mock/demo/test data from mobile and admin-web; filter smoke accounts from admin user list; remove demo rating seeder.

---

## Product scope (Vibook)

Vibook is an **events marketplace** in Jordan (discover, book, rate, report, partner onboarding, admin moderation).

**In scope (backend + mobile API):** auth, users, categories/subcategories, governorates, events, bookings, favorites, ratings, reports, business profiles, business events, PayPal sandbox, admin CRUD/moderation.

**Intentionally out of scope (not backend gaps):**

| Area | Notes |
|------|--------|
| **Premium** (`(premium-sheet)/membership/*`, resell entry) | **Visual/static UI** — plans, perks, and CTAs are presentation only; no paid subscription backend |
| **Wallet** (`app/wallet.tsx`) | Presentation shell; not a wallet product |
| **Vouchers** (`app/(premium-sheet)/vouchers.tsx`) | Presentation shell; no voucher ledger API |
| **Hotels / stays, experiences, packages, restaurants** | Legacy explore/checkout **UI routes** only; not separate catalog verticals |
| **Organizer standalone profile** | Legacy route; not a standalone organizer product |
| **Notifications** | Static UI; no push/inbox backend in scope |

---

## Removed (prior + this pass)

| Removed | Notes |
|---------|--------|
| `mobile/src/mock/` (entire directory) | Prior pass |
| `mobile/src/services/mock/` | Prior pass |
| `mobile/src/config/mockCatalog.ts` | Prior pass |
| `mobile/src/hooks/useMockUser.ts` | Prior pass |
| `RatingDemoDataConfigurer.java` | Auto demo CONFIRMED booking for rating tests |
| `backend/src/main/resources/db/demo-rating-data.sql` | Manual demo rating SQL |
| `vibook.demo.rating-data` in `application.yml` | Property removed |
| Simulated card checkout (`payment.tsx` 4242 flow) | PayPal-only for API event bookings |
| Mock/demo i18n strings (EN + AR) | Checkout, payment, confirmation, favorites, help, auth stubs, etc. |

## Added / updated (this pass)

| File | Change |
|------|--------|
| `backend/.../util/TestAccountPredicate.java` | Filters smoke/test/demo emails from admin list |
| `backend/.../util/TestAccountPredicateTest.java` | Unit tests |
| `backend/.../service/impl/UserServiceImpl.java` | `getAllUsers()` excludes test accounts |
| `mobile/app/payment.tsx` | PayPal only; unavailable state otherwise |
| `mobile/app/(auth)/login.tsx` | Reset password “coming soon” alert |
| `mobile/app/(auth)/signup.tsx` | Renamed terms keys |
| `mobile/app/(tabs)/favorites.tsx` | `hintNote` style (was `mockNote`) |
| `mobile/app/(premium-sheet)/membership/plans.tsx` | `comingSoon*` keys |
| `mobile/app/(premium-sheet)/add-payment-method.tsx` | `addCardNote` |
| `mobile/src/i18n/dictionary.ts` | Production copy EN + AR |
| Comment-only: `appStore.ts`, `types/index.ts`, `useFormatMoney.ts`, `currencyDisplay.ts`, `premiumAccess.ts`, `businessEventTickets.ts` | Removed misleading “mock” comments |

## Screens / flows — API-backed (in-scope)

| Area | Behavior |
|------|----------|
| Explore | Governorates, categories, subcategories, events from API; empty/error/retry |
| Search / Filters | Events via API |
| Event PDP | `GET /events/{id}` |
| Favorites | `GET /favorites` when signed in; empty state when none |
| Bookings | `GET /bookings/me`, cancel via API |
| Payment | PayPal Sandbox for event bookings with `apiEventId`; disabled otherwise |
| Profile / Me / Business | Live APIs |
| Admin Users | `fetchAllUsers()` — test accounts hidden in list only |

## Backend seeders retained

`CategorySeederConfig`, `GovernorateSeederConfig`, `RoleSeederConfig` (and admin bootstrap if present) — **not** removed.

---

## Verification (2026-06-04)

```bash
cd mobile && npm run typecheck
cd admin-web && npm run lint && npm run build
cd backend && ./mvnw -q test
```

| Command | Result |
|---------|--------|
| `cd mobile && npm run typecheck` | **PASS** |
| `cd admin-web && npm run lint && npm run build` | **PASS** |
| `cd backend && ./mvnw -q test` | **PASS** (includes `TestAccountPredicateTest`) |

---

## Files changed (2026-06-04 final pass)

1. `backend/src/main/java/com/vibook/backend/util/TestAccountPredicate.java` (new)
2. `backend/src/test/java/com/vibook/backend/util/TestAccountPredicateTest.java` (new)
3. `backend/src/main/java/com/vibook/backend/service/impl/UserServiceImpl.java`
4. `backend/src/main/java/com/vibook/backend/config/RatingDemoDataConfigurer.java` (deleted)
5. `backend/src/main/resources/db/demo-rating-data.sql` (deleted)
6. `backend/src/main/resources/application.yml`
7. `mobile/app/payment.tsx`
8. `mobile/app/(auth)/login.tsx`
9. `mobile/app/(auth)/signup.tsx`
10. `mobile/app/(tabs)/favorites.tsx`
11. `mobile/app/(premium-sheet)/membership/plans.tsx`
12. `mobile/app/(premium-sheet)/add-payment-method.tsx`
13. `mobile/src/i18n/dictionary.ts`
14. `mobile/src/store/appStore.ts`
15. `mobile/src/types/index.ts`
16. `mobile/src/hooks/useFormatMoney.ts`
17. `mobile/src/utils/currencyDisplay.ts`
18. `mobile/src/utils/premiumAccess.ts`
19. `mobile/src/utils/businessEventTickets.ts`
20. `docs/PRODUCTION_DATA_CLEANUP_REPORT.md`
