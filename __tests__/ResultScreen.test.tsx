import { fireEvent, render } from "@testing-library/react-native";
import React from "react";

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

jest.mock("@/components/ui/state-badge", () => ({
  StateBadge: ({ state }: any) => {
    const { Text } = require("react-native");
    return <Text>{state}</Text>;
  },
}));

const ResultScreen = require("../app/result").default;

describe("ResultScreen", () => {
  beforeEach(() => {
    mockReplace.mockClear();
    mockParams = {};
  });

  test("renders exhausted result for the lowest answers", () => {
    mockParams = {
      answers: JSON.stringify({
        0: 0,
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
        6: 0,
        7: 0,
        8: 0,
        9: 0,
      }),
    };

    const { getAllByText, getByText } = render(<ResultScreen />);

    expect(getByText("Kết quả phân tích")).toBeTruthy();
    expect(getByText("Bạn đang kiệt sức")).toBeTruthy();
    expect(getByText("exhausted")).toBeTruthy();
    expect(getAllByText("0.0").length).toBeGreaterThan(0);
    expect(getByText("Chỉ số chi tiết")).toBeTruthy();
    expect(getByText("Gợi ý cho bạn")).toBeTruthy();
  });

  test("falls back safely when answers param is invalid json", () => {
    mockParams = { answers: "not-json" };

    const { getAllByText, getByText } = render(<ResultScreen />);

    expect(getByText("Bạn đang lười biếng")).toBeTruthy();
    expect(getAllByText("2.5").length).toBeGreaterThan(0);
  });

  test("navigates to survey when pressing retry", () => {
    mockParams = { answers: JSON.stringify({ 0: 1 }) };
    const { getByText } = render(<ResultScreen />);

    fireEvent.press(getByText("Làm lại"));

    expect(mockReplace).toHaveBeenCalledWith("/survey");
  });

  test("navigates to home when pressing home button", () => {
    mockParams = { answers: JSON.stringify({ 0: 1 }) };
    const { getByText } = render(<ResultScreen />);

    fireEvent.press(getByText("Về trang chủ"));

    expect(mockReplace).toHaveBeenCalledWith("/(tabs)");
  });
});
