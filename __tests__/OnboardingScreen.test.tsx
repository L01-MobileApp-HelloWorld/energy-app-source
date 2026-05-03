import { fireEvent } from "@testing-library/react-native";
import React from "react";
import { Dimensions, ScrollView } from "react-native";
import { renderWithTheme } from "../test-utils";

const mockReplace = jest.fn();

jest.mock("expo-router", () => ({
  Link: "Link",
  Stack: "Stack",
  useRouter: () => ({ push: jest.fn(), replace: mockReplace }),
  router: {
    replace: (...args: any[]) => mockReplace(...args),
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

const OnboardingScreen = require("../app/onboarding").default;

describe("OnboardingScreen", () => {
  beforeEach(() => {
    mockReplace.mockClear();
  });

  test("render first slide text", () => {
    const { getByText } = renderWithTheme(<OnboardingScreen />);
    expect(getByText("Mệt thật hay lười thật")).toBeTruthy();
  });

  test("skip button works", () => {
    const { getByText } = renderWithTheme(<OnboardingScreen />);
    fireEvent.press(getByText("Bỏ qua"));
    expect(mockReplace).toHaveBeenCalledWith("/login");
  });

  test("next button exists", () => {
    const { getByText } = renderWithTheme(<OnboardingScreen />);
    expect(getByText("Tiếp theo")).toBeTruthy();
  });

  test("skip button is visible on the first slide", () => {
    const { getByText } = renderWithTheme(<OnboardingScreen />);
    expect(getByText("Bỏ qua")).toBeTruthy();
  });

  test("render second slide title", () => {
    const { getByText } = renderWithTheme(<OnboardingScreen />);
    expect(getByText("Trả lời 10 câu hỏi\nchỉ trong 60 giây")).toBeTruthy();
  });

  test("render third slide title", () => {
    const { getByText } = renderWithTheme(<OnboardingScreen />);
    expect(getByText("Sẵn sàng!!")).toBeTruthy();
  });

  test("render repeated description twice", () => {
    const { getAllByText } = renderWithTheme(<OnboardingScreen />);
    expect(
      getAllByText("Bạn có đang phân vân không biết nên làm việc hay nghỉ ngơi")
    ).toHaveLength(2);
  });

  test("render last slide description", () => {
    const { getByText } = renderWithTheme(<OnboardingScreen />);
    expect(getByText("Bắt đầu hành trình hiểu rõ bản thân")).toBeTruthy();
  });

  test("pressing next twice changes CTA to start button", () => {
    const { getByText } = renderWithTheme(<OnboardingScreen />);
    fireEvent.press(getByText("Tiếp theo"));
    fireEvent.press(getByText("Tiếp theo"));
    expect(getByText("Bắt đầu")).toBeTruthy();
  });

  test("skip button disappears on the last slide", () => {
    const { getByText, queryByText } = renderWithTheme(<OnboardingScreen />);
    fireEvent.press(getByText("Tiếp theo"));
    fireEvent.press(getByText("Tiếp theo"));
    expect(queryByText("Bỏ qua")).toBeNull();
  });

  test("pressing start on the last slide navigates to tabs", () => {
    const { getByText } = renderWithTheme(<OnboardingScreen />);
    fireEvent.press(getByText("Tiếp theo"));
    fireEvent.press(getByText("Tiếp theo"));
    fireEvent.press(getByText("Bắt đầu"));
    expect(mockReplace).toHaveBeenCalledWith("/login");
  });

  test("momentum scroll to second slide keeps next CTA", () => {
    const { UNSAFE_getByType, getByText } = renderWithTheme(<OnboardingScreen />);
    const scrollView = UNSAFE_getByType(ScrollView);
    const slideWidth = Dimensions.get("window").width;
    fireEvent(scrollView, "onMomentumScrollEnd", {
      nativeEvent: { contentOffset: { x: slideWidth } },
    });
    expect(getByText("Tiếp theo")).toBeTruthy();
  });

  test("momentum scroll to second slide keeps skip button visible", () => {
    const { UNSAFE_getByType, getByText } = renderWithTheme(<OnboardingScreen />);
    const scrollView = UNSAFE_getByType(ScrollView);
    const slideWidth = Dimensions.get("window").width;
    fireEvent(scrollView, "onMomentumScrollEnd", {
      nativeEvent: { contentOffset: { x: slideWidth } },
    });
    expect(getByText("Bỏ qua")).toBeTruthy();
  });

  test("momentum scroll to last slide changes CTA to start", () => {
    const { UNSAFE_getByType, getByText } = renderWithTheme(<OnboardingScreen />);
    const scrollView = UNSAFE_getByType(ScrollView);
    const slideWidth = Dimensions.get("window").width;
    fireEvent(scrollView, "onMomentumScrollEnd", {
      nativeEvent: { contentOffset: { x: slideWidth * 2 } },
    });
    expect(getByText("Bắt đầu")).toBeTruthy();
  });

  test("momentum scroll back to first slide restores skip button", () => {
    const { UNSAFE_getByType, getByText } = renderWithTheme(<OnboardingScreen />);
    const scrollView = UNSAFE_getByType(ScrollView);
    const slideWidth = Dimensions.get("window").width;
    fireEvent(scrollView, "onMomentumScrollEnd", {
      nativeEvent: { contentOffset: { x: slideWidth * 2 } },
    });
    fireEvent(scrollView, "onMomentumScrollEnd", {
      nativeEvent: { contentOffset: { x: 0 } },
    });
    expect(getByText("Bỏ qua")).toBeTruthy();
  });
});
