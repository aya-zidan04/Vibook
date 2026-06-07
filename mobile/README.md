# Vibook — Mobile app

Expo + React Native frontend for **Vibook** — an **events marketplace** in Jordan (discover, book, partner onboarding).

**API-backed:** events, categories, subcategories, governorates, bookings, favorites, ratings, auth, and business partner flows.

**Presentation-only (no backend expected):** Premium membership screens, wallet, vouchers, and legacy PDP routes (`restaurant/`, `stay/`, `experience/`, `package/`, `organizer/`) kept for UI/navigation — not separate product verticals.

Configure `EXPO_PUBLIC_API_URL` in `.env` (see `.env.example`). Use your laptop **LAN IP**, not `localhost` or `127.0.0.1`, so Expo Go on a physical phone can reach the API.

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

**Backend + API URL**

1. Start Spring Boot on port **8080** (`backend/`).
2. Copy `.env.example` to `.env`.
3. Set `EXPO_PUBLIC_API_URL=http://YOUR_LAN_IP:8080/api/v1` (e.g. `http://192.168.1.5:8080/api/v1`).
4. Phone and laptop must be on the **same Wi‑Fi**.

**Reload after `.env` changes** — Expo bakes env vars at bundle time; restart with a clean cache:

```bash
npx expo start -c
```

If **port 8081 is busy**:

```bash
npm run start:8085
```

## App entry & tabs

1. **`/` (`app/index.tsx`)** — Splash; loads reference data (governorates/categories) from the API.
2. **Onboarding / entry** — First launch flow; persisted via Zustand + AsyncStorage.
3. **Tabs (`app/(tabs)/`)** — Explore, Booking, Favorites, Me.

Additional stacks: Premium (static UI), wallet/vouchers (static UI), checkout, business join, legacy PDP routes, etc.

## Project layout

```
mobile/
├── app/                 # expo-router routes
├── src/
│   ├── components/
│   ├── theme/
│   ├── api/             # HTTP clients
│   ├── services/        # catalog mappers, favorites helpers, profile merge
│   ├── store/
│   ├── hooks/
│   └── utils/
├── app.json
├── tsconfig.json
└── package.json
```

## Typecheck

```bash
npm run typecheck
```
