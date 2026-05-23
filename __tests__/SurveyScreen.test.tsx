import { fireEvent, waitFor } from "@testing-library/react-native";
import React from "react";

import { renderWithTheme } from "../test-utils";

const mockBack = jest.fn();
const mockPush = jest.fn();
const mockGet = jest.fn();

const mockQuestions = [
  {
    _id: "q1",
    questionId: 0,
    group: "energy",
    question: "Mức năng lượng của bạn lúc này như thế nào?",
    options: [
      { _id: "q1o1", label: "Kiệt sức hoàn toàn", emoji: "😵", subtext: "Rất mệt", score: 0 },
      { _id: "q1o2", label: "Khá tốt", emoji: "🙂", subtext: "Ổn định", score: 2 },
    ],
  },
  {
    _id: "q2",
    questionId: 1,
    group: "energy",
    question: "Bạn ngủ được khoảng mấy tiếng tối qua?",
    options: [
      { _id: "q2o1", label: "Dưới 4 tiếng", emoji: "🥱", subtext: "Thiếu ngủ", score: 0 },
      { _id: "q2o2", label: "Khoảng 7 tiếng", emoji: "😌", subtext: "Khá đủ", score: 2 },
    ],
  },
] as const;

jest.mock("expo-router", () => ({
  router: {
    back: (...args: any[]) => mockBack(...args),
    push: (...args: any[]) => mockPush(...args),
  },
}));

jest.mock("@/services/api-client", () => ({
  apiClient: {
    get: (...args: any[]) => mockGet(...args),
  },
}));

jest.mock("react-native-safe-area-context", () => {
  const React = require("react");
  const { View } = require("react-native");
  return {
    SafeAreaView: ({ children, ...props }: any) => (
      <View {...props}>{children}</View>
    ),
  };
});

jest.mock("@/components/ui/survey-option-card", () => ({
  SurveyOptionCard: ({ option, onPress, selected }: any) => {
    const { Pressable, Text, View } = require("react-native");
    return (
      <Pressable onPress={onPress} accessibilityState={{ selected }}>
        <View>
          <Text>{option.label}</Text>
          <Text>{option.description}</Text>
        </View>
      </Pressable>
    );
  },
}));

const SurveyScreen = require("../app/survey").default;

describe("SurveyScreen", () => {
  beforeEach(() => {
    mockBack.mockClear();
    mockPush.mockClear();
    mockGet.mockReset();
    mockGet.mockResolvedValue({
      success: true,
      data: {
        questions: mockQuestions,
      },
    });
  });

  test("renders the first question and progress", async () => {
    const { getByText } = renderWithTheme(<SurveyScreen />);

    await waitFor(() =>
      expect(getByText("Mức năng lượng của bạn lúc này như thế nào?")).toBeTruthy()
    );

    expect(mockGet).toHaveBeenCalledWith("/questions");
    expect(getByText("Câu hỏi 1 / 2")).toBeTruthy();
    expect(getByText("50%")).toBeTruthy();
  });

  test("goes back when pressing back on the first question", async () => {
    const { getByText } = renderWithTheme(<SurveyScreen />);

    await waitFor(() =>
      expect(getByText("Mức năng lượng của bạn lúc này như thế nào?")).toBeTruthy()
    );

    fireEvent.press(getByText("arrow-back"));

    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  test("moves to the next question after selecting an answer", async () => {
    const { getByText } = renderWithTheme(<SurveyScreen />);

    await waitFor(() =>
      expect(getByText("Mức năng lượng của bạn lúc này như thế nào?")).toBeTruthy()
    );

    fireEvent.press(getByText("Khá tốt"));
    fireEvent.press(getByText("Tiếp theo"));

    await waitFor(() =>
      expect(getByText("Bạn ngủ được khoảng mấy tiếng tối qua?")).toBeTruthy()
    );

    expect(getByText("Câu hỏi 2 / 2")).toBeTruthy();
    expect(getByText("100%")).toBeTruthy();
  });

  test("navigates to analystic with serialized answers on the last question", async () => {
    const { getByText } = renderWithTheme(<SurveyScreen />);

    await waitFor(() =>
      expect(getByText("Mức năng lượng của bạn lúc này như thế nào?")).toBeTruthy()
    );

    fireEvent.press(getByText("Kiệt sức hoàn toàn"));
    fireEvent.press(getByText("Tiếp theo"));

    await waitFor(() =>
      expect(getByText("Bạn ngủ được khoảng mấy tiếng tối qua?")).toBeTruthy()
    );

    fireEvent.press(getByText("Dưới 4 tiếng"));
    fireEvent.press(getByText("Tiến hành phân tích"));

    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/analystic",
      params: {
        answers: JSON.stringify({
          0: 0,
          1: 0,
        }),
        apiAnswers: JSON.stringify([
          {
            questionId: 0,
            group: "energy",
            selectedOption: 0,
            score: 0,
          },
          {
            questionId: 1,
            group: "energy",
            selectedOption: 0,
            score: 0,
          },
        ]),
        startedAt: expect.any(String),
      },
    });
  });
});
