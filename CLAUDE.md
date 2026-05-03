# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A React Native + Expo survey application (school project, HCMUT) that helps users distinguish between **real fatigue** and **procrastination/laziness**. Users answer a short survey and receive one of 6 state results: Exhausted, Tired, Lazy with deadline, Ready, Focused, Unmotivated.

## Commands

```bash
npm install           # Install dependencies (use npm, not yarn)
npx expo start        # Start dev server (press 'a' for Android, 'i' for iOS)
npm run android       # Start directly for Android
npm run ios           # Start directly for iOS
npm run web           # Start for web
npm run lint          # Run ESLint
```

Requirements: Node >= 20, Android SDK 35 (Android Studio with a running emulator).

## Architecture

**Navigation** — File-based routing via Expo Router. The `app/` directory maps to routes:
- `app/_layout.tsx` — Root layout; wraps everything in `GluestackUIProvider` and React Navigation `ThemeProvider`. Also loads fonts via `useFonts`.
- `app/(tabs)/_layout.tsx` — Bottom tab navigator
- `app/(tabs)/index.tsx` — Home screen
- New screens go in `app/` (files) or `app/(tabs)/` (tabs)

**Styling** — Two-layer system:
1. **Gluestack UI** components from `components/ui/` (locally vendored, not npm imports)
2. **NativeWind** (Tailwind CSS for React Native) for utility classes

**Color mode** — Currently **light mode**. The active mode is controlled by `MODE` in `constants/theme.ts`. To switch to dark, change `MODE = 'dark'` — one line, entire app updates. Full token values for both modes live in `COLOR_TOKENS` in that file.

**Adding Gluestack components** — Use the CLI to vendor them locally:
```bash
npx gluestack-ui add <component-name>
# e.g.: npx gluestack-ui add input
```
Then import from `@/components/ui/<component-name>`.

**Path alias** — `@/` maps to the project root (configured in `tsconfig.json` and `babel.config.js`).

**Key directories:**
- `app/` — Screens and navigation layouts (Expo Router)
- `components/ui/` — Gluestack UI + app-specific components (locally vendored)
- `components/` — Shared non-UI components and wrappers
- `hooks/` — `useColorScheme`, `useThemeColor`
- `constants/theme.ts` — Design system tokens (colors, fonts, spacing)
- `docs/design-system.md` — Full design system spec (source of truth for UI decisions)
- `assets/images/` — Onboarding images, icons, splash screen

---

## Design System

Full spec: `docs/design-system.md`. Summary below for quick reference.

### Color Tokens

**Never hardcode hex values.** Always use `AppColors` from `constants/theme.ts` for inline styles, or Tailwind classes for `className` props.

`AppColors` is a flat object derived from the active mode in `COLOR_TOKENS`. Current mode: **light**.

**Backgrounds:**
```ts
AppColors.bgApp        // screen background     #f8f9fc
AppColors.bgSurface1   // cards, panels         #ffffff
AppColors.bgSurface2   // nested surfaces       #f1f3f9
AppColors.bgSurface3   // avatars, icon boxes   #e9ecf5
```

**Border:**
```ts
AppColors.borderDefault  // dividers, card borders  #d9dce7
```

**Primary (brand color — đổi ở COLOR_TOKENS để thay toàn app):**
```ts
AppColors.primaryMain    // CTA, active, tint        #5b5cf6
AppColors.primaryDark    // pressed state             #4a47d1
AppColors.primaryLight   // icons, links              #8b8cf8
AppColors.primarySurface // tinted bg (selected card) #f0f1ff
```

**Accent:**
```ts
AppColors.accentTeal  // secondary accent  #14b8a6
```

**Text hierarchy (5 levels):**
```ts
AppColors.textPrimary    // headings, main content  #0f172a
AppColors.textSecondary  // body, descriptions      #334155
AppColors.textMuted      // icons, subtle labels    #64748b
AppColors.textDisabled   // inactive tabs, hints    #94a3b8
AppColors.textGhost      // least important         #cbd5e1
```

