import { fireEvent, render } from "@testing-library/react-native";
import React from "react";

import { SurveyOptionCard } from "@/components/ui/survey-option-card";
import { mockColors } from "../test-helpers";

jest.mock("@/hooks/use-app-theme", () => ({
  useAppColors: () => mockColors,
}));

jest.mock("@/components/ui/radio-button", () => ({
  RadioButton: ({ selected }: any) => {
    const { Text } = require("react-native");
    return <Text>{selected ? "selected" : "unselected"}</Text>;
  },
}));

describe("SurveyOptionCard", () => {
  test("renders option content", () => {
    const screen = render(
      <SurveyOptionCard
        selected={false}
        onPress={jest.fn()}
        option={{
          emoji: "🙂",
          label: "Khá tốt",
          description: "Ổn định",
        }}
      />
    );

    expect(screen.getByText("🙂")).toBeTruthy();
    expect(screen.getByText("Khá tốt")).toBeTruthy();
    expect(screen.getByText("Ổn định")).toBeTruthy();
    expect(screen.getByText("unselected")).toBeTruthy();
  });

  test("press calls onPress", () => {
    const onPress = jest.fn();
    const screen = render(
      <SurveyOptionCard
        selected={false}
        onPress={onPress}
        option={{
          emoji: "🙂",
          label: "Khá tốt",
          description: "Ổn định",
        }}
      />
    );

    fireEvent.press(screen.getByText("Khá tốt"));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  test("selected state is passed to radio button", () => {
    const screen = render(
      <SurveyOptionCard
        selected
        onPress={jest.fn()}
        option={{
          emoji: "🙂",
          label: "Khá tốt",
          description: "Ổn định",
        }}
      />
    );

    expect(screen.getByText("selected")).toBeTruthy();
  });
});
