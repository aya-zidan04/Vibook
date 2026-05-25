# Typography refactor report

Unified Vibook typography across **mobile** (`mobile/src/theme/typography.ts`) and **admin** (`admin-web/src/theme/admin-theme.css`). Mobile renders through `AppText` + locale fonts; admin uses `--vb-text-*` CSS variables.

## Scale (single source of truth)

| Token | Size | Weight | Line height |
|--------|------|--------|-------------|
| display | 32px | 800 | 40 |
| h1 | 26px | 700 | 32 |
| h2 | 20px | 700 | 26 |
| h3 | 17px | 600 | 24 |
| body-lg | 16px | 400 | 24 |
| body | 15px | 400 | 22 |
| body-em | 15px | 600 | 22 |
| caption | 13px | 400 | 18 |
| label | 12px | 600 | 16 |
| overline | 12px | 600 | 16 |

## Files changed

### Mobile — core

- `mobile/src/theme/typography.ts` — scale, aliases, `inputTextStyle()`, `fontFamilyForWeight()`
- `mobile/src/theme/useAppFonts.ts` — DM Sans + Tajawal via expo-font
- `mobile/src/components/ui/AppText.tsx` — locale font + `writingDirection`
- `mobile/src/utils/rtlText.ts` — `textAlignStart` / `textAlignEnd`
- `mobile/app/_layout.tsx` — font loading gate

### Mobile — screens & components

- `mobile/app/(tabs)/_layout.tsx` — tab labels 12px/600 + locale `fontFamily`
- `mobile/app/(tabs)/explore.tsx` — hero eyebrow → `overline` (was 11px)
- `mobile/app/(tabs)/me.tsx` — guest copy RTL `textAlignStart`
- `mobile/app/language-currency.tsx` — `AppText` h1/h3/caption; 28→h1, 17→h3, 14→caption
- `mobile/app/(auth)/signup.tsx` — terms → `caption`; flag → `h2`
- `mobile/app/edit-profile.tsx` — flag emoji → `h2`
- `mobile/app/membership/plans.tsx` — badge → `label` (was 10px)
- `mobile/app/business/join.tsx` — message input → `inputTextStyle`
- `mobile/app/business/(dashboard)/profile.tsx` — hero inputs h1/body-lg
- `mobile/app/business/(dashboard)/home.tsx` — removed unused 10px `statVizHint` style
- `mobile/src/components/explore/ExploreHeader.tsx` — `AppText` h2 / body-em
- `mobile/src/components/explore/ExploreHeroCarousel.tsx` — eyebrow → `overline`
- `mobile/src/components/auth/AuthTextField.tsx` — `inputTextStyle` for inputs
- `mobile/src/components/business/BusinessFormField.tsx` — multiline `inputTextStyle`
- `mobile/src/components/navigation/BusinessTabBar.tsx` — labels via `AppText` `label`

### Admin

- `admin-web/src/theme/admin-theme.css` — `--vb-text-*` variables + RTL `font-family`
- `admin-web/src/styles/admin-components.css` — rem sizes → variables (bulk)
- `admin-web/index.html` — Tajawal font link

### Docs

- `docs/TYPOGRAPHY_REFACTOR.md` (this file)

## Removed duplicates / legacy names

| Removed / aliased | Maps to |
|-------------------|---------|
| `bodyMedium` (variant) | `body-em` |
| `meta` (variant) | `label` |
| `price` (variant) | `h3` |
| Inline `fontSize` on `AppText` screens | typography tokens |
| Admin scattered `0.65–0.9375rem` | `--vb-text-label` / `caption` / `body` |
| `pageTitleAr`, `cardTitleEn/Ar` style splits | `textAlignStart()` + per-card `writingDirection` |

## Old values → new values

| Location | Before | After |
|----------|--------|-------|
| Entry hero | 32px raw | `display` |
| Language page title | 28px | `h1` (26px) |
| Explore wordmark | 20px raw | `h2` |
| Language/currency cards | 17px / 14px | `h3` / `caption` (13px) |
| Hero eyebrows (explore) | 11px | `overline` (12px) |
| Tab bar labels | 11px | `label` (12px/600) + DM Sans/Tajawal |
| Badges (plans) | 10px | `label` (12px) |
| Business tab bar | 10px | `label` |
| Stat hints (home) | 10px (unused style) | removed |
| Text inputs | 16px ad hoc | `body-lg` via `inputTextStyle()` |
| Profile hero name input | 26px ad hoc | `h1` via `inputTextStyle(locale, 'h1')` |
| Signup terms | 14px | `caption` (13px) |
| Admin micro copy | 0.65–0.6875rem (~10–11px) | `--vb-text-label` (12px) |
| Admin body copy | 0.875rem (14px) | `--vb-text-body` (15px) |
| Fonts EN | system default | DM Sans |
| Fonts AR | system default | Tajawal (600 → 700 file) |

## Remaining inconsistencies (intentional or follow-up)

1. **Tab bar `tabBarLabelStyle`** — still sets `fontSize: 12` / `lineHeight: 16` in StyleSheet (matches `label` token; React Navigation cannot use `AppText`). Font family is locale-aware.
2. **Phone number fields** — `textAlign: 'left'` + `writingDirection: 'ltr'` on signup/edit-profile (keeps +962 numerals LTR in Arabic UI).
3. **Admin responsive headings** — `clamp(1.65rem, …)` left as-is for marketing hero blocks (not in the fixed scale table).
4. **`AppText` does not set `textAlign`** — callers use `textAlignStart(isRTL)` or `center` where needed; global RTL layout still mirrors containers.
5. **Form field labels** — some `AppText` captions add `fontWeight: '600'` in style (redundant with token; harmless).
6. **Arabic semibold** — weight `600` uses `Tajawal_700Bold` (no 600 font file in `@expo-google-fonts/tajawal`).

## Verification

- `cd mobile && npx tsc --noEmit` — passes.
