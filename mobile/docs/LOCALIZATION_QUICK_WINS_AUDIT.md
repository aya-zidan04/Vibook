# Localization Quick Wins — Audit Report

**Date:** 2026-05-24  
**Scope:** Mobile app i18n quick wins (locale reload, API error localization, search cleanup, hardcoded fallback removal)

## Verification

| Check | Result |
|-------|--------|
| `npm run typecheck` | Pass |
| `npm run check:i18n` | Pass — **745** keys in `en` and `ar` (parity OK) |

---

## Files changed (this quick-wins pass)

### New utilities

| File | Purpose |
|------|---------|
| `src/utils/mapApiError.ts` | Central `mapApiError(err, t)` — maps network/HTTP status to `errors.*` keys; never returns raw backend English |
| `src/utils/reloadApp.ts` | `reloadAppForLocaleChange()` — syncs native RTL, persists locale to AsyncStorage, then `DevSettings.reload()` (or `location.reload()` on web) |

### i18n dictionary

| File | Change |
|------|--------|
| `src/i18n/dictionary.ts` | Added `errors.network`, `unauthorized`, `forbidden`, `notFound`, `conflict`, `validation`, `timeout`, `server`, `request`, `referenceLoad` (EN + AR) |

### API / stores

| File | Change |
|------|--------|
| `src/api/http.ts` | Internal `ApiError` fallback uses `http_${status}` instead of `'Request failed'` |
| `src/utils/apiError.ts` | Re-exports `mapApiError` / `mapApiErrorForLocale` |
| `src/store/referenceStore.ts` | Removed hardcoded `'Failed to load reference data'`; catalog warning uses i18n in UI |
| `src/hooks/useEventSearch.ts` | Stores `unknown` error object (not raw message string) |

### Locale / RTL reliability

| File | Change |
|------|--------|
| `app/(premium-sheet)/language-currency.tsx` | Calls `reloadAppForLocaleChange` on language select |
| `app/(tabs)/_layout.tsx` | `key={locale}` on `<Tabs>` so tab labels re-mount after locale change |
| `app/business/(dashboard)/_layout.tsx` | `key={locale}` on partner `<Tabs>` |

### Screens wired to `mapApiError`

| Area | File |
|------|------|
| Auth | `app/(auth)/login.tsx`, `app/(auth)/signup.tsx` |
| Search | `app/search.tsx` |
| Favorites | `app/(tabs)/favorites.tsx` |
| Bookings | `app/(tabs)/booking.tsx`, `app/booking/[id].tsx` |
| Profile | `app/edit-profile.tsx` |
| Payment | `app/payment.tsx`, `app/(premium-sheet)/payment-methods.tsx`, `app/(premium-sheet)/add-payment-method.tsx` |
| Reports | `app/(premium-sheet)/report-problem.tsx`, `src/components/report/ReportIssueModal.tsx` |
| Business Hub | `app/business/join.tsx` |
| Explore | `src/components/explore/ExploreHeader.tsx` (`errors.referenceLoad`) |

---

## What was fixed

1. **Locale change reliability** — Language switch triggers a full app reload after persisting locale + RTL sync. Tab navigators remount via `key={locale}`.
2. **API error localization** — User-facing surfaces no longer display `ApiError.message` or backend `ErrorResponse.message`. All mapped through `mapApiError()`.
3. **Search cleanup** — Search error state uses `mapApiError(error, t)` instead of raw API strings.
4. **Hardcoded English fallbacks removed from code paths:**
   - ~~`Request failed`~~ → internal `http_${status}` only
   - ~~`Failed to load reference data`~~ → `errors.referenceLoad` in UI
   - ~~Raw search error strings~~ → `search.loadError` title + localized body via `mapApiError`

Note: `common.error`, `common.errorDefaultTitle`, and `common.errorDefaultMessage` remain in the dictionary as **intentional localized defaults** for generic error UI (`ErrorState`), not as hardcoded runtime fallbacks in catch blocks.

---

## Remaining i18n issues (client)

| Issue | Location | Notes |
|-------|----------|-------|
| Report reason API payload | `ReportIssueModal.tsx` | UI labels are translated via `report.reasons.*`, but the value sent to the API is still English (`REASON_VALUES`). Admin sees English reason text. |
| Taxonomy Arabic labels | API `name` only | Categories/governorates use backend `name` for both EN/AR until optional `nameAr` fields exist. |
| Business partner category constants | `src/constants/businessPartnerCategories.ts` | English labels used as API fallback before taxonomy merge. |
| Date/number formatting | Various | Uses `en-US` locale in some formatters regardless of app locale. |
| Admin web | `admin-web/` | Separate i18n pass; not in scope for this mobile quick-wins batch. |
| Tab bar LTR lock | `(tabs)/_layout.tsx` | Tab order intentionally stays LTR (Explore → Booking → Favorites → Me) even in Arabic UI — by design, but worth UX review. |
| Currency auto-switch | `language-currency.tsx` | Selecting Arabic forces JOD; not reverted when switching back to English. |

---

## Remaining backend limitations (content still English)

| Content type | Source | Client mitigation |
|--------------|--------|-------------------|
| Event titles & descriptions | `GET /api/v1/events`, event detail | None — displayed as returned |
| Business event copy | Business Hub CRUD | None |
| User-generated text | Bookings, reports, reviews | None |
| Governorate `name` field | `/governorates/active` | Client maps to `governorateLabels` / taxonomy for display |
| Category `name` field | `/categories` | API `name` used for EN/AR until optional `nameAr` exists |
| API error `message` / `fieldErrors` | All endpoints | **Suppressed in mobile UI** via `mapApiError`; granular field-level messages not shown |
| Email / push notifications | Backend (if any) | Out of mobile app scope |

### Recommended follow-ups (not in quick wins)

1. Backend: add `nameAr` / localized fields for events, categories, governorates.
2. Backend: return stable error **codes** (e.g. `BOOKING_NOT_FOUND`) instead of English prose; client maps codes to i18n.
3. Mobile: send report reason enum keys to API instead of English strings.
4. Mobile: locale-aware `Intl.DateTimeFormat` / `Intl.NumberFormat` everywhere.

---

## Usage reference

```ts
import { mapApiError } from '@/utils/mapApiError';
import { useTranslation } from '@/i18n/useTranslation';

const { t } = useTranslation();

try {
  await someApiCall();
} catch (e) {
  Alert.alert(t('common.error'), mapApiError(e, t));
}
```

For non-React code (stores, hooks):

```ts
import { mapApiErrorForLocale } from '@/utils/mapApiError';

const message = mapApiErrorForLocale(err, locale);
```
