# Mobile ↔ backend integration

This app supports a **dual mode**: real API when `EXPO_PUBLIC_API_BASE_URL` is set, and **bundled mocks** when it is not. No separate build flavor is required.

## Environment

| Variable | Effect |
|----------|--------|
| `EXPO_PUBLIC_API_BASE_URL` | If **unset** or empty: `isApiConfigured()` is `false` — mock catalog, mock bookings list, local payment simulation, etc. If **set** (e.g. `http://192.168.1.10:8080`): HTTP client and catalog/me hooks call the Spring API. **No trailing slash.** |

For a **physical device**, use your machine’s LAN IP, not `localhost`.

## Runtime modes (`useIntegrationMode()`)

| Flag | Meaning |
|------|---------|
| `mockOnly` | No API URL — treat data as local/mock everywhere it matters. |
| `guestWithApi` | URL set, user **not** signed in — public `GET` catalog/reference work; **account** screens (wallet, vouchers, bookings list, favorites sync, notifications) show **sign-in** prompts or stay on mocks. |
| `liveAccount` | URL set **and** signed in — authenticated `/api/v1/me/*` flows (bookings, wallet, favorites PUT/DELETE, ratings sync, etc.). |

Session: JWT in secure storage; `useSessionStore().serverUser` holds the last `/me` snapshot after login/refresh.

## IDs: numeric vs legacy mock

- **Backend catalog** entities use **numeric** ids in routes (`/event/42`).
- **Mocks** use opaque ids (`e1`, `r1`, `c1`, `b1`, …).
- **`isNumericCatalogId` / `parseCatalogNumericId`** (`src/services/catalog/mapCatalog.ts`): if the route param is all digits, PDPs and favorites previews call the API; otherwise they resolve from `src/mock/`.
- **Bookings**: server booking ids are **UUIDs**; mock bookings use ids like `b1`. **`isBookingUuid`** (`src/utils/bookingApiMap.ts`) chooses `GET /me/bookings/{id}` vs mock lookup.

## What uses the API (when configured)

- **Catalog PDPs & explore**: `useCatalogPdp`, explore store — numeric id → API, else mock.
- **Reference data**: cities, categories, … when API on.
- **Auth**: login/register/refresh against API when URL set; otherwise mock auth in login/signup.
- **Profile**: PATCH `/me` when API + authenticated.
- **Favorites**: numeric ref + API + auth → REST sync; mock keys preserved in storage.
- **Ratings**: same pattern in `userRatingsStore`.
- **Bookings**: create/list/detail/cancel when `liveAccount` and numeric draft ref / UUID booking id (see booking slice).
- **Wallet, vouchers, membership, notifications**: `liveAccount` for `/me/*` (plans list is public when API on).

## What stays mock / hybrid intentionally

- **Search tab**: mock results (not wired to a search API).
- **Me tab stats**: booking count still uses `MOCK_BOOKINGS` for the stat tiles (cosmetic; list tab is integrated).
- **Payment simulation**: without API, or without token, or **non-numeric** `refId` on the draft → timed local “VB-…” confirmation (unchanged).
- **Guest + API**: can browse real catalog on numeric routes; heart/rating may stay device-local until login for non-numeric listings.

## Money

Backend supports **JOD** and **USD** only. Display conversion uses `useFormatMoney` / `formatDisplayMoney` and the user’s locale currency preference. Legacy mock listings may still expose other currency codes in data; create-booking and wallet normalize where integrated.

## Local smoke test

1. Run backend (e.g. port 8080).
2. `EXPO_PUBLIC_API_BASE_URL=http://<host>:8080 npm start` from `mobile/`.
3. Register/login, open Explore (numeric event id from seed), Favorites, Bookings, Wallet.

## Partner / business leads

`POST /api/v1/business/leads` is **public** (no JWT). The partner form in **`/business/join`** submits when `EXPO_PUBLIC_API_BASE_URL` is set; otherwise it simulates success after a short delay.

## Related files

- `src/config/api.ts` — URL helpers.
- `src/hooks/useIntegrationMode.ts` — mode flags for screens.
- `src/services/api/http.ts` — `apiRequest`, refresh on 401.
- `src/services/catalog/mapCatalog.ts` — numeric id + DTO mappers.
