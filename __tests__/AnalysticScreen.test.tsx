import React from "react";
import { waitFor } from "@testing-library/react-native";

import { renderWithTheme } from "../test-utils";

const mockReplace = jest.fn();
const mockPost = jest.fn();
let mockParams: { apiAnswers?: string; startedAt?: string } = {};

jest.mock("expo-router", () => ({
  router: {
    replace: (...args: any[]) => mockReplace(...args),
  },
  useLocalSearchParams: () => mockParams,
}));

jest.mock("@/services/api-client", () => ({
  apiClient: {
    post: (...args: any[]) => mockPost(...args),
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

const AnalysticScreen = require("../app/analystic").default;

describe("AnalysticScreen", () => {
  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-05-23T10:00:10.000Z"));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  beforeEach(() => {
    mockReplace.mockClear();
    mockPost.mockReset();
    mockPost.mockResolvedValue({
      success: true,
      data: {
        history: {
          _id: "history-123",
        },
      },
    });
    mockParams = {
      apiAnswers: JSON.stringify([
        {
          questionId: 0,
          group: "energy",
          selectedOption: 1,
          score: 2,
        },
      ]),
      startedAt: String(new Date("2026-05-23T10:00:00.000Z").getTime()),
    };
  });

  test("renders loading texts", async () => {
    mockPost.mockImplementation(
      () => new Promise(() => undefined)
    );

    const { getByText } = renderWithTheme(<AnalysticScreen />);

    expect(getByText("Đang phân tích...")).toBeTruthy();
    expect(getByText("Vui lòng đợi trong giây lát")).toBeTruthy();
  });

  test("submits answers then redirects to result", async () => {
    renderWithTheme(<AnalysticScreen />);

    await waitFor(() =>
      expect(mockPost).toHaveBeenCalledWith("/histories/analyze", {
        answers: [
          {
            questionId: 0,
            group: "energy",
            selectedOption: 1,
            score: 2,
          },
        ],
        meta: {
          completionTime: 10,
          deviceInfo: "android",
          appVersion: "1.0.0-test",
        },
      })
    );

    jest.advanceTimersByTime(500);

    await waitFor(() =>
      expect(mockReplace).toHaveBeenCalledWith({
        pathname: "/result",
        params: { historyId: "history-123" },
      })
    );
  });
});
