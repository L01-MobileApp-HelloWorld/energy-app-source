import { fireEvent } from "@testing-library/react-native";
import React from "react";
import { ScrollView } from "react-native";
import HomeScreen from "../app/(tabs)/index";
import { renderWithTheme } from "../test-utils";

const mockIconSymbol = jest.fn((_props: any) => null);
const mockPush = jest.fn();
const mockApiGet = jest.fn();
const mockUseAuth = jest.fn(() => ({
  user: {
    username: "Huy",
  },
}));

jest.mock("expo-router", () => ({
  router: {
    push: (...args: any[]) => mockPush(...args),
  },
}));

jest.mock("@react-navigation/native", () => ({
  useFocusEffect: (effect: () => void | (() => void)) => {
    const React = require("react");
    React.useEffect(effect, []);
  },
}));

jest.mock("@/hooks/auth-context", () => ({
  useAuth: () => mockUseAuth(),
}));

jest.mock("@/services/api-client", () => ({
  apiClient: {
    get: (...args: any[]) => mockApiGet(...args),
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
    mockPush.mockClear();
    mockApiGet.mockReset();
    mockUseAuth.mockReturnValue({
      user: {
        username: "Huy",
      },
    });
    mockApiGet.mockResolvedValue({
      success: true,
      data: {
        histories: [
          {
            _id: "history-1",
            state: "ready",
            stateDetails: {
              name: "Tỉnh táo, sẵn sàng",
              emoji: "💪",
            },
            createdAt: "2026-04-27T05:00:00.000Z",
          },
        ],
      },
    });
  });

  test("render without crash", () => {
    const { toJSON } = renderWithTheme(<HomeScreen />);
    expect(toJSON()).not.toBeNull();
  });

  test("render welcome text", () => {
    const { getByText } = renderWithTheme(<HomeScreen />);
    expect(getByText("Chào Huy! 👋")).toBeTruthy();
  });

  test("render start button", () => {
    const { getByText } = renderWithTheme(<HomeScreen />);
    expect(getByText("Bắt đầu kiểm tra")).toBeTruthy();
  });

  test("press start button without crash", () => {
    const { getByText } = renderWithTheme(<HomeScreen />);
    expect(() => fireEvent.press(getByText("Bắt đầu kiểm tra"))).not.toThrow();
    expect(mockPush).toHaveBeenCalledWith("/survey");
  });

  test("render formatted current date and time", () => {
    const { getByText } = renderWithTheme(<HomeScreen />);
    expect(getByText("Thứ 2, 09:05")).toBeTruthy();
  });

  test("render avatar emoji", () => {
    const { getByText } = renderWithTheme(<HomeScreen />);
    expect(getByText("😊")).toBeTruthy();
  });

  test("render check-in heading", () => {
    const { getByText } = renderWithTheme(<HomeScreen />);
    expect(getByText("Hôm nay bạn cảm thấy thế nào?")).toBeTruthy();
  });

  test("render check-in description", () => {
    const { getByText } = renderWithTheme(<HomeScreen />);
    expect(getByText("Dành 1 phút để thấu hiểm cảm xúc của mình")).toBeTruthy();
  });

  test("render previous result label", async () => {
    const { findByText } = renderWithTheme(<HomeScreen />);
    expect(await findByText("Lần trước,")).toBeTruthy();
  });

  test("render previous result status", async () => {
    const { findByText } = renderWithTheme(<HomeScreen />);
    expect(await findByText("Tỉnh táo, sẵn sàng")).toBeTruthy();
  });

  test("render previous result time", async () => {
    const { findByText } = renderWithTheme(<HomeScreen />);
    expect(await findByText("Hôm nay, 12:00")).toBeTruthy();
  });

  test("render history menu item", () => {
    const { getByText } = renderWithTheme(<HomeScreen />);
    expect(getByText("Kiểm tra lịch sử")).toBeTruthy();
  });

  test("render reminder menu item", () => {
    const { getByText } = renderWithTheme(<HomeScreen />);
    expect(getByText("Xem nhắc nhở")).toBeTruthy();
  });

  test("render key emojis for the cards", async () => {
    const { getByText, findByText } = renderWithTheme(<HomeScreen />);
    expect(getByText("😊")).toBeTruthy();
    expect(await findByText("💪")).toBeTruthy();
  });

  test("configure the scroll view without vertical indicator", () => {
    const { UNSAFE_getByType } = renderWithTheme(<HomeScreen />);
    const scrollView = UNSAFE_getByType(ScrollView);
    expect(scrollView.props.showsVerticalScrollIndicator).toBe(false);
  });

  test("render the expected icon symbols", () => {
    renderWithTheme(<HomeScreen />);

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
