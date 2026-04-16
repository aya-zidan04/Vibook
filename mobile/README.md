# Vibook — Mobile app

Expo + React Native frontend for **Vibook**, a lifestyle booking experience (events, dining, stays, and more).

This repository build is **mock-only**: there is no backend or HTTP API. All catalog and account data ships with the app.

## Tech stack

| Layer | Choice |
|--------|--------|
| Runtime | Expo SDK 54, React Native 0.81, React 19 |
| Language | TypeScript (strict) |
| Navigation | **expo-router** (file-based routes) |
| State | **Zustand** with **AsyncStorage** persistence where noted |
| Images / gradients | `expo-image`, `expo-linear-gradient` |
| Path alias | `@/*` → `./src/*` (see `tsconfig.json`) |

## How to run

From the **`mobile`** directory:

```bash
npm install
npx expo start
```

Then press `i` (iOS simulator), `a` (Android), or scan the QR code with **Expo Go**.

If **port 8081 is busy**:

```bash
npm run start:8085
```

## App entry & tabs

1. **`/` (`app/index.tsx`)** — Splash; loads mock reference data (cities/categories).
2. **Onboarding / entry** — First launch flow; persisted via Zustand + AsyncStorage.
3. **Tabs (`app/(tabs)/`)** — Explore, Booking, Favorites, Me.

Additional stacks: wallet, vouchers, membership, notifications, PDP routes, checkout, business join, etc.

## Project layout

```
mobile/
├── app/                 # expo-router routes
├── src/
│   ├── components/
│   ├── theme/
│   ├── mock/            # Bundled catalog & fixtures
│   ├── services/       # catalog mappers, favorites helpers, profile merge
│   ├── store/
│   ├── hooks/
│   └── utils/
├── app.json
├── tsconfig.json
└── package.json
```

## Scripts

| Script | Description |
|--------|-------------|
| `npm start` / `npx expo start` | Expo dev server (Metro) |
| `npm run start:8085` | Metro on port 8085 |
| `npm run lint` | `tsc --noEmit` |

## License / product

Student / graduation project — standalone demo build.
