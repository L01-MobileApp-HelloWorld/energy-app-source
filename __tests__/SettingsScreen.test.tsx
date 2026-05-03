import AsyncStorage from "@react-native-async-storage/async-storage";
import { act, fireEvent, waitFor } from "@testing-library/react-native";
import React from "react";
import { Switch } from "react-native";

import { renderWithTheme } from "../test-utils";

jest.mock("react-native-safe-area-context", () => {
  const React = require("react");
  const { View } = require("react-native");
  return {
    SafeAreaView: ({ children, ...props }: any) => <View {...props}>{children}</View>,
  };
});

const SettingsScreen = require("../app/(tabs)/settings").default;

describe("SettingsScreen", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  test("renders settings heading", () => {
    const { getByText } = renderWithTheme(<SettingsScreen />);
    expect(getByText("Cài đặt")).toBeTruthy();
  });

  test("switch reflects the persisted dark theme and updates globally", async () => {
    await AsyncStorage.setItem("app-theme-preference", "dark");

    const { UNSAFE_getByType } = renderWithTheme(<SettingsScreen />);
    await waitFor(() => expect(UNSAFE_getByType(Switch).props.value).toBe(true));

    await act(async () => {
      fireEvent(UNSAFE_getByType(Switch), "valueChange", false);
    });

    expect(UNSAFE_getByType(Switch).props.value).toBe(false);
    await expect(AsyncStorage.getItem("app-theme-preference")).resolves.toBe("light");
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
