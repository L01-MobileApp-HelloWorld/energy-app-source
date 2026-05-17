import AsyncStorage from "@react-native-async-storage/async-storage";
import { act, fireEvent, waitFor } from "@testing-library/react-native";
import React from "react";
import { Switch } from "react-native";

import { renderWithTheme } from "../test-utils";

const mockLogout = jest.fn();
const mockUpdateProfile = jest.fn(() => Promise.resolve());
const mockUseAuth = jest.fn(() => ({
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
});
