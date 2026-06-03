# Vibook API Audit Report

**Date:** 2026-06-03 (updated after production-data cleanup)  
**Scope:** `backend/` Spring Boot controllers, `admin-web/`, `mobile/`  
**Original mode:** Read-only analysis. **Follow-up:** Several mobile items below are **resolved**; see `docs/PRODUCTION_DATA_CLEANUP_REPORT.md` and `docs/PRODUCTION_CRITICAL_FIXES_REPORT.md`.

### Product scope (do not list as API gaps)

Vibook ships **events + partner + admin** only. The following are **intentionally out of scope** — not missing backend work:

- Wallet, vouchers, hotels/stays, experiences, packages, restaurants as catalog verticals, organizer standalone APIs
- **Premium** screens (`membership`, `resell`, etc.) — **static/visual UI**; paid subscription is not a product requirement

### Executive summary

**~96–101** REST routes under `/api/v1`. Admin-web is API-driven. Mobile in-scope flows (explore, search, event PDP, favorites, bookings, profile, business hub) use live APIs after mock cleanup.

**Still relevant gaps:** optional **`nameAr`** on categories/subcategories/governorates; **password reset** only if product requires it; **production hardening** (JWT secret, migrations, CORS); **admin JWT refresh**; **notifications** out of scope. **Resolved:** guest `GET /events`, runtime mock catalog, mobile profile/business/event photo uploads, business profile API sync (see critical-fixes report).

---

## API Inventory

**Base URL:** `http://<host>:8080/api/v1`  
**Auth:** JWT Bearer (`Authorization: Bearer <access>`). Spring `hasRole("X")` → authority `ROLE_X`.  
**Static files (not controllers):** `GET /api/v1/files/profile-images/**`, `business-logos/**`, `business-banners/**` — `permitAll`

