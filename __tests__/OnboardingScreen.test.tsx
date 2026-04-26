import { fireEvent, render } from "@testing-library/react-native";
import React from "react";
import OnboardingScreen from "../app/onboarding";

// mock expo-router
jest.mock("expo-router", () => ({
  router: {
    replace: jest.fn(),
  },
}));

describe("OnboardingScreen", () => {
  test("render first slide text", () => {
    const { getByText } = render(<OnboardingScreen />);
    expect(getByText("Mệt thật hay lười thật")).toBeTruthy();
  });

  test("skip button works", () => {
    const { getByText } = render(<OnboardingScreen />);
    fireEvent.press(getByText("Bỏ qua"));
  });

  test("next button exists", () => {
    const { getByText } = render(<OnboardingScreen />);
    expect(getByText(/Tiếp theo/)).toBeTruthy();
  });
});
