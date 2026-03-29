# Vibook — Mobile app

Expo + React Native frontend for **Vibook**, a lifestyle booking experience (events, dining, stays, flights, and more). This README documents what the app does today and how it is organized.

## Tech stack

| Layer | Choice |
|--------|--------|
| Runtime | Expo SDK 54, React Native 0.81, React 19 |
| Language | TypeScript (strict) |
| Navigation | **expo-router** (file-based routes) |
| State | **Zustand** with **AsyncStorage** persistence for onboarding / city |
| Images / gradients | `expo-image`, `expo-linear-gradient` |
| Gestures | `react-native-gesture-handler` |
| Animations | React Native `Animated` for skeleton shimmer; Reanimated remains in deps for future use |
| Path alias | `@/*` → `./src/*` (see `tsconfig.json`) |

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

- Always run commands from the **`mobile`** folder so Metro finds `app/` and `package.json`.

## App entry & flow

1. **`/` (`app/index.tsx`) — Splash**  
   First screen on cold start: branding, short delay (~2.2s). Waits for persisted state to hydrate.

2. **Onboarding (`app/onboarding.tsx`)** — Shown only until the user taps **Get started** the first time.  
   `hasCompletedOnboarding` is stored via Zustand **persist** + **AsyncStorage** (`vibook-storage`).

3. **Main app — Tabs (`app/(tabs)/`)**  
   After splash (and onboarding when needed), user lands on **Home** and can switch tabs:

   | Tab | File | Purpose |
   |-----|------|---------|
   | Home | `(tabs)/index.tsx` | Rich homepage: header, search, categories, hero carousel, sections (trending, restaurants, experiences, etc.) |
   | Explore | `(tabs)/explore.tsx` | Discovery: themes, category grid, destinations, picks |
   | Search | `(tabs)/search.tsx` | Search UI: segments, recent/popular, results from mock data |
   | Bookings | `(tabs)/bookings.tsx` | Lists bookings from mock data, status pills, action placeholders |
   | Profile | `(tabs)/profile.tsx` | Profile header, stats, vouchers, account menu |

4. **Auth shell (`app/(auth)/`)**  
   `welcome.tsx` is a placeholder for a future auth flow; not part of the default splash → tabs path.

## Project layout

```
mobile/
├── app/                    # expo-router routes only
│   ├── _layout.tsx         # Root: gesture handler, safe area, stack
│   ├── index.tsx           # Splash (first route)
│   ├── onboarding.tsx      # First-time onboarding
│   ├── (tabs)/             # Bottom tab navigator + screens
│   └── (auth)/             # Auth group (placeholder)
├── src/
│   ├── components/         # UI library (screens import from @/components)
│   │   ├── ui/             # AppText, Button, Badge, CategoryChip
│   │   ├── layout/         # Screen, AppHeader, SearchBar, SectionHeader, HeroCarousel, …
│   │   ├── feedback/       # EmptyState, ErrorState, ShimmerLoader
│   │   └── cards/          # EventCard, …
│   ├── theme/              # colors, typography, spacing, radii, shadows
│   ├── mock/               # Fake data: events, cities, bookings, hotels, …
│   ├── types/              # Shared TypeScript models
│   ├── store/              # Zustand store (persisted slice)
│   ├── constants/          # App constants
│   └── utils/              # e.g. formatPrice, formatDateShort
├── app.json                # Expo config: name **Vibook**, slug **vibook**, dark UI, plugins
├── babel.config.js         # babel-preset-expo; reanimated plugin must stay **last**
├── tsconfig.json           # strict, jsx, paths `@/*` → `./src/*`
└── package.json            # `"main": "expo-router/entry"`
```

## Design system

- **Location:** `src/theme/` — dark, premium palette (navy base, purple / pink / cyan accents).
- **Usage:** import from `@/theme` or `@/theme/colors` in components.

## Data

- All listings are **mock data** under `src/mock/`. There is **no backend** wired in this repo.
- Types live in `src/types/index.ts`.

## Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Expo dev server (Metro) |
| `npm run start:8085` | Same, on port 8085 if 8081 is taken |
| `npm run lint` | `tsc --noEmit` |

## Troubleshooting

| Issue | What to try |
|--------|-------------|
| Metro won’t start / “port in use” | `npm run start:8085` or stop the other process on 8081 |
| Red screen on open related to **Reanimated** | Skeleton shimmer was moved to RN `Animated` in `ShimmerLoader.tsx`; reload after pull |
| Onboarding shows every time | Clear app storage or AsyncStorage key `vibook-storage` to reset state |
| Wrong folder | Run Expo from **`mobile`**, not the monorepo root only |

## Naming

- **npm package name:** `vibook` (`package.json`)
- **App display name / Expo:** **Vibook** / slug `vibook` (`app.json`)
- **Folder:** `mobile/` (path on disk only)

## License / product

Student / graduation project UI; replace mock data and add a real API when ready.