| Method | Path | Controller | Auth Role | Used By | Status | Notes |
|--------|------|------------|-----------|---------|--------|-------|
| POST | `/api/v1/auth/register` | AuthController | permitAll | Mobile | used | `RegisterRequest` → `AuthResponse` |
| POST | `/api/v1/auth/login` | AuthController | permitAll | Admin, Mobile | used | `LoginRequest` → `AuthResponse` |
| POST | `/api/v1/auth/refresh` | AuthController | permitAll | Mobile | used | `RefreshTokenRequest` → `TokenRefreshResponse` |
| POST | `/api/v1/auth/logout` | AuthController | permitAll | Mobile | used | Body: `refreshToken` |
| POST | `/api/v1/auth/logout-all` | AuthController | authenticated | — | unused | Revokes all refresh tokens |
| GET | `/api/v1/users/me` | UserController | USER | Mobile | used | `UserResponse` |
| POST | `/api/v1/users/me/profile-image` | UserController | USER | — | unused | multipart `image`; mobile has no client |
| DELETE | `/api/v1/users/me/profile-image` | UserController | USER | — | unused | |
| GET | `/api/v1/users` | UserController | ADMIN | Admin | used | `UsersPage` |
| GET | `/api/v1/users/{id}` | UserController | ADMIN | — | unused | No admin-web client |
| PUT | `/api/v1/users/{id}` | UserController | USER | Mobile | used | `edit-profile.tsx` → `updateUser` |
| DELETE | `/api/v1/users/{id}` | UserController | ADMIN | — | unused | Disables user; admin uses `/admin/users/{id}/disable` |
| GET | `/api/v1/users/me/payment-methods` | PaymentMethodController | USER | Mobile | used | |
| POST | `/api/v1/users/me/payment-methods` | PaymentMethodController | USER | Mobile | used | `add-payment-method.tsx` |
| PATCH | `/api/v1/users/me/payment-methods/{id}/default` | PaymentMethodController | USER | — | incomplete | Client exists; UI usage needs verification |
| DELETE | `/api/v1/users/me/payment-methods/{id}` | PaymentMethodController | USER | — | incomplete | Same |
| GET | `/api/v1/categories` | CategoryController | permitAll | Admin, Mobile | used | Public list |
| GET | `/api/v1/categories/{id}/subcategories` | CategoryController | permitAll | Mobile, Admin (indirect) | used | |
| GET | `/api/v1/admin/categories` | AdminCategoryController | ADMIN | Admin | used | `CategoriesPage` |
| POST | `/api/v1/admin/categories` | AdminCategoryController | ADMIN | Admin | used | |
| PUT | `/api/v1/admin/categories/{id}` | AdminCategoryController | ADMIN | Admin | used | |
| DELETE | `/api/v1/admin/categories/{id}` | AdminCategoryController | ADMIN | Admin | used | |
| POST | `/api/v1/governorates` | GovernorateController | ADMIN | — | unused | No admin UI create |
| GET | `/api/v1/governorates` | GovernorateController | permitAll | Admin | used | `fetchAllGovernorates` |
| GET | `/api/v1/governorates/active` | GovernorateController | permitAll | Admin, Mobile | used | |
| GET | `/api/v1/governorates/{id}` | GovernorateController | permitAll | — | unused | |
| PUT | `/api/v1/governorates/{id}` | GovernorateController | ADMIN | Admin | used | `GovernoratesPage` |
| DELETE | `/api/v1/governorates/{id}` | GovernorateController | ADMIN | — | unused | |
| GET | `/api/v1/admin/governorates/stats` | AdminGovernorateStatsController | ADMIN | Admin | used | `GovernoratesPage` |
| GET | `/api/v1/events` | EventRatingController | USER, ADMIN | Mobile | used | **Requires login**; guests blocked |
| GET | `/api/v1/events/{eventId}` | EventRatingController | USER, ADMIN | Mobile | used | `getEventById`, PDP |
| POST | `/api/v1/events/{eventId}/rate` | EventRatingController | USER, ADMIN | Mobile | used | `StarRatingInput` |
| GET | `/api/v1/business/events` | BusinessEventController | USER, ADMIN | Mobile | used | Owner list |
| POST | `/api/v1/business/events` | BusinessEventController | USER, ADMIN | Mobile | used | `photoUrls` URLs only—no upload API |
| GET | `/api/v1/business/events/{id}` | BusinessEventController | USER, ADMIN | Mobile | used | |
| PUT | `/api/v1/business/events/{id}` | BusinessEventController | USER, ADMIN | Mobile | used | |
| DELETE | `/api/v1/business/events/{id}` | BusinessEventController | USER, ADMIN | Mobile | used | 204 |
| PATCH | `/api/v1/business/events/{id}/hide` | BusinessEventController | USER, ADMIN | Mobile | used | |
| PATCH | `/api/v1/business/events/{id}/unhide` | BusinessEventController | USER, ADMIN | Mobile | used | |
| GET | `/api/v1/business-profile/me` | BusinessProfileController | USER | Mobile | used | |
| PUT | `/api/v1/business-profile/me` | BusinessProfileController | USER | Mobile | used | |
| PATCH | `/api/v1/business-profile/me/submit` | BusinessProfileController | USER | Mobile | used | |
| POST | `/api/v1/business-profile/me/logo` | BusinessProfileController | USER | — | unused | Mobile has no multipart client |
| DELETE | `/api/v1/business-profile/me/logo` | BusinessProfileController | USER | — | unused | |
| POST | `/api/v1/business-profile/me/banner` | BusinessProfileController | USER | — | unused | |
| DELETE | `/api/v1/business-profile/me/banner` | BusinessProfileController | USER | — | unused | |
| POST | `/api/v1/bookings` | BookingController | USER, ADMIN | Mobile | used | `payment.tsx` |
| GET | `/api/v1/bookings/me` | BookingController | USER, ADMIN | Mobile | used | Bookings tab |
| GET | `/api/v1/bookings/me/{id}` | BookingController | USER, ADMIN | Mobile | used | Numeric booking ids |
| PATCH | `/api/v1/bookings/me/{id}/cancel` | BookingController | USER, ADMIN | Mobile | used | |
| GET | `/api/v1/business/bookings` | BusinessBookingController | USER, ADMIN | Mobile | used | `businessHubSync` |
| GET | `/api/v1/business/bookings/{id}` | BusinessBookingController | USER, ADMIN | — | incomplete | Listed in API; direct screen use needs verification |
| PATCH | `/api/v1/business/bookings/{id}/status` | BusinessBookingController | USER, ADMIN | Mobile | used | `bookings.tsx` |
| POST | `/api/v1/payments/paypal/create-order` | PayPalPaymentController | USER, ADMIN | Mobile | used | |
| POST | `/api/v1/payments/paypal/capture-order` | PayPalPaymentController | USER, ADMIN | Mobile | used | |
| GET | `/api/v1/favorites/{eventId}/status` | FavoriteController | USER, ADMIN | — | unused | Only defined in `favoritesApi.ts` |
| GET | `/api/v1/favorites` | FavoriteController | USER, ADMIN | Mobile | used | Paginated |
| POST | `/api/v1/favorites/{eventId}` | FavoriteController | USER, ADMIN | Mobile | used | `favoritesStore` |
| DELETE | `/api/v1/favorites/{eventId}` | FavoriteController | USER, ADMIN | Mobile | used | |
| POST | `/api/v1/reports` | ModerationReportController | USER, ADMIN | Mobile | used | `ReportIssueModal` |
| POST | `/api/v1/user-reports` | UserReportController | USER, ADMIN | Mobile | used | `report-problem.tsx` |
| GET | `/api/v1/admin/analytics/summary` | AdminAnalyticsController | ADMIN | Admin | used | `DashboardPage` (replaces removed dashboard stats) |
| GET | `/api/v1/admin/activity-log` | AdminActivityLogController | ADMIN | — | unused | No route/page in admin-web |
| GET | `/api/v1/admin/business-profiles` | AdminBusinessProfileController | ADMIN | Admin | used | Paginated |
| GET | `/api/v1/admin/business-profiles/{id}` | AdminBusinessProfileController | ADMIN | Admin | used | |
| PATCH | `/api/v1/admin/business-profiles/{id}/approve` | AdminBusinessProfileController | ADMIN | Admin | used | Grants `ROLE_BUSINESS` in service |
| PATCH | `/api/v1/admin/business-profiles/{id}/reject` | AdminBusinessProfileController | ADMIN | Admin | used | |
| PATCH | `/api/v1/admin/business-profiles/{id}/notes` | AdminBusinessProfileController | ADMIN | Admin | used | |
| POST | `/api/v1/admin/business-profiles/bulk-approve` | AdminBusinessProfileController | ADMIN | Admin | used | |
| POST | `/api/v1/admin/business-profiles/bulk-reject` | AdminBusinessProfileController | ADMIN | Admin | used | |
| PATCH | `/api/v1/admin/users/{id}/roles` | AdminUserController | ADMIN | Admin | used | `UsersPage` |
| PATCH | `/api/v1/admin/users/{id}/enable` | AdminUserController | ADMIN | Admin | used | |
| PATCH | `/api/v1/admin/users/{id}/disable` | AdminUserController | ADMIN | Admin | used | 204 |
| GET | `/api/v1/admin/events` | AdminEventModerationController | ADMIN | Admin | used | `EventsPage` |
| GET | `/api/v1/admin/events/{id}` | AdminEventModerationController | ADMIN | Admin | used | `EventDetailPage` |
| PATCH | `/api/v1/admin/events/{id}/hide` | AdminEventModerationController | ADMIN | Admin | used | |
| PATCH | `/api/v1/admin/events/{id}/show` | AdminEventModerationController | ADMIN | Admin | used | |
| DELETE | `/api/v1/admin/events/{id}` | AdminEventModerationController | ADMIN | Admin | used | |
| PATCH | `/api/v1/admin/events/{id}/notes` | AdminEventModerationController | ADMIN | Admin | used | |
| GET | `/api/v1/admin/bookings` | AdminBookingModerationController | ADMIN | Admin | used | |
| GET | `/api/v1/admin/bookings/{id}` | AdminBookingModerationController | ADMIN | Admin | used | |
| PATCH | `/api/v1/admin/bookings/{id}/cancel` | AdminBookingModerationController | ADMIN | Admin | used | |
| PATCH | `/api/v1/admin/bookings/{id}/complete` | AdminBookingModerationController | ADMIN | Admin | used | |
| GET | `/api/v1/admin/ratings` | AdminEventRatingModerationController | ADMIN | Admin | used | `RatingsPage` |
| DELETE | `/api/v1/admin/ratings/{id}` | AdminEventRatingModerationController | ADMIN | Admin | used | |
| PATCH | `/api/v1/admin/ratings/{id}/hide` | AdminEventRatingModerationController | ADMIN | Admin | used | Body: `{ hidden }` |
| GET | `/api/v1/admin/reports` | AdminModerationReportController | ADMIN | Admin | used | |
| GET | `/api/v1/admin/reports/{id}` | AdminModerationReportController | ADMIN | Admin | used | |
| PATCH | `/api/v1/admin/reports/{id}/review` | AdminModerationReportController | ADMIN | Admin | used | |
| PATCH | `/api/v1/admin/reports/{id}/resolve` | AdminModerationReportController | ADMIN | Admin | used | |
| PATCH | `/api/v1/admin/reports/{id}/dismiss` | AdminModerationReportController | ADMIN | Admin | used | |
| GET | `/api/v1/admin/user-reports` | AdminUserReportController | ADMIN | Admin | used | `ReportsPage` |
| GET | `/api/v1/admin/user-reports/{id}` | AdminUserReportController | ADMIN | Admin | used | |
| PATCH | `/api/v1/admin/user-reports/{id}/status` | AdminUserReportController | ADMIN | Admin | used | |

