import React from "react";

import { renderWithTheme } from "../test-utils";

const mockReplace = jest.fn();
let mockParams: { answers?: string } = {};

jest.mock("expo-router", () => ({
  router: {
    replace: (...args: any[]) => mockReplace(...args),
  },
  useLocalSearchParams: () => mockParams,
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
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  beforeEach(() => {
    mockReplace.mockClear();
    mockParams = {
      answers: JSON.stringify({ 0: 1, 1: 2 }),
    };
  });

  test("renders loading texts", () => {
    const { getByText } = renderWithTheme(<AnalysticScreen />);

    expect(getByText("Đang phân tích...")).toBeTruthy();
    expect(getByText("Vui lòng đợi trong giây lát")).toBeTruthy();
  });

  test("redirects to result after 2 seconds with answers params", () => {
    renderWithTheme(<AnalysticScreen />);

    jest.advanceTimersByTime(2000);

    expect(mockReplace).toHaveBeenCalledWith({
      pathname: "/result",
      params: { answers: JSON.stringify({ 0: 1, 1: 2 }) },
    });
  });
});
