import AsyncStorage from "@react-native-async-storage/async-storage";
import { act, fireEvent, render, waitFor } from "@testing-library/react-native";
import React from "react";
import { Pressable, Text } from "react-native";

import { ThemePreferencesProvider, useAppTheme } from "@/hooks/use-app-theme";
import * as colorSchemeHook from "@/hooks/use-color-scheme";

function ThemeProbe() {
  const { themePreference, resolvedTheme, setThemePreference, isHydrated } = useAppTheme();

  return (
    <>
      <Text>{`preference:${themePreference}`}</Text>
      <Text>{`resolved:${resolvedTheme}`}</Text>
      <Text>{`hydrated:${String(isHydrated)}`}</Text>
      <Pressable onPress={() => void setThemePreference("dark")}>
        <Text>set-dark</Text>
      </Pressable>
      <Pressable onPress={() => void setThemePreference("light")}>
        <Text>set-light</Text>
      </Pressable>
    </>
  );
}

describe("ThemePreferencesProvider", () => {
  beforeEach(async () => {
    jest.spyOn(colorSchemeHook, "useColorScheme").mockReturnValue("light");
    await AsyncStorage.clear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("uses system theme when there is no saved preference", async () => {
    const { getByText } = render(
      <ThemePreferencesProvider>
        <ThemeProbe />
      </ThemePreferencesProvider>
    );

    await waitFor(() => expect(getByText("hydrated:true")).toBeTruthy());
    expect(getByText("preference:system")).toBeTruthy();
    expect(getByText("resolved:light")).toBeTruthy();
  });

  test("hydrates a saved dark preference", async () => {
    await AsyncStorage.setItem("app-theme-preference", "dark");

    const { getByText } = render(
      <ThemePreferencesProvider>
        <ThemeProbe />
      </ThemePreferencesProvider>
    );

    await waitFor(() => expect(getByText("preference:dark")).toBeTruthy());
    expect(getByText("resolved:dark")).toBeTruthy();
  });

  test("hydrates a saved light preference", async () => {
    await AsyncStorage.setItem("app-theme-preference", "light");

    const { getByText } = render(
      <ThemePreferencesProvider>
        <ThemeProbe />
      </ThemePreferencesProvider>
    );

    await waitFor(() => expect(getByText("preference:light")).toBeTruthy());
    expect(getByText("resolved:light")).toBeTruthy();
  });

  test("setter updates state and persists the new preference", async () => {
    const { getByText } = render(
      <ThemePreferencesProvider>
        <ThemeProbe />
      </ThemePreferencesProvider>
    );

    await waitFor(() => expect(getByText("hydrated:true")).toBeTruthy());

    await act(async () => {
      fireEvent.press(getByText("set-dark"));
    });

    expect(getByText("preference:dark")).toBeTruthy();
    expect(getByText("resolved:dark")).toBeTruthy();
    await expect(AsyncStorage.getItem("app-theme-preference")).resolves.toBe("dark");
  });
});