**Endpoint count:** **101** controller mappings + **3** static file patterns.

---

## Used APIs

### Admin Web list

| Endpoint (relative to `/api/v1`) | Page / component |
|----------------------------------|------------------|
| `POST /auth/login` | `LoginPage` via `AuthProvider` |
| `GET /admin/analytics/summary` | `DashboardPage` |
| `GET /admin/business-profiles` (+ filters) | `DashboardPage`, `BusinessProfilesPage` |
| `GET /admin/business-profiles/{id}` | `BusinessProfileDetailPage` |
| `PATCH .../approve`, `reject`, `notes` | `BusinessProfileDetailPage`, `BusinessProfilesPage` |
| `POST .../bulk-approve`, `bulk-reject` | `BusinessProfilesPage` |
| `GET /users` | `UsersPage` |
| `PATCH /admin/users/{id}/roles`, `enable`, `disable` | `UsersPage` |
| `GET /categories`, `GET /admin/categories`, CRUD admin categories | `CategoriesPage`, filters elsewhere |
| `GET /governorates`, `GET /governorates/active`, `PUT /governorates/{id}` | `GovernoratesPage`, filter bars |
| `GET /admin/governorates/stats` | `GovernoratesPage` |
| `GET /admin/events`, detail, hide/show/delete/notes | `EventsPage`, `EventDetailPage` |
| `GET /admin/bookings`, detail, cancel, complete | `BookingsPage`, `BookingDetailPage` |
| `GET /admin/ratings`, delete, hide | `RatingsPage` |
| `GET /admin/reports`, detail, review/resolve/dismiss | `ReportsPage`, `ReportDetailPage` |
| `GET /admin/user-reports`, detail, status | `ReportsPage`, `UserReportDetailPage` |

