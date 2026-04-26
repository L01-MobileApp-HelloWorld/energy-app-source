// Mock expo-router Redirect
jest.mock("expo-router", () => ({
  Redirect: ({ href }: { href: string }) => null,
}));

// Mock IconSymbol component
jest.mock("@/components/ui/icon-symbol", () => ({
  IconSymbol: () => null,
}));

import { render } from "@testing-library/react-native";
import React from "react";
import HomeScreen from "../app/(tabs)/index";

describe("HomeScreen", () => {
  test("render without crash", () => {
    render(<HomeScreen />);
  });

  test("render welcome text", () => {
    const { getByText } = render(<HomeScreen />);
    expect(getByText("Chào Huy! 👋")).toBeTruthy();
  });

  test("render start button", () => {
    const { getByText } = render(<HomeScreen />);
    expect(getByText("Bắt đầu kiểm tra")).toBeTruthy();
  });
});
