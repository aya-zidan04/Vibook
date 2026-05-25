# Vibook Theme System

## Source of truth


| File                                  | Purpose                                                   |
| ------------------------------------- | --------------------------------------------------------- |
| `mobile/src/theme/designSystem.ts`    | `**lightTheme**`, `**darkTheme**`, pink tokens, gradients |
| `mobile/src/theme/palettes.ts`        | `ThemeColors` for `useThemeColors()`                      |
| `admin-web/src/theme/admin-theme.css` | Admin `--vb-*` variables                                  |


## Coolors palettes

| Mode  | Swatches |
| ----- | -------- |
| Light | `#111827` · `#00C2FF` · `#FF4D8D` · `#F4F7FB` · `#FFFFFF` |
| Dark  | `#F9FAFB` · `#33D6FF` · `#FF70A6` · `#0A0D14` · `#161B26` |

## Pink accent tokens


| Token          | Light     | Dark                     | Use                         |
| -------------- | --------- | ------------------------ | --------------------------- |
| `accent`       | `#FF4D8D` | `#FF70A6`                | Hearts, stars, icons        |
| `accentSoft`   | `#FF70A6` | `#FF9BC1`                | Softer highlights           |
| `accentLight`  | `#FFE3EE` | `#FFD1E3`                | Decorative rings            |
| `accentBg`     | `#FFF0F6` | `rgba(255,112,166,0.14)` | Badges, chips, empty states |
| `accentBorder` | `#FFB3CF` | `rgba(255,112,166,0.42)` | Outlines on pink UI         |
| `accentText`   | `#FF4D8D` | `#FF70A6`                | Pink labels (Partners, logout) |


**Primary buttons stay blue** (`primary` / `gradients.button`). Pink gradient: `gradients.pinkGradient`.

## Usage in React Native

```tsx
const colors = useThemeColors();
// Favorites
<Ionicons color={isFav ? colors.accent : colors.textMuted} />
// Badge surface
<View style={{ backgroundColor: colors.accentBg, borderColor: colors.accentBorder }}>
  <AppText color="accentText">Featured</AppText>
</View>
```

## Default mode

Light (`themeStore` → `colorScheme: 'light'`).