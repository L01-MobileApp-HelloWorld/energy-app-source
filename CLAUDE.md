# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A React Native + Expo survey application (school project, HCMUT) that helps users distinguish between **real fatigue** and **procrastination/laziness**.

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
- `app/_layout.tsx` — Root layout; wraps everything in `GluestackUIProvider` and React Navigation `ThemeProvider`
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
- `components/ui/` — Gluestack UI components (locally vendored)
- `components/` — Shared non-UI components and wrappers
- `hooks/` — `useColorScheme`, `useThemeColor`
- `constants/theme.ts` — Color and font constants
- `assets/images/` — Onboarding images, icons, splash screen
