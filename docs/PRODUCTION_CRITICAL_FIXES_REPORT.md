# Production-Critical Fixes Report

**Date:** 2026-06-03  
**Scope:** Guest browsing, mobile API wiring, image uploads, business role on approval  
**No UI/theme changes, no API renames, no cleanup pass**

---

## 1. Guest event browsing

### Fixed

| Layer | Change |
|-------|--------|
| `backend/.../config/SecurityConfig.java` | `GET /api/v1/events` and `GET /api/v1/events/*` → `permitAll` (POST `/rate` still requires USER/ADMIN) |
| `backend/.../controller/EventRatingController.java` | List/detail no longer require principal; detail uses public path when anonymous |
| `backend/.../service/EventRatingService.java` + `EventRatingServiceImpl.java` | Added `getEventForPublic()` — non-hidden events only, no personal rating fields |
| `mobile/app/(tabs)/explore.tsx` | Event feed loads from API for guests (removed auth gate) |
| `mobile/app/search.tsx` | Search/browse uses API without login |
| `mobile/src/hooks/useCatalogPdp.ts` | Numeric event IDs load from API for guests |
| `mobile/src/api/eventsApi.ts` | `searchEvents()` uses `auth: false`; `getEventById()` sends token when logged in (personalized ratings) |

Categories and governorates were already public (`permitAll` + `auth: false` on mobile category/governorate clients).

### Verify manually

- Cold start as guest → Explore shows API events (not empty feed).
- Open `/event/{numericId}` without login → PDP loads.
- Logged-in user still sees rating eligibility on PDP when applicable.

---

## 2. Mobile mock data → real API (where backend exists)

### Fixed (this pass)

| Screen / module | Before | After |
|-----------------|--------|-------|
| Explore feed | API only when authenticated | API for guests and signed-in users |
| Search | API only when authenticated | API for guests and signed-in users |
| Event PDP (`useCatalogPdp`) | API only when authenticated | API for numeric IDs without login |
| `useMockUser` | Fell back to `CURRENT_USER` when signed in | Uses `serverUser` from session; mock baseline only for guests |
| `edit-profile.tsx` | Avatar stored locally only | On save: `POST/DELETE /users/me/profile-image` when file picked/removed |
| `business/(dashboard)/profile.tsx` | Local hub store only | `PUT /business-profile/me` + logo/banner multipart upload/delete |
| `businessHubStore.syncBusinessApprovalFromApi` | Status only | Also hydrates profile fields from API DTO |

### Follow-up: production-data cleanup (2026-06-03)

Subsequent pass removed runtime mock catalog entirely. See `docs/PRODUCTION_DATA_CLEANUP_REPORT.md`.

| Item | Status |
|------|--------|
| Mock catalog / `MOCK_*` / `useMockUser` | **Removed** |
| `referenceStore` API-only | **Done** |
| `booking/[id].tsx` numeric API ids only | **Done** |
| Business dashboard mock activity rows | **Removed** |

**Out of scope (not backend gaps):** `restaurant/`, `stay/`, `experience/`, `package/`, `organizer/` PDP shells; **Premium**, **wallet**, **vouchers** — presentation UI only, kept in app navigation.

---

## 3. Image uploads

### Fixed (connected to existing backend)

| Asset | Backend | Mobile |
|-------|---------|--------|
| User profile photo | `POST/DELETE /users/me/profile-image` | `usersApi.uploadMyProfileImage` / `deleteMyProfileImage` + `multipartUpload.ts`; wired in `edit-profile.tsx` on save |
| Business logo | `POST/DELETE /business-profile/me/logo` | `businessProfileApi` + `profile.tsx` save |
| Business banner | `POST/DELETE /business-profile/me/banner` | `businessProfileApi` + `profile.tsx` save |

### Business event photos (resolved after this report)

Multipart `POST/DELETE /business/events/{id}/photos` and mobile upload flow were added in a follow-up pass. See backend `BusinessEventController` and `mobile/src/api/businessEventsApi.ts`.

---

## 4. Business approval → `ROLE_BUSINESS`

### Verified (already implemented; tests pass)

| Step | Behavior |
|------|----------|
| Register | `ROLE_USER` only (`AuthServiceImpl`) |
| Submit profile | `PENDING_REVIEW`; roles unchanged |
| Admin approve | `AdminBusinessProfileServiceImpl.approve()` → `businessUserRoleService.grantBusinessRole(owner)` |
| Manual admin role edit | `AdminUserServiceImpl` blocks `ROLE_BUSINESS` unless profile `APPROVED` |
| Profile edit after approval | Revert to `DRAFT` revokes `ROLE_BUSINESS` (`BusinessProfileServiceImpl`) |

**Tests:** `BusinessUserRoleServiceImplTest`, `AdminBusinessProfileServiceImplRoleTest` — passing.

**Note:** Existing DB rows approved before this logic may lack `ROLE_BUSINESS` until re-approved or a one-time data fix.

---

## Summary

| Area | Status |
|------|--------|
| Guest event browsing | **Fixed** (backend + mobile) |
| Mobile API for core catalog | **Fixed** for explore/search/PDP |
| Profile + business logo/banner upload | **Fixed** |
| Event image upload | **Fixed** (follow-up) |
| Legacy vertical PDP routes | **Out of scope** (UI shells, not product verticals) |
| Business role on approval | **Verified** |

---

## Suggested manual test checklist

1. Guest: open Explore → events load; tap event → detail loads.
2. Sign in: edit profile → pick photo → save → avatar URL from `/api/v1/files/profile-images/...`.
3. Approved partner: business dashboard profile → edit logo/banner → save → images served from `/api/v1/files/business-logos|banners/...`.
4. Admin: approve pending business profile → Users list shows **User, Business** for owner.
5. Partner: create event with local photos only → confirm photos are **not** sent until event upload API exists.
