# Typography consistency audit (post-refactor)

**Date:** 2026-05-24  
**Scope:** `mobile/` + `admin-web/`  
**Goal:** Centralized typography with no scattered size/weight values.

---

## Executive summary

| Area | Status |
|------|--------|
| Mobile `fontSize` outside `typography.ts` | **Clear** (0 numeric `fontSize` in components) |
| Mobile raw `Text` (non-`AppText`) | **Clear** (only `AppText.tsx` wrapper) |
| Locale font switching | **Centralized** via `AppText` + `inputTextStyle` + `tabBarLabelTextStyle` |
| Admin `font-size` | **Centralized** on `--vb-text-*` (except root `16px` + 2× `clamp()`) |
| RTL `textAlign` ternaries | **Migrated** to `textAlignStart()` / `textAlignEnd()` |
| Physical `paddingLeft/Right` | **Clear** (0 in mobile) |

**Auto-fixed in this pass:** 35+ files — see [Cleanup applied](#cleanup-applied).

---

## 1. Hardcoded typography values (mobile)

### `fontSize` — PASS

No `fontSize: <number>` remains in TSX/TS except `typography.ts`.

Tab bar now uses `tabBarLabelTextStyle(locale)` from `typography.ts` (no duplicate 12/16/600).

### `fontWeight` — acceptable exceptions

| File | Value | Reason |
|------|-------|--------|
| `CityPickerSheet.tsx`, `GovernoratePickerSheet.tsx`, `BusinessCategoryPickerSheet.tsx` | `700` on selected row | Picker list emphasis (not a text variant) |
| `me.tsx` | `700` on stat values | Intentional emphasis on numeric stats |
| `help.tsx` | — | Highlights use `body-em` variant (fixed) |

All form labels previously used `caption` + `fontWeight: '600'` → migrated to `variant="label"`.

### `lineHeight` — follow-up (cosmetic)

~27 files still set `lineHeight` on `AppText` styles. Most match token values (e.g. `22` = `body`, `18` = `caption`) and are **redundant** but harmless. Removing them is a safe mechanical cleanup (not done in full to limit diff size).

**Does not violate minimum size** — all values ≥ 16 (label) or 18 (caption).

### `letterSpacing` — follow-up (decorative)

| File | Value | Notes |
|------|-------|-------|
| `Badge.tsx`, `plans.tsx` | `0.6` | Uppercase badge tracking |
| `BusinessTabBar.tsx` | `0.02` | Tab label micro-adjust |
| `home.tsx` | `-0.6`, `0.3` | Dashboard hero/display tweaks |
| `typography.ts` | per-token | **Source of truth** |

Removed duplicate `letterSpacing: -0.3` on `h1` screens (already on `typography.h1`).

---

## 2. Raw `Text` vs `AppText`

| Before | After |
|--------|-------|
| `help.tsx` nested `Text` + `typography.body` | Nested `AppText` (`body` / `body-em`) |

**Only** `AppText.tsx` imports RN `Text` (required wrapper).

---

## 3. Locale-based font switching

| Path | Mechanism |
|------|-----------|
| All `AppText` | `fontFamilyForWeight(locale, token.fontWeight)` |
| Text inputs | `inputTextStyle(locale[, variant])` |
| Tab bar | `tabBarLabelTextStyle(locale)` |
| Admin `html` | `var(--vb-font)` / `html[dir='rtl']` → `var(--vb-font-ar)` |

**No component should set `fontFamily` manually** except the three helpers above.

---

## 4. RTL audit

### Text alignment — PASS (with intentional exceptions)

- **Migrated:** All `isRTL ? 'right' : 'left'` for content → `textAlignStart(isRTL)` via `rtlText.ts` (`HorizontalTextAlign` type for `TextInput` compatibility).
- **Intentional `textAlign: 'left'`:** `signup.tsx`, `edit-profile.tsx` `phoneInput` — LTR phone numerals in RTL UI.
- **Intentional `textAlign: 'center'`:** Tab labels, stats, empty states, footers.

### Layout (margins/padding) — PASS

- **No** `paddingLeft` / `paddingRight` / `marginLeft` / `marginRight` in mobile.
- Widespread `paddingStart` / `paddingEnd` / `marginEnd` — correct logical properties.

### `alignItems: flex-start/end` — acceptable

Used for row layout (FAQ chevrons, form rows, chart baselines). Not text-alignment substitutes; **no change required** unless a screen mirrors incorrectly (none found).

### Language cards

Per-card `writingDirection` + `textAlignStart(isArabicLabel)` for EN/AR card content — correct.

---

## 5. Duplicated definitions

| Duplicate | Resolution |
|-----------|------------|
| `bodyMedium` / `meta` / `price` variants | Aliases in `typographyAliases` |
| `designSystem.typography` | Re-exports same `typography` object (not a second scale) |
| Form `caption` + `fontWeight 600` | Unified to `label` variant |
| Admin `.vb-overline` at 11px | Fixed → `var(--vb-text-label)` |
| `h1` `letterSpacing: -0.3` on screens | Removed (in token) |

---

## 6. Files still violating strict “zero scattered” goal

### Mobile — low priority

| File(s) | Issue | Severity |
|---------|-------|----------|
| ~27 screens/components | Redundant `lineHeight` on `AppText` | Low |
| `Badge`, `BusinessTabBar`, `home.tsx` | Custom `letterSpacing` | Low (decorative) |
| Picker sheets | `fontWeight: '700'` on selected row | Low |
| `me.tsx` | `fontWeight: '700'` on stats | Low |
| `signup` / `edit-profile` | `textAlign: 'left'` on phone | **By design** |

### Admin — expected pairing

| Item | Notes |
|------|-------|
| `font-weight` / `line-height` / `letter-spacing` in `admin-components.css` | Paired with `var(--vb-text-*)` sizes; weights not yet tokenized as CSS variables |
| `html { font-size: 16px }` | Root rem basis (standard) |
| `clamp(...)` on 2 hero titles | Responsive marketing type |
| `admin-components.css` ~50+ weight/line-height rules | Future: `--vb-weight-*`, `--vb-lh-*` shorthands |

---

## 7. Cleanup applied (auto-refactor)

- `typography.ts` — added `tabBarLabelTextStyle()`
- `(tabs)/_layout.tsx` — tab labels from typography helper
- `help.tsx` — full `AppText` migration
- Form fields — `caption`+600 → `label`; removed style `fontWeight`
- `AuthTextField`, `BusinessFormField`, select fields, profile/join/events — `textAlignStart`
- `ExploreHeader`, `entry`, picker sheet titles — RTL helpers / overline token
- `admin-theme.css` — `.vb-overline` 11px → 12px token
- `signup.tsx` — `paddingLeft` → `paddingStart`
- Redundant `letterSpacing` on `h1` screens removed
- `Badge` — removed duplicate `fontWeight: '700'`
- `Button` — removed duplicate `fontWeight` on `body-em`
- `CategoryChip` — removed redundant label weight
- `home.tsx` — section eyebrows → `overline` variant

---

## Verification

```bash
cd mobile && npx tsc --noEmit   # passes
```

---

## Recommended next pass (optional)

1. Strip redundant `lineHeight` from `AppText` styles where it matches the active variant.
2. Add admin CSS variables: `--vb-weight-semibold`, `--vb-lh-body`, etc., and replace raw weights in `admin-components.css`.
3. Add `typographyDecor.badge` / `tabBar` letterSpacing to `typography.ts` if decorative tracking must be documented in one place.

See also: [TYPOGRAPHY_REFACTOR.md](./TYPOGRAPHY_REFACTOR.md)
