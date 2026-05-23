import AsyncStorage from "@react-native-async-storage/async-storage";
import { act, fireEvent, waitFor } from "@testing-library/react-native";
import React from "react";
import { Switch } from "react-native";

import { renderWithTheme } from "../test-utils";

const mockLogout = jest.fn();
const mockUpdateProfile = jest.fn(() => Promise.resolve());
const mockUseAuth = jest.fn<{ user: any; logout: jest.Mock; updateProfile: jest.Mock }, []>(() => ({
  user: null,
  logout: mockLogout,
  updateProfile: mockUpdateProfile,
}));

jest.mock("react-native-safe-area-context", () => {
  const React = require("react");
  const { View } = require("react-native");
  return {
    SafeAreaView: ({ children, ...props }: any) => <View {...props}>{children}</View>,
  };
});

jest.mock("expo-router", () => ({
  router: { push: jest.fn(), replace: jest.fn() },
}));

jest.mock("@/hooks/auth-context", () => ({
  useAuth: () => mockUseAuth(),
}));

const SettingsScreen = require("../app/(tabs)/settings").default;

describe("SettingsScreen", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    mockLogout.mockReset();
    mockUpdateProfile.mockClear();
    mockUseAuth.mockReturnValue({
      user: null,
      logout: mockLogout,
      updateProfile: mockUpdateProfile,
    });
  });

  test("renders settings heading", () => {
    const { getByText } = renderWithTheme(<SettingsScreen />);
    expect(getByText("Cài đặt")).toBeTruthy();
  });

  test("switch reflects user darkMode and updates globally", async () => {
    mockUseAuth.mockReturnValue({
      user: {
        _id: "user-1",
        username: "tester",
        email: "tester@example.com",
        preferences: {
          darkMode: true,
        },
      },
      logout: mockLogout,
      updateProfile: mockUpdateProfile,
    });
    await AsyncStorage.setItem("app-theme-preference", "light");

    let screen = renderWithTheme(<SettingsScreen />);
    let { UNSAFE_getByType } = screen;
    await waitFor(() => expect(UNSAFE_getByType(Switch).props.value).toBe(true));

    await act(async () => {
      fireEvent(UNSAFE_getByType(Switch), "valueChange", false);
    });

    mockUseAuth.mockReturnValue({
      user: {
        _id: "user-1",
        username: "tester",
        email: "tester@example.com",
        preferences: {
          darkMode: false,
        },
      },
      logout: mockLogout,
      updateProfile: mockUpdateProfile,
    });
    screen.unmount();
    screen = renderWithTheme(<SettingsScreen />);
    ({ UNSAFE_getByType } = screen);

    expect(UNSAFE_getByType(Switch).props.value).toBe(false);
    await expect(AsyncStorage.getItem("app-theme-preference")).resolves.toBe("light");
    expect(mockUpdateProfile).toHaveBeenCalledWith({
      preferences: {
        darkMode: false,
      },
    });
  });

  test("reopening the screen reads the persisted preference instead of resetting local state", async () => {
    let screen = renderWithTheme(<SettingsScreen />);

    await act(async () => {
      fireEvent(screen.UNSAFE_getByType(Switch), "valueChange", true);
    });

    screen.unmount();
    screen = renderWithTheme(<SettingsScreen />);

    await waitFor(() => expect(screen.UNSAFE_getByType(Switch).props.value).toBe(true));
  });

  test("shows user info when user is logged in", () => {
    mockUseAuth.mockReturnValue({
      user: {
        _id: "user-1",
        username: "tester",
        email: "tester@example.com",
        displayName: "Tester Name",
        preferences: { darkMode: false },
      },
      logout: mockLogout,
      updateProfile: mockUpdateProfile,
    });
    const { getByText } = renderWithTheme(<SettingsScreen />);
    expect(getByText("Tester Name")).toBeTruthy();
    expect(getByText("tester@example.com")).toBeTruthy();
  });

  test("pressing Đổi mật khẩu navigates to change-password", () => {
    const { router } = require("expo-router");
    const { getByText } = renderWithTheme(<SettingsScreen />);
    fireEvent.press(getByText("Đổi mật khẩu"));
    expect(router.push).toHaveBeenCalledWith("/change-password");
  });

  test("pressing Đăng xuất shows confirmation Alert", () => {
    const { Alert } = require("react-native");
    jest.spyOn(Alert, "alert");
    const { getByText } = renderWithTheme(<SettingsScreen />);
    fireEvent.press(getByText("Đăng xuất"));
    expect(Alert.alert).toHaveBeenCalledWith(
      "Đăng xuất",
      "Bạn có chắc chắn muốn đăng xuất?",
      expect.any(Array),
    );
  });

  test("confirming logout calls logout and navigates to /login", async () => {
    const { Alert } = require("react-native");
    const { router } = require("expo-router");
    mockLogout.mockResolvedValueOnce(undefined);

    let alertButtons: any[] = [];
    jest.spyOn(Alert, "alert").mockImplementation((_title, _msg, buttons: any) => {
      alertButtons = buttons ?? [];
    });

    const { getByText } = renderWithTheme(<SettingsScreen />);
    fireEvent.press(getByText("Đăng xuất"));

    const confirmBtn = alertButtons.find((b: any) => b.text === "Đăng xuất");
    await act(async () => {
      await confirmBtn?.onPress?.();
    });

    expect(mockLogout).toHaveBeenCalled();
    expect(router.replace).toHaveBeenCalledWith("/login");
  });

  test("logout failure resets loggingOut without crash", async () => {
    const { Alert } = require("react-native");
    mockLogout.mockRejectedValueOnce(new Error("network"));

    let alertButtons: any[] = [];
    jest.spyOn(Alert, "alert").mockImplementation((_title, _msg, buttons: any) => {
      alertButtons = buttons ?? [];
    });

    const { getByText } = renderWithTheme(<SettingsScreen />);
    fireEvent.press(getByText("Đăng xuất"));

    const confirmBtn = alertButtons.find((b: any) => b.text === "Đăng xuất");
    await act(async () => {
      await confirmBtn?.onPress?.();
    });

    expect(getByText("Đăng xuất")).toBeTruthy();
  });
});