**Client:** `admin-web/src/api/adminApi.ts` (axios base via `resolveApiBaseUrl.ts`, Vite proxy `/api/v1` → `:8080`).

### Mobile list

| Endpoint | Screen / module |
|----------|-----------------|
| Auth register/login/refresh/logout, `GET /users/me` | `(auth)/signup`, `(auth)/login`, `hydrateAuthSession`, `appStore` logout |
| `GET /categories`, subcategories | `referenceStore`, `explore`, `useCatalogSubcategories`, business join |
| `GET /governorates/active` | `referenceStore`, business event forms |
| `GET /events`, rate, detail | `explore`, `search`, `useCatalogPdp`, `StarRatingInput` |
| Favorites CRUD | `favoritesStore`, `(tabs)/favorites` |
| Bookings + PayPal | `(tabs)/booking`, `booking/[id]`, `payment` |
| Business profile | `business/join`, `_layout`, `application-pending` |
| Business events/bookings | `business/(dashboard)/*`, `businessHubSync` |
| Reports | `ReportIssueModal`, `report-problem` |
| Payment methods | `payment-methods`, `add-payment-method` |
| `PUT /users/{id}` | `edit-profile` (still merges `useMockUser` for display) |

**Client modules:** `mobile/src/api/*.ts` (`http.ts` refresh on 401).

