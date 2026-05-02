import { Platform } from 'react-native';

/**
 * Design System tokens cho BanHayLuoi app.
 *
 * Dùng file này khi cần giá trị hex/number trong TypeScript (StyleSheet, Animated, etc.).
 * Khi viết Tailwind classes, dùng trực tiếp tên token (vd: bg-accent-purple, text-apptext-primary).
 */

// ─── Legacy Colors (dùng bởi ThemedText, ThemedView, useThemeColor) ───────────
// Giữ lại cấu trúc light/dark để không break các file cũ.

export const Colors = {
  light: {
    text: '#11181C',
    background: '#F5F5FA',
    tint: '#6C47FF',
    icon: '#555570',
    tabIconDefault: '#555570',
    tabIconSelected: '#6C47FF',
  },
  dark: {
    text: '#F0F0FF',
    background: '#0E0E16',
    tint: '#6C47FF',
    icon: '#888899',
    tabIconDefault: '#888899',
    tabIconSelected: '#6C47FF',
  },
};

// ─── Legacy Fonts (dùng bởi explore.tsx) ─────────────────────────────────────

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  },
});

// ─── App Color Tokens ─────────────────────────────────────────────────────────

export const AppColors = {
  // Accent (màu thương hiệu)
  accentPurple: '#6C47FF',
  accentPurpleDark: '#4A2ECC',
  accentPurpleLight: '#9C76FF',
  accentPurpleSurface: '#1A1A40',
  accentTeal: '#3ECFCF',

  // Background layers (dark mode — giao diện chính)
  bgBase: '#0E0E16',
  bgSurface1: '#111118',
  bgSurface2: '#13131E',
  bgSurface3: '#1A1A2E',
  borderDefault: '#252535',
  bgLight: '#F5F5FA',

  // State colors (6 kết quả khảo sát)
  stateExhausted: '#EF5350',
  stateTired: '#FFA726',
  stateLazy: '#FFD600',
  stateReady: '#06D6A0',
  stateFocused: '#29B6F6',
  stateUnmotivated: '#9C76FF',

  // Text (dark mode)
  textPrimary: '#F0F0FF',
  textSecondary: '#D0D0E8',
  textMuted: '#888899',
  textDisabled: '#555570',
  textGhost: '#444460',
} as const;

export type StateKey = keyof typeof STATE_COLOR_MAP;

export const STATE_COLOR_MAP = {
  exhausted: AppColors.stateExhausted,
  tired: AppColors.stateTired,
  lazy: AppColors.stateLazy,
  ready: AppColors.stateReady,
  focused: AppColors.stateFocused,
  unmotivated: AppColors.stateUnmotivated,
} as const;

// ─── Typography ───────────────────────────────────────────────────────────────

export const FontFamily = {
  sans: 'PlusJakartaSans_400Regular',
  sansMedium: 'PlusJakartaSans_500Medium',
  sansSemiBold: 'PlusJakartaSans_600SemiBold',
  sansBold: 'PlusJakartaSans_700Bold',
  sansExtraBold: 'PlusJakartaSans_800ExtraBold',
  mono: 'DMMono_400Regular',
  monoMedium: 'DMMono_500Medium',
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
  display: '800' as const,
  h1: '700' as const,
  h2: '700' as const,
  h3: '600' as const,
  body: '400' as const,
  bodySmall: '400' as const,
  caption: '600' as const,
  cta: '700' as const,
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
  '2xl': 32,
} as const;

// ─── Border Radius ────────────────────────────────────────────────────────────

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
} as const;
