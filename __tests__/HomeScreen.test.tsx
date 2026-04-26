import { fireEvent, render } from "@testing-library/react-native";
import React from "react";
import { ScrollView } from "react-native";
import HomeScreen from "../app/(tabs)/index";

const mockIconSymbol = jest.fn(() => null);

jest.mock("react-native-safe-area-context", () => {
  const React = require("react");
  const { View } = require("react-native");
  return {
    SafeAreaView: ({ children, ...props }: any) => (
      <View {...props}>{children}</View>
    ),
  };
});

jest.mock("@/components/ui/text", () => ({
  Text: ({ children, ...props }: any) => {
    const { Text } = require("react-native");
    return <Text {...props}>{children}</Text>;
  },
}));

jest.mock("@/components/ui/heading", () => ({
  Heading: ({ children, ...props }: any) => {
    const { Text } = require("react-native");
    return <Text {...props}>{children}</Text>;
  },
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({ children, onPress, ...props }: any) => {
    const { Pressable } = require("react-native");
    return (
      <Pressable onPress={onPress} {...props}>
        {children}
      </Pressable>
    );
  },
  ButtonText: ({ children, ...props }: any) => {
    const { Text } = require("react-native");
    return <Text {...props}>{children}</Text>;
  },
}));

jest.mock("@/components/ui/icon-symbol", () => ({
  IconSymbol: (props: any) => {
    mockIconSymbol(props);
    return null;
  },
}));

describe("HomeScreen", () => {
  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-04-27T09:05:00"));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  beforeEach(() => {
    mockIconSymbol.mockClear();
  });

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

  test("press start button without crash", () => {
    const { getByText } = render(<HomeScreen />);
    expect(() => fireEvent.press(getByText("Bắt đầu kiểm tra"))).not.toThrow();
  });

  test("render formatted current date and time", () => {
    const { getByText } = render(<HomeScreen />);
    expect(getByText("Thứ 2, 09:05")).toBeTruthy();
  });

  test("render avatar emoji", () => {
    const { getByText } = render(<HomeScreen />);
    expect(getByText("🧑")).toBeTruthy();
  });

  test("render check-in heading", () => {
    const { getByText } = render(<HomeScreen />);
    expect(getByText("Hôm nay bạn cảm thấy thế nào?")).toBeTruthy();
  });

  test("render check-in description", () => {
    const { getByText } = render(<HomeScreen />);
    expect(getByText("Dành 1 phút để thấu hiểm cảm xúc của mình")).toBeTruthy();
  });

  test("render previous result label", () => {
    const { getByText } = render(<HomeScreen />);
    expect(getByText("Lần trước,")).toBeTruthy();
  });

  test("render previous result status", () => {
    const { getByText } = render(<HomeScreen />);
    expect(getByText("Tỉnh táo, sẵn sàng")).toBeTruthy();
  });

  test("render previous result time", () => {
    const { getByText } = render(<HomeScreen />);
    expect(getByText("Hôm nay, 12:00")).toBeTruthy();
  });

  test("render history menu item", () => {
    const { getByText } = render(<HomeScreen />);
    expect(getByText("Kiểm tra lịch sử")).toBeTruthy();
  });

  test("render reminder menu item", () => {
    const { getByText } = render(<HomeScreen />);
    expect(getByText("Xem nhắc nhở")).toBeTruthy();
  });

  test("render key emojis for the cards", () => {
    const { getByText } = render(<HomeScreen />);
    expect(getByText("😊")).toBeTruthy();
    expect(getByText("💪")).toBeTruthy();
  });

  test("configure the scroll view without vertical indicator", () => {
    const { UNSAFE_getByType } = render(<HomeScreen />);
    const scrollView = UNSAFE_getByType(ScrollView);
    expect(scrollView.props.showsVerticalScrollIndicator).toBe(false);
  });

  test("render the expected icon symbols", () => {
    render(<HomeScreen />);

    expect(mockIconSymbol).toHaveBeenCalledTimes(4);
    expect(mockIconSymbol).toHaveBeenCalledWith(
      expect.objectContaining({ name: "clock.arrow.circlepath", size: 20 })
    );
    expect(mockIconSymbol).toHaveBeenCalledWith(
      expect.objectContaining({ name: "alarm", size: 20 })
    );
    expect(mockIconSymbol).toHaveBeenCalledWith(
      expect.objectContaining({ name: "chevron.right", size: 20 })
    );
  });
});