**State colors** (6 survey results) — for inline styles use `AppColors.state*Text`; for Tailwind className use `text-state-*` / `bg-state-*`:
```ts
AppColors.stateExhaustedText   // #dc2626  red
AppColors.stateTiredText       // #f97316  orange
AppColors.stateLazyText        // #eab308  yellow
AppColors.stateReadyText       // #059669  green
AppColors.stateFocusedText     // #2563eb  blue
AppColors.stateUnmotivatedText // #7c3aed  purple
```

Full bg/border/text per state: use `STATE_COLOR_MAP[stateKey]` from `constants/theme.ts`.

### Typography

Fonts loaded in `app/_layout.tsx` via `useFonts`. Use these Tailwind classes:

| Class | Weight | Design system usage |
|-------|--------|-------------------|
| `font-jakarta` | 400 | Body, descriptions |
| `font-jakarta-medium` | 500 | Emphasized body |
| `font-jakarta-semibold` | 600 | H3, Caption, card titles |
| `font-jakarta-bold` | 700 | H1, H2, CTA buttons |
| `font-jakarta-extrabold` | 800 | Display (app title) |
| `font-dm-mono` | 400 | Scores, numbers, timestamps |
| `font-dm-mono-medium` | 500 | Bold scores/numbers |

Font sizes:
```
text-2xs (10px) — Caption / badge text
text-xs  (12px) — Body Small (11px ~ xs)
text-sm  (14px) — CTA buttons
text-base(16px) — Body (13px ~ sm/base)
text-lg  (18px) — H2
text-xl  (20px) — between H2 and H1
text-2xl (22px) — H1
text-4xl (28px) — Display
```

Caption style: `text-2xs font-jakarta-semibold tracking-caption uppercase`

### Spacing

8pt grid — only use multiples of 4px. Tailwind scale maps directly: `p-1`=4px, `p-2`=8px, `p-3`=12px, `p-4`=16px, `p-5`=20px, `p-6`=24px, `p-8`=32px.

### App-specific Components

Located in `components/ui/`. Import example: `import { StateBadge } from '@/components/ui/state-badge'`

| Component | Props | Usage |
|-----------|-------|-------|
| `StateBadge` | `state: StateKey` | Displays a colored result badge |
| `OptionCard` | `label`, `description?`, `isSelected`, `onPress` | Survey answer option with radio indicator |
| `ProgressBar` | `current`, `total`, `showLabel?` | Survey progress indicator |

`StateKey` values: `'exhausted' \| 'tired' \| 'lazy' \| 'ready' \| 'focused' \| 'unmotivated'`

### Font sizes (responsive)

For inline `style` props, use the `scale()` function (defined per-screen based on `Dimensions.get('window').width / 390`) instead of raw pixel values. Tailwind `text-*` classes are preferred for `className` props.

### Icons

Use **Phosphor Icons** only (`@expo/vector-icons` or `phosphor-react-native`). Style: Regular, stroke 1.5px.
Icon colors: inactive = `AppColors.textDisabled`, active = `AppColors.primaryMain`.

---

## Coding Rules

- **One component per file** — mỗi file chỉ chứa 1 component. Nếu cần tách sub-component, tạo file riêng trong cùng thư mục (e.g. `components/ui/custom-tab-bar/index.tsx`). Không định nghĩa nhiều component trong cùng 1 file dù chúng nhỏ.
- **No hardcoded colors** — always use `AppColors.xxx` (inline styles) or Tailwind token classes (`className`). Never use hex strings directly.
- **No hardcoded font sizes** — use `scale(n)` for inline styles, or Tailwind `text-*` classes.
- **No arbitrary spacing** — only values in the 8pt spacing scale.
- **Tailwind for styling** — use `className` prop; avoid `StyleSheet.create` for new code.
- **App-specific components first** — use `StateBadge`, `OptionCard`, `ProgressBar` before building new ones.
- **Gluestack for primitives** — `Button`, `Text`, `Heading` from `@/components/ui/`.
- **Light mode current** — `GluestackUIProvider mode="dark"` stays in root layout (Gluestack internal), but app colors come from `AppColors` with `MODE = 'light'` in `constants/theme.ts`.
- **Adding a new color** — add it to both `light` and `dark` in `COLOR_TOKENS`, then expose via `AppColors`. Never add a one-off hex anywhere else.
