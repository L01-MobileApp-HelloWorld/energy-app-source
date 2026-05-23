import { act, fireEvent, waitFor } from "@testing-library/react-native";
import React from "react";

import { renderWithTheme } from "../test-utils";
import { MockSafeAreaView, mockRouter } from "../test-helpers";

const mockGet = jest.fn();
let mockParams: { answersJson?: string; questionsJson?: string } = {};

jest.mock("expo-router", () => ({
  router: mockRouter,
  useLocalSearchParams: () => mockParams,
}));

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: MockSafeAreaView,
}));

jest.mock("@/services/api-client", () => ({
  apiClient: {
    get: (...args: any[]) => mockGet(...args),
  },
}));

const SurveyReviewScreen = require("../app/survey-review").default;

describe("SurveyReviewScreen", () => {
  beforeEach(() => {
    mockGet.mockReset();
    mockRouter.back.mockClear();
    mockParams = {};
    jest.spyOn(console, "warn").mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const questions = [
    {
      _id: "q1",
      questionId: 0,
      group: "energy",
      question: "Câu hỏi 1",
      hint: "Gợi ý 1",
      options: [
        { emoji: "🙂", label: "A", subtext: "AA", score: 0 },
        { emoji: "😴", label: "B", subtext: "BB", score: 1 },
      ],
    },
  ];

  test("loads from questionsJson without calling api", async () => {
    mockParams = {
      answersJson: JSON.stringify({ 0: 0 }),
      questionsJson: JSON.stringify(questions),
    };
    const screen = renderWithTheme(<SurveyReviewScreen />);

    await waitFor(() => expect(screen.getByText(/Câu hỏi 1/)).toBeTruthy());
    expect(mockGet).not.toHaveBeenCalled();
    expect(screen.getByText("Gợi ý 1")).toBeTruthy();
  });

  test("loads questions by answer ids", async () => {
    mockParams = {
      answersJson: JSON.stringify({ 2: 1, 0: 0 }),
    };
    mockGet.mockResolvedValue({
      success: true,
      data: { questions },
    });
    const screen = renderWithTheme(<SurveyReviewScreen />);

    await waitFor(() => expect(screen.getByText(/Câu hỏi 1/)).toBeTruthy());
    expect(mockGet).toHaveBeenCalledWith("/questions", {
      query: { questionId: "0,2" },
    });
  });

  test("invalid answers json falls back to empty state", async () => {
    mockParams = { answersJson: "not-json" };
    const screen = renderWithTheme(<SurveyReviewScreen />);

    await waitFor(() => expect(screen.getByText("Không có câu trả lời để hiển thị")).toBeTruthy());
  });

  test("invalid questions json shows error", async () => {
    mockParams = {
      answersJson: JSON.stringify({ 0: 0 }),
      questionsJson: "not-json",
    };
    const screen = renderWithTheme(<SurveyReviewScreen />);

    await waitFor(() => expect(screen.getByText("Không thể tải câu hỏi khảo sát.")).toBeTruthy());
  });

  test("normalizes selected option in 1-based input", async () => {
    mockParams = {
      answersJson: JSON.stringify({ 0: 2 }),
      questionsJson: JSON.stringify(questions),
    };
    const screen = renderWithTheme(<SurveyReviewScreen />);

    await waitFor(() => expect(screen.getByText("B")).toBeTruthy());
    expect(screen.getByText("checkmark-circle")).toBeTruthy();
  });

  test("back navigation works", async () => {
    mockParams = {
      answersJson: JSON.stringify({ 0: 0 }),
      questionsJson: JSON.stringify(questions),
    };
    const screen = renderWithTheme(<SurveyReviewScreen />);
    await waitFor(() => expect(screen.getByText("Câu trả lời của bạn")).toBeTruthy());

    await act(async () => {
      fireEvent.press(screen.getByText("arrow-back"));
    });

    expect(mockRouter.back).toHaveBeenCalled();
  });

  test("fetch failure shows error", async () => {
    mockParams = {
      answersJson: JSON.stringify({ 0: 0 }),
    };
    mockGet.mockRejectedValue(new Error("offline"));
    const screen = renderWithTheme(<SurveyReviewScreen />);

    await waitFor(() => expect(screen.getByText("Không thể tải câu hỏi khảo sát.")).toBeTruthy());
  });
});
