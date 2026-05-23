/**
 * Shared StyleSheet factories for auth/form screens
 * (login, register, change-password).
 *
 * Import: import { createAuthBaseStyles } from '@/constants/auth-form-styles';
 */

import { Dimensions } from "react-native";

import { AppColorsType, FontFamily } from "./theme";

const { width } = Dimensions.get("window");
export const scaleAuth = (size: number) => (width / 390) * size;

/** Styles shared by every auth-form screen. */
export const createAuthBaseStyles = (colors: AppColorsType) => ({
  screen: {
    flex: 1,
    backgroundColor: colors.bgApp,
  } as const,

  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    gap: 20,
  } as const,

  card: {
    backgroundColor: colors.bgSurface1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    padding: 20,
    gap: 16,
  } as const,

  fieldGroup: {
    gap: 6,
  } as const,

  label: {
    fontFamily: FontFamily.sansSemiBold,
    fontSize: scaleAuth(13),
    color: colors.textSecondary,
  } as const,

  input: {
    backgroundColor: colors.bgSurface2,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: FontFamily.sans,
    fontSize: scaleAuth(15),
    color: colors.textPrimary,
  } as const,

  inputFocused: {
    borderColor: colors.primaryMain,
    backgroundColor: colors.bgSurface1,
  } as const,

  submitBtn: {
    height: 52,
    backgroundColor: colors.primaryMain,
    borderRadius: 8,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },

  submitBtnDisabled: {
    opacity: 0.45,
  } as const,

  submitBtnText: {
    fontFamily: FontFamily.sansBold,
    fontSize: scaleAuth(15),
  } as const,
});
