import { Platform } from "react-native";

export type AppTheme = "light" | "dark";

// ─── Design System Color Tokens ───────────────────────────────────────────────

export const COLOR_TOKENS = {
  light: {
    bg: {
      app: "#f8f9fc",
      surface1: "#ffffff",
      surface2: "#f1f3f9",
      surface3: "#e9ecf5",
    },
    border: { default: "#d9dce7" },
    primary: {
      main: "#5b5cf6",
      dark: "#4a47d1",
      light: "#8b8cf8",
      surface: "#f0f1ff",
    },
    accent: { teal: "#14b8a6" },
    text: {
      primary: "#0f172a",
      secondary: "#334155",
      muted: "#64748b",
      disabled: "#94a3b8",
      ghost: "#cbd5e1",
    },
    state: {
      exhausted: { bg: "#dc262614", border: "#dc26264d", text: "#dc2626" },
      tired: { bg: "#f9731614", border: "#f973164d", text: "#f97316" },
      lazy: { bg: "#eab30814", border: "#eab30833", text: "#eab308" },
      ready: { bg: "#05966914", border: "#05966940", text: "#059669" },
      focused: { bg: "#2563eb14", border: "#2563eb40", text: "#2563eb" },
      unmotivated: { bg: "#7c3aed14", border: "#7c3aed40", text: "#7c3aed" },
    },
  },
  dark: {
    bg: {
      app: "#0e0e16",
      surface1: "#111118",
      surface2: "#13131e",
      surface3: "#1a1a2e",
    },
    border: { default: "#252535" },
    primary: {
      main: "#6c47ff",
      dark: "#4a2ecc",
      light: "#9c76ff",
      surface: "#1a1a40",
    },
    accent: { teal: "#3ecfcf" },
    text: {
      primary: "#c6c6c9",
      secondary: "#d0d0e8",
      muted: "#888899",
      disabled: "#555570",
      ghost: "#444460",
    },
    state: {
      exhausted: { bg: "#ef535014", border: "#ef53504d", text: "#ef5350" },
      tired: { bg: "#ffa72614", border: "#ffa7264d", text: "#ffa726" },
      lazy: { bg: "#ffd60014", border: "#ffd60033", text: "#ffd600" },
      ready: { bg: "#06d6a014", border: "#06d6a040", text: "#06d6a0" },
      focused: { bg: "#29b6f614", border: "#29b6f640", text: "#29b6f6" },
      unmotivated: { bg: "#9c76ff14", border: "#9c76ff40", text: "#9c76ff" },
    },
  },
} as const;

export function getAppColors(theme: AppTheme) {
  const C = COLOR_TOKENS[theme];

  return {
    bgApp: C.bg.app,
    bgSurface1: C.bg.surface1,
    bgSurface2: C.bg.surface2,
    bgSurface3: C.bg.surface3,
    borderDefault: C.border.default,
    primaryMain: C.primary.main,
    primaryDark: C.primary.dark,
    primaryLight: C.primary.light,
    primarySurface: C.primary.surface,
    accentTeal: C.accent.teal,
    textPrimary: C.text.primary,
    textSecondary: C.text.secondary,
    textMuted: C.text.muted,
    textDisabled: C.text.disabled,
    textGhost: C.text.ghost,
    stateExhaustedText: C.state.exhausted.text,
    stateTiredText: C.state.tired.text,
    stateLazyText: C.state.lazy.text,
    stateReadyText: C.state.ready.text,
    stateFocusedText: C.state.focused.text,
    stateUnmotivatedText: C.state.unmotivated.text,
    black: "#000000",
  } as const;
}

export type AppColorsType = ReturnType<typeof getAppColors>;

// ─── Legacy: Colors (used by ThemedText / useThemeColor) ─────────────────────
export const Colors = {
  light: {
    text: COLOR_TOKENS.light.text.primary,
    background: COLOR_TOKENS.light.bg.app,
    tint: COLOR_TOKENS.light.primary.main,
    icon: COLOR_TOKENS.light.text.muted,
    tabIconDefault: COLOR_TOKENS.light.text.disabled,
    tabIconSelected: COLOR_TOKENS.light.primary.main,
  },
  dark: {
    text: COLOR_TOKENS.dark.text.primary,
    background: COLOR_TOKENS.dark.bg.app,
    tint: COLOR_TOKENS.dark.primary.main,
    icon: COLOR_TOKENS.dark.text.muted,
    tabIconDefault: COLOR_TOKENS.dark.text.disabled,
    tabIconSelected: COLOR_TOKENS.dark.primary.main,
  },
} as const;

// ─── State color map (dùng cho logic TS, không phải Tailwind) ────────────────
export type StateKey =
  | "exhausted"
  | "tired"
  | "lazy"
  | "ready"
  | "focused"
  | "unmotivated";

export function getStateColorMap(
  theme: AppTheme,
): Record<StateKey, { bg: string; border: string; text: string }> {
  return COLOR_TOKENS[theme].state;
}

// ─── Legacy Fonts ─────────────────────────────────────────────────────────────
export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  },
});

// ─── Typography ───────────────────────────────────────────────────────────────
export const FontFamily = {
  sans: "PlusJakartaSans_400Regular",
  sansMedium: "PlusJakartaSans_500Medium",
  sansSemiBold: "PlusJakartaSans_600SemiBold",
  sansBold: "PlusJakartaSans_700Bold",
  sansExtraBold: "PlusJakartaSans_800ExtraBold",
  mono: "DMMono_400Regular",
  monoMedium: "DMMono_500Medium",
} as const;

export const FontSize = {
  display: 28,
  h1: 22,
  h2: 18,
  h3: 15,
  body: 13,
  bodySmall: 11,
  caption: 10,
  cta: 14,
} as const;

export const FontWeight = {
  display: "800" as const,
  h1: "700" as const,
  h2: "700" as const,
  h3: "600" as const,
  body: "400" as const,
  bodySmall: "400" as const,
  caption: "600" as const,
  cta: "700" as const,
};

export const LineHeight = {
  display: 28 * 1.2,
  h1: 22 * 1.3,
  h2: 18 * 1.35,
  h3: 15 * 1.4,
  body: 13 * 1.55,
  bodySmall: 11 * 1.5,
  caption: 10 * 1.4,
  cta: 14 * 1.2,
} as const;

// ─── Spacing (8pt grid) ───────────────────────────────────────────────────────
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  "2xl": 32,
} as const;

// ─── Border Radius ────────────────────────────────────────────────────────────
export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
} as const;
