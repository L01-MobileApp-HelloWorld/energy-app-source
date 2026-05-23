import { fireEvent, render } from "@testing-library/react-native";
import React from "react";

import { EntryCard } from "@/components/ui/entry-card";
import { mockColors } from "../test-helpers";

jest.mock("expo-router", () => ({
  router: {
    push: jest.fn(),
  },
}));

jest.mock("@/components/ui/rating-pill", () => ({
  RatingPill: ({ rating }: any) => {
    const { Text } = require("react-native");
    return <Text>{`${rating.toFixed(1)}/5`}</Text>;
  },
}));

jest.mock("@/components/ui/state-badge", () => ({
  StateBadge: ({ state }: any) => {
    const { Text } = require("react-native");
    return <Text>{state}</Text>;
  },
}));

describe("EntryCard", () => {
  beforeEach(() => {
    require("expo-router").router.push.mockClear();
  });

  test("renders entry content", () => {
    const screen = render(
      <EntryCard
        colors={mockColors}
        entry={{
          id: "history-1",
          createdAt: "2026-05-23T10:00:00.000Z",
          time: "10:00",
          title: "Bạn đang kiệt sức",
          states: ["exhausted", "tired"],
          rating: 1.5,
          resultData: {
            stateKey: "exhausted",
            overall: 1.5,
            categoryScores: [1, 2, 3, 4],
          },
          surveyAnswers: {},
        }}
      />
    );

    expect(screen.getByText("10:00")).toBeTruthy();
    expect(screen.getByText("Bạn đang kiệt sức")).toBeTruthy();
    expect(screen.getByText("1.5/5")).toBeTruthy();
    expect(screen.getByText("exhausted")).toBeTruthy();
    expect(screen.getByText("tired")).toBeTruthy();
  });

  test("press navigates to history result", () => {
    const screen = render(
      <EntryCard
        colors={mockColors}
        entry={{
          id: "history-9",
          createdAt: "2026-05-23T10:00:00.000Z",
          time: "10:00",
          title: "Tập trung",
          states: ["focused"],
          rating: 4.5,
          resultData: {
            stateKey: "focused",
            overall: 4.5,
            categoryScores: [4, 4, 4, 4],
          },
          surveyAnswers: {},
        }}
      />
    );

    fireEvent.press(screen.getByText("Tập trung"));

    expect(require("expo-router").router.push).toHaveBeenCalledWith({
      pathname: "/result",
      params: {
        historyId: "history-9",
        fromHistory: "1",
      },
    });
  });
});
