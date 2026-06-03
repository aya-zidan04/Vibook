# Duplicate & dead code cleanup report

**Date:** 2026-06-03  
**Scope:** backend, mobile, admin-web (docs touch-up where references were stale)

---

## Before changes — suspected duplicates

### Backend

| Item | Canonical | Duplicate / legacy | Safe to remove? |
|------|-----------|-------------------|-----------------|
| Admin dashboard stats | `GET /admin/analytics/summary` (`AdminAnalyticsService`) | `GET /admin/dashboard/stats` (4-class stack) | **Yes** — admin UI uses analytics only |
| Category by slug | `GET /categories` + filter client-side | `GET /categories/slug/{slug}` | **Yes** — no known clients |
| Consumer vs admin vs business event APIs | Separate controllers per audience | Same `BusinessEventService` for mutations | **No** — intentional |
| `NotFoundException` vs `ResourceNotFoundException` | Both → 404 | Twin exception types | **No** — merge is refactor, not deletion |
| `DELETE /users/{id}` vs `PATCH /admin/users/{id}/disable` | Admin disable path | Legacy delete on `UserController` | **No** — conservative (external clients unknown) |
| `photoUrls` + `photos` on `BusinessEventResponse` | Both populated from mapper | Field redundancy | **No** — mobile still reads `photoUrls` |
| `roundAvg()` in rating services | — | Copy in two impls | **No** — extract util later |

### Mobile

| Item | Canonical | Duplicate / dead | Safe to remove? |
|------|-----------|------------------|-----------------|
| Event → `EventItem` | `services/api/eventMap.ts` | `businessEventToEventItem.ts` | **Yes** — zero imports |
| Reference cache | `referenceStore` | Direct `listCategories` in some business screens | **No** — behavior change if rewired |
| Catalog ID helpers | `mapCatalog.isNumericCatalogId` | Full mock DTO mappers in same file | **Yes** — trim file |
| `exploreCategoryTaxonomy.ts` | API-driven `categoryLabels` | Hardcoded 4-category taxonomy | **Yes** — zero TS imports |
| `useIntegrationMode` | Always API mode | Stale hook | **Yes** — zero imports |
| Hub photo URL helpers | `splitEditorPhotos` | `photoUrlsForApi`, `displayPhotoUrisFromResponse` | **Yes** — unused exports |
| `bookingApiMap` | `canCancelBookingStatus` | Other exports | **Yes** — trim file |
| Legacy PDP hooks | Stubs by design | `useRestaurantPdp`, etc. | **No** — routes kept (presentation) |

### Admin-web

| Item | Canonical | Dead export | Safe to remove? |
|------|-----------|-------------|-----------------|
| Dashboard | `fetchAnalyticsSummary` | `fetchDashboardStats` | **Yes** |
| Users | `fetchAllUsers` | `fetchUserById` | **Yes** |
| Governorates | `fetchAllGovernorates` | `fetchGovernoratesActive` | **Yes** |

---

## After changes — deleted files

### Backend

- `backend/src/main/java/com/vibook/backend/controller/AdminDashboardController.java`
- `backend/src/main/java/com/vibook/backend/service/AdminDashboardService.java`
- `backend/src/main/java/com/vibook/backend/service/impl/AdminDashboardServiceImpl.java`
- `backend/src/main/java/com/vibook/backend/dto/AdminDashboardStatsResponse.java`

### Mobile

- `mobile/src/hooks/useIntegrationMode.ts`
- `mobile/src/constants/exploreCategoryTaxonomy.ts`
- `mobile/src/utils/businessEventToEventItem.ts`
- `mobile/src/utils/migrateBusinessEventRecord.ts`
- `mobile/src/types/catalogDtos.ts`

## After changes — modified files

### Backend

- `CategoryController.java` — removed unused `GET /slug/{slug}`
- `CategoryService.java` / `CategoryServiceImpl.java` — removed `getActiveCategoryBySlug`

### Mobile

- `services/catalog/mapCatalog.ts` — kept only `isNumericCatalogId`, `parseCatalogNumericId`, `CatalogRouter`
- `services/reference/mapReference.ts` — removed unused `CityDto`/`CategoryDto` mappers
- `utils/apiError.ts` — removed deprecated `formatApiErrorMessage`
- `utils/bookingApiMap.ts` — kept only `canCancelBookingStatus`
- `utils/businessHubMappers.ts` — removed unused `photoUrlsForApi`, `displayPhotoUrisFromResponse`
- `utils/governorateLabels.ts` — removed deprecated `governorateCityFromApi`
- `types/businessHub.ts` — JSDoc link fix after migration util removal

### Admin-web

- `api/adminApi.ts` — removed `fetchDashboardStats`, `fetchUserById`, `fetchGovernoratesActive`
- `api/types.ts` — removed `AdminDashboardStatsResponse`

### Docs

- `mobile/docs/LOCALIZATION_QUICK_WINS_AUDIT.md` — stale taxonomy reference

---

## Kept intentionally (not removed)

| Item | Why kept |
|------|----------|
| `BusinessEventService` + `ConsumerEventService` + `AdminEventModerationService` | Different auth and visibility rules |
| `EventRatingController` on `/events` | Public catalog + ratings (rename only) |
| Business vs admin hide/show routes | Same service, different roles |
| `BusinessEventResponse.photoUrls` + `photos` | Mobile types still use `photoUrls` |
| `businessHubStore` listing CRUD + `listings` persist | Shrinking persist shape risks migration; methods harmless |
| Legacy PDP routes + stub hooks | Product presentation shells (out of scope) |
| Premium / wallet / voucher screens | Static UI (required) |
| `UserController` `DELETE /users/{id}` | Conservative — may be used outside repo |
| `ResourceNotFoundException` | Used in favorites/ratings; merge later |
| `jordanGovernorates.ts` + `governorateLabels` slug maps | Legacy `gov-*` ids + business forms |

---

## Verification (2026-06-03)

| Check | Result |
|-------|--------|
| `backend ./mvnw test` | Pass |
| `mobile npm run typecheck` | Pass |
| `admin-web npm run lint` | Pass |
| `admin-web npm run build` | Pass |

No feature behavior, UI theme, or colors were changed.
