# Vibook — Mobile app

Expo + React Native frontend for **Vibook**, a lifestyle booking experience (events, dining, stays, flights, and more).

## Tech stack

| Layer | Choice |
|--------|--------|
| Runtime | Expo SDK 54, React Native 0.81, React 19 |
| Language | TypeScript (strict) |
| Navigation | **expo-router** (file-based routes) |
| State | **Zustand** with **AsyncStorage** persistence where noted |
| Images / gradients | `expo-image`, `expo-linear-gradient` |
| Path alias | `@/*` → `./src/*` (see `tsconfig.json`) |

## Backend integration

The app runs in **API mode** or **mock-only mode** depending on environment:

- Set **`EXPO_PUBLIC_API_BASE_URL`** (no trailing slash) to your Spring API origin, e.g. `http://localhost:8080` or your LAN IP for a device.
- If unset, listings and many account flows use **`src/mock/`** and local simulation.

Details, ID rules (numeric vs `e1`-style mocks), and per-feature behavior: **[INTEGRATION.md](./INTEGRATION.md)**.

## How to run

```bash
cd mobile
npm install
npm start
```

Then press `i` (iOS simulator), `a` (Android), or scan the QR code with **Expo Go**.

- If **port 8081 is busy** (e.g. another Java/Spring app), use:

  ```bash
  npm run start:8085
  ```

- Run commands from the **`mobile`** folder so Metro finds `app/` and `package.json`.

### Example with API

```bash
cd mobile
EXPO_PUBLIC_API_BASE_URL=http://127.0.0.1:8080 npm start
```

## App entry & tabs

1. **`/` (`app/index.tsx`)** — Splash; optional API health check when URL is configured.
2. **Onboarding (`app/onboarding.tsx`)** — First launch; persisted via Zustand + AsyncStorage.
3. **Tabs (`app/(tabs)/`)**

   | Tab | Route | Role |
   |-----|--------|------|
   | Explore | `(tabs)/explore` | Discovery; API catalog when configured + numeric filters |
   | Booking | `(tabs)/booking` | Bookings: API when `liveAccount`, else `MOCK_BOOKINGS` |
   | Favorites | `(tabs)/favorites` | Favorites: API sync when signed in + numeric refs |
   | Me | `(tabs)/me` | Profile hub, wallet/vouchers/notifications entry points |

Additional stacks: `wallet`, `vouchers`, `membership/*`, `notifications`, PDPs under `event/[id]`, `restaurant/[id]`, etc.

## Project layout

```
mobile/
├── app/                 # expo-router routes
├── src/
│   ├── components/
│   ├── theme/
│   ├── mock/            # Fallback data when API unset or non-numeric ids
│   ├── services/api/    # HTTP clients + DTO types
│   ├── store/
│   ├── hooks/           # includes useIntegrationMode, useCatalogPdp, …
│   └── utils/
├── INTEGRATION.md       # API vs mock matrix for developers
├── app.json
├── tsconfig.json
└── package.json
```

## Design system

- **Location:** `src/theme/` — dark, premium palette.
- **Usage:** import from `@/theme`.

## Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Expo dev server (Metro) |
| `npm run start:8085` | Same on port 8085 if 8081 is taken |
| `npm run lint` | `tsc --noEmit` |

## Troubleshooting

| Issue | What to try |
|--------|-------------|
| Metro won’t start / port in use | `npm run start:8085` or free port 8081 |
| API works in simulator but not on device | Use LAN IP in `EXPO_PUBLIC_API_BASE_URL`, not `localhost` |
| Onboarding every time | Clear AsyncStorage / app data for the build |
| Wrong folder | Run Expo from **`mobile/`** |

## Naming

- **npm package:** `vibook`
- **Expo app:** Vibook / slug `vibook`

## License / product

Student / graduation project; backend and mocks evolve together — see **INTEGRATION.md** for the current contract.
