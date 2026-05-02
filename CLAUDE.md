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

Dark/light mode is handled automatically via `useColorScheme()` hook and CSS custom properties defined in `components/ui/gluestack-ui-provider/config.ts`.

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

Never hardcode hex values. Use Tailwind classes or `AppColors` from `constants/theme.ts`.

**Background layers** (dark UI, deepest to shallowest):
```
bg-surface-base   → #0E0E16  screen background
bg-surface-1      → #111118  cards, panels
bg-surface-2      → #13131E  nested cards
bg-surface-3      → #1A1A2E  modals, dropdowns
border-border-default → #252535  dividers
```

**Accent:**
```
bg-accent-purple        → #6C47FF  primary CTA, active state
bg-accent-purple-dark   → #4A2ECC  pressed state
bg-accent-purple-light  → #9C76FF  icons, links
bg-accent-purple-surface → dark purple tint (for selected card bg)
bg-accent-teal          → #3ECFCF  secondary accent
```

**State colors** (6 survey results):
```
text-state-exhausted   / bg-state-exhausted   → #EF5350  red
text-state-tired       / bg-state-tired       → #FFA726  orange
text-state-lazy        / bg-state-lazy        → #FFD600  yellow
text-state-ready       / bg-state-ready       → #06D6A0  green
text-state-focused     / bg-state-focused     → #29B6F6  blue
text-state-unmotivated / bg-state-unmotivated → #9C76FF  purple
```

**Text hierarchy** (5 levels):
```
text-apptext-primary    → #F0F0FF  headings, main content
text-apptext-secondary  → #D0D0E8  descriptions, body
text-apptext-muted      → #888899  placeholders, hints
text-apptext-disabled   → #555570  disabled state
text-apptext-ghost      → #444460  least important
```

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

### Icons

Use **Phosphor Icons** only (`@expo/vector-icons` or `phosphor-react-native`). Style: Regular, stroke 1.5px.
Icon colors: inactive = `#555570`, active = `#6C47FF`, on dark bg = `#F0F0FF`.

---

## Coding Rules

- **No hardcoded colors** — always use Tailwind tokens or `AppColors` from `constants/theme.ts`
- **No arbitrary spacing** — only values in the 8pt spacing scale
- **Tailwind for styling** — use `className` prop; avoid `StyleSheet.create` for new code
- **App-specific components first** — use `StateBadge`, `OptionCard`, `ProgressBar` before building new ones
- **Gluestack for primitives** — `Button`, `Text`, `Heading` from `@/components/ui/`
- **Dark mode default** — the app is dark-first; `GluestackUIProvider mode="dark"` is set in root layout
