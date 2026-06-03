# Production data cleanup report

**Date:** 2026-06-03  
**Scope:** Remove runtime mock/demo catalog fallbacks from mobile; keep admin-web API-driven.

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

Do **not** track the above as missing backend features in gap lists.

---

## Removed mock/fallback files and imports

| Removed | Notes |
|---------|--------|
| `mobile/src/mock/` (entire directory) | `MOCK_EVENTS`, `MOCK_CATEGORIES`, `MOCK_CITIES`, `MOCK_BOOKINGS`, etc. |
| `mobile/src/services/mock/` | Re-export barrel |
| `mobile/src/config/mockCatalog.ts` | `EXPO_PUBLIC_USE_MOCK_CATALOG` |
| `mobile/src/hooks/useMockUser.ts` | Replaced by `useCurrentUser` |

## New / refactored modules

| Module | Role |
|--------|------|
| `mobile/src/hooks/useCurrentUser.ts` | Session user from API + temporary overrides |
| `mobile/src/types/exploreCategories.ts` | Explore strip types |
| `mobile/src/constants/premiumPlan.ts` | Premium **UI** copy/pricing display only |
| `mobile/src/hooks/useBusinessEventCategoryGroups.ts` | Business event category picker from API |

## Screens / flows — API-backed (in-scope)

| Area | Behavior |
|------|----------|
| Explore | Governorates, categories, subcategories, events from API; empty/error/retry |
| Search / Filters | Events via API; taxonomy from reference store |
| Event PDP | `GET /events/{id}` (numeric ids); error + retry |
| Favorites | `GET /favorites` |
| Bookings tab & detail | `GET /bookings/me`, cancel via API |
| Profile / Me / Edit profile | `useCurrentUser` → session / `GET /users/me` |
| Business profile & events | `business-profile` + `business/events` APIs |
| Governorate / category pickers | `/governorates/active`, `/categories` |

## Presentation-only routes (out of scope)

| Route | Behavior after cleanup |
|-------|-------------------------|
| `restaurant/`, `stay/`, `experience/`, `package/`, `organizer/` | No catalog API — shows not-found; routes kept for navigation/deep links |
| `wallet`, `vouchers`, `membership/*`, `resell` | UI remains; no backend billing/wallet/voucher APIs expected |

---

## Remaining gaps (in-scope only)

| Item | Priority | Notes |
|------|----------|--------|
| **Optional `nameAr` on taxonomy** | Nice-to-have | Categories, subcategories, governorates return single `name`; mobile mirrors English for AR until API adds fields |
| **Password reset** | Product decision | Login UI stub; implement only if accounts team requires it |
| **Production hardening** | Ops | JWT secrets, `ddl-auto`, CORS, migrations — see `docs/API_AUDIT_REPORT.md` |
| **Real bugs in implemented flows** | As found | Track in issues/PRs; none filed from cleanup pass |

**Resolved since earlier audits (no longer gaps):** guest `GET /events`, mock catalog removal, profile/business image uploads, business event photo multipart, `ROLE_BUSINESS` on approval, `useCurrentUser`, reference store without mock fallbacks.

Backend seeders (`CategorySeederConfig`, `GovernorateSeederConfig`, `RoleSeederConfig`) were **not** removed.

---

## Verification

```bash
cd mobile && npm run typecheck
cd admin-web && npm run lint && npm run build
cd backend && ./mvnw test
```

All passed as of 2026-06-03.
