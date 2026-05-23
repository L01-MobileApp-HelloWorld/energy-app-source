import { fireEvent, waitFor } from "@testing-library/react-native";
import React from "react";

import { renderWithTheme } from "../test-utils";

const mockBack = jest.fn();
const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockGet = jest.fn();
let mockParams: { historyId?: string; fromHistory?: string } = {};

const mockHistory = {
  _id: "history-1",
  scores: {
    energy: 0,
    environment: 20,
    psychology: 10,
    work: 30,
    total: 15,
  },
  state: "exhausted",
  stateDetails: {
    name: "Bạn đang kiệt sức",
    emoji: "😵",
    description: "Cơ thể và tinh thần của bạn đang cần nghỉ ngơi.",
    recommendations: ["Ngủ sớm", "Tạm dừng công việc nặng"],
  },
  answers: [
    {
      questionId: 0,
      group: "energy",
      selectedOption: 0,
      score: 0,
    },
    {
      questionId: 1,
      group: "environment",
      selectedOption: 1,
      score: 2,
    },
  ],
};

const mockQuestions = [
  {
    _id: "q1",
    questionId: 0,
    group: "energy",
    question: "Câu hỏi 1",
    options: [
      { label: "A", emoji: "🙂", subtext: "A", score: 0 },
      { label: "B", emoji: "🙂", subtext: "B", score: 1 },
    ],
  },
  {
    _id: "q2",
    questionId: 1,
    group: "environment",
    question: "Câu hỏi 2",
    options: [
      { label: "A", emoji: "🙂", subtext: "A", score: 0 },
      { label: "B", emoji: "🙂", subtext: "B", score: 2 },
    ],
  },
];

jest.mock("expo-router", () => ({
  router: {
    back: (...args: any[]) => mockBack(...args),
    push: (...args: any[]) => mockPush(...args),
    replace: (...args: any[]) => mockReplace(...args),
  },
  useLocalSearchParams: () => mockParams,
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

jest.mock("react-native-svg", () => {
  const React = require("react");
  const { View } = require("react-native");
  const MockSvg = ({ children, ...props }: any) => <View {...props}>{children}</View>;
  const MockCircle = (props: any) => <View {...props} />;

  return {
    __esModule: true,
    default: MockSvg,
    Circle: MockCircle,
  };
});

jest.mock("@/components/ui/state-badge", () => ({
  StateBadge: ({ state }: any) => {
    const { Text } = require("react-native");
    return <Text>{state}</Text>;
  },
}));

jest.mock("@/components/ui/circular-score", () => ({
  CircularScore: ({ score }: any) => {
    const { Text } = require("react-native");
    return <Text>{score.toFixed(1)}</Text>;
  },
}));

jest.mock("@/components/ui/category-bar", () => ({
  CategoryBar: ({ label, score }: any) => {
    const { Text, View } = require("react-native");
    return (
      <View>
        <Text>{label}</Text>
        <Text>{score.toFixed(1)}</Text>
      </View>
    );
  },
}));

const ResultScreen = require("../app/result").default;

describe("ResultScreen", () => {
  beforeEach(() => {
    mockBack.mockClear();
    mockPush.mockClear();
    mockReplace.mockClear();
    mockGet.mockReset();
    mockParams = {
      historyId: "history-1",
    };
    mockGet.mockImplementation((endpoint: string) => {
      if (endpoint === "/histories/history-1") {
        return Promise.resolve({
          success: true,
          data: { history: mockHistory },
        });
      }

      if (endpoint === "/questions") {
        return Promise.resolve({
          success: true,
          data: { questions: mockQuestions },
        });
      }

      throw new Error(`Unexpected GET ${endpoint}`);
    });
  });

  test("renders result details from backend history", async () => {
    const { getAllByText, getByText } = renderWithTheme(<ResultScreen />);

    await waitFor(() => expect(getByText("Kết quả phân tích")).toBeTruthy());

    expect(getByText("Bạn đang kiệt sức")).toBeTruthy();
    expect(getByText("exhausted")).toBeTruthy();
    expect(getAllByText("0.8").length).toBeGreaterThan(0);
    expect(getByText("Chỉ số chi tiết")).toBeTruthy();
    expect(getByText("Gợi ý cho bạn")).toBeTruthy();
    expect(getByText("Ngủ sớm")).toBeTruthy();
    expect(mockGet).toHaveBeenCalledWith("/histories/history-1");
    expect(mockGet).toHaveBeenCalledWith("/questions", {
      query: {
        questionId: "0,1",
      },
    });
  });

  test("shows missing history error and retries fetch", async () => {
    mockParams = {};

    const { getByText } = renderWithTheme(<ResultScreen />);

    expect(getByText("Thiếu historyId để tải kết quả.")).toBeTruthy();

    fireEvent.press(getByText("Thử lại"));

    expect(getByText("Thiếu historyId để tải kết quả.")).toBeTruthy();
  });

  test("navigates to survey review with serialized review params", async () => {
    const { getByText } = renderWithTheme(<ResultScreen />);

    await waitFor(() => expect(getByText("Xem lại khảo sát")).toBeTruthy());

    fireEvent.press(getByText("Xem lại khảo sát"));

    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/survey-review",
      params: {
        answersJson: JSON.stringify({ 0: 0, 1: 1 }),
        questionsJson: JSON.stringify(mockQuestions),
      },
    });
  });

  test("navigates to home or history based on source", async () => {
    const firstScreen = renderWithTheme(<ResultScreen />);

    await waitFor(() => expect(firstScreen.getByText("Về trang chủ")).toBeTruthy());
    fireEvent.press(firstScreen.getByText("Về trang chủ"));
    expect(mockReplace).toHaveBeenCalledWith("/(tabs)");

    mockBack.mockClear();
    mockParams = {
      historyId: "history-1",
      fromHistory: "1",
    };

    const secondScreen = renderWithTheme(<ResultScreen />);

    await waitFor(() => expect(secondScreen.getByText("Về lịch sử")).toBeTruthy());
    fireEvent.press(secondScreen.getByText("Về lịch sử"));
    expect(mockBack).toHaveBeenCalledTimes(1);
  });
});