---

## Unused APIs

| Path | Why unused |
|------|------------|
| `GET /admin/activity-log` | No admin page/route; docs mention `ActivityLogPage` but it is not in `App.tsx` |
| `POST /governorates`, `DELETE /governorates/{id}`, `GET /governorates/{id}` | Admin only updates; no create/delete UI |
| `GET /users/{id}`, `DELETE /users/{id}` | Admin uses list + `/admin/users/.../disable` |
| `POST /auth/logout-all` | No client |
| `GET /favorites/{eventId}/status` | Exported in mobile API only |
| Business profile logo/banner upload/delete (4) | No mobile multipart implementation |
| `POST/DELETE /users/me/profile-image` | No mobile client |
---

**Removed in duplicate-code cleanup (2026-06-03):** `GET /admin/dashboard/stats`, `GET /categories/slug/{slug}`, dead `adminApi` exports (`fetchDashboardStats`, `fetchUserById`, `fetchGovernoratesActive`).

---

## Supplemental findings (second pass)

| Area | Finding |
|------|---------|
| `mobile/app/business/(dashboard)/profile.tsx` | Updates `businessHubStore` only; does not sync `PUT /business-profile/me` or logo/banner upload APIs |
| `admin-web` logout | Clears localStorage; does not call `POST /auth/logout` to revoke refresh token |
| `mobile/src/api/types.ts` vs backend | `priceJod` typed as `string` on mobile vs `number` in admin-web / `BigDecimal` in JSON |
| Docs | `MOBILE_AND_ADMIN_GUIDE.md` references `ActivityLogPage` — route/page not in `admin-web` |
| `mobile/src/store/userProfileStore.ts`, `businessHubStore.ts` | Local state shadows API for profile/business branding |
| Premium | `(premium-sheet)/membership/*` — **static UI** (out of scope for billing APIs) |

---

## Missing or Incomplete APIs (in-scope only)

| Feature | Priority | Gap | Status |
|---------|----------|-----|--------|
| **Optional `nameAr` on taxonomy** | **Low** | Single `name` on category/subcategory/governorate DTOs; mobile uses same string for AR | Open (nice-to-have) |
| **Password reset** | **Low** | Mobile UI stub (`login.tsx`); no backend flow | Open **only if product requires** |
| **Admin JWT refresh** | **High** | Admin stores access token only; discards `refreshToken` | Open |
| **Admin activity log UI** | **Medium** | Backend exists; no admin-web page | Open |
| **Notifications** | — | Not in Vibook scope | N/A |
| **Guest event discovery** | — | — | **Resolved** (`permitAll` GET `/events` + mobile) |
| **Event image upload (multipart)** | — | — | **Resolved** (business event photos API + mobile) |
| **Mobile mock catalog** | — | — | **Resolved** (see cleanup report) |

**Removed from gap list (out of scope):** wallet, vouchers, premium/membership billing, hotels/restaurants/packages/experiences verticals, organizer APIs, dedicated search indexing service, server FX rates (client formatting only).

---

## Backend-Frontend Mismatches (updated)

| Location | Issue | Status |
|----------|-------|--------|
| `admin-web/src/auth/AuthProvider.tsx` | No refresh token persistence | Open |
| `admin-web/src/api/client.ts` | 401 → hard redirect; no refresh | Open |
| `SecurityConfig` vs guest explore | Guest event browse | **Resolved** |
| `mobile` profile / business profile / event photos | Multipart uploads | **Resolved** |
| `mobile` runtime mock catalog | `MOCK_*` fallbacks | **Resolved** (cleanup) |
| Governorates/categories | Backend `name` only | Optional `nameAr` (nice-to-have) |
| `ROLE_BUSINESS` on approval | Grant on admin approve | **Resolved** (see role tests) |
| `mobile/README.md` | Was "mock-only" | **Resolved** (API-backed) |

**Admin-web:** No runtime mock catalog in source.

---

## Mock data (historical — removed 2026-06-03)

Runtime mock modules under `mobile/src/mock/` and `services/mock/` were **deleted**. In-scope screens use API data with empty/error states. Legacy PDP routes (`restaurant/`, `stay/`, etc.) remain as **presentation shells** (not-found without API) — not product gaps.

Remaining "mock" strings are **i18n copy** (e.g. checkout simulation labels) or **comments**, not data fallbacks.

---

## Security Issues

| Issue | Severity | Fix |
|-------|----------|-----|
| Default `JWT_SECRET` in `application.yml` / `.env.example` | **Critical** | Require strong secret in prod; fail boot if default |
| Admin no refresh + long-lived access token | **High** | Implement refresh or shorter TTL + re-login |
| `GET /events` requires authentication | **High** (product) | Public read for published events if guests should browse |
| CORS `allowed-origin-patterns` wide (LAN `192.168.*`, `10.*`) | **Medium** | Restrict in production |
| `ddl-auto: update` in `application.yml` | **Medium** | Use migrations in prod |
| Uploaded files served from disk `permitAll` | **Medium** | Validate ownership on upload; scan content; CDN in prod |
| Payment methods store card fields server-side | **Medium** | PCI: tokenize with PayPal/vault only |
| `.env.example` DB password `1234` | **Low** (dev) | Document prod separation only |
| No rate limiting on auth endpoints | **Medium** | Add gateway or Spring rate limiter |

---

## Recommended Fix Plan

### 1. Critical fixes

- Rotate JWT secret in production; block default secret at startup.
- Require production DB credentials; use `ddl-auto: validate` + migrations (not `update`).
- Wire mobile profile + business logo/banner multipart endpoints; sync business dashboard profile to API.
- Admin refresh-token flow (or explicit short TTL + re-login policy).

### 2. Connection fixes

- Decide guest vs auth for `GET /events`; align mobile explore/search.
- Add admin Activity Log page → `GET /admin/activity-log` (or remove from docs).
- Admin logout → `POST /auth/logout` with refresh token.

### 3. Cleanup

- ~~Unused admin dashboard stats API + dead `adminApi` exports~~ — **done** (`DUPLICATE_CODE_CLEANUP_REPORT.md`).
- ~~Mock catalog fallbacks~~ — **done** (`PRODUCTION_DATA_CLEANUP_REPORT.md`).

### 4. Nice-to-have (in-scope)

- Optional `nameAr` on categories, subcategories, governorates.
- Password reset — **only if product requires**.
- Admin activity log UI.

---

## Environment (no secrets)

| App | Config | Base URL |
|-----|--------|----------|
| Backend | `backend/.env.example`, `application.yml` | `:8080`, paths `/api/v1` |
| Admin | `admin-web/.env.example`, Vite proxy | Default relative `/api/v1` |
| Mobile | `EXPO_PUBLIC_API_URL` in `mobile/src/api/env.ts` | Must include `/api/v1` |

---

## Feature coverage matrix

| Feature | Backend | Admin | Mobile | Notes |
|---------|---------|-------|--------|-------|
| Auth register/login/refresh/me | Yes | Login only | Yes | Admin no refresh |
| User profile | Yes | List users | Yes | `useCurrentUser` + uploads |
| Business profile request/approval | Yes | Yes | Yes | API sync + logo/banner upload |
| Business events CRUD | Yes | Moderation | Yes | Multipart event photos |
| Event images | Multipart + URLs | — | Upload API | Resolved |
| Categories/subcategories | Yes | CRUD | Yes | Optional `nameAr` |
| Governorates | Yes | Update + stats | Yes | Optional `nameAr` |
| Bookings | Yes | Yes | Yes | API numeric ids only |
| Premium UI | — | — | Static screens | Out of scope (no billing API) |
| Wallet / vouchers UI | — | — | Static screens | Out of scope |
| Payments/PayPal sandbox | Yes | Booking detail | Yes | |
| Favorites | Yes | — | Yes | Status endpoint unused |
| Ratings | Yes | Yes | Yes | |
| Reports/moderation | Yes | Yes | Yes | |
| Admin dashboard stats | Legacy unused | Analytics used | — | |
| Admin users | Yes | Yes | — | |
| Search/filtering | Keyword on events | Header search client-side | Partial | |
| Localization EN/AR | UI only | UI only | Optional `nameAr` on taxonomy API | |
| Currency handling | — | — | Client display formatting | Out of scope as FX API |
| Notifications | — | — | Static UI only | Out of scope |
