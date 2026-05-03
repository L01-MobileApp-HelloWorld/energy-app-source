import { fireEvent, render } from "@testing-library/react-native";
import React from "react";

const mockBack = jest.fn();
const mockPush = jest.fn();

jest.mock("expo-router", () => ({
  router: {
    back: (...args: any[]) => mockBack(...args),
    push: (...args: any[]) => mockPush(...args),
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
  });

  test("renders the first question and progress", () => {
    const { getByText } = render(<SurveyScreen />);

    expect(getByText("Câu hỏi 1 / 10")).toBeTruthy();
    expect(getByText("10%")).toBeTruthy();
    expect(getByText("Mức năng lượng của bạn lúc này như thế nào?")).toBeTruthy();
  });

  test("goes back when pressing back on the first question", () => {
    const { getByText } = render(<SurveyScreen />);

    fireEvent.press(getByText("chevron-back"));

    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  test("moves to the next question after selecting an answer", () => {
    const { getByText } = render(<SurveyScreen />);

    fireEvent.press(getByText("Khá tốt"));
    fireEvent.press(getByText("Tiếp theo"));

    expect(getByText("Câu hỏi 2 / 10")).toBeTruthy();
    expect(getByText("20%")).toBeTruthy();
    expect(getByText("Bạn ngủ được khoảng mấy tiếng tối qua?")).toBeTruthy();
  });

  test("navigates to analystic with serialized answers on the last question", () => {
    const { getByText } = render(<SurveyScreen />);

    const firstOptionLabels = [
      "Kiệt sức hoàn toàn",
      "Dưới 4 tiếng",
      "Đau nhức, khó chịu",
      "Chán nản, tiêu cực",
      "Sợ hãi, né tránh",
      "Chưa ăn gì cả",
      "Dưới 5 phút",
      "Rất gấp, sắp hết giờ",
      "Thực sự kiệt sức",
      "Rất khó tập trung",
    ];

    firstOptionLabels.forEach((label, index) => {
      fireEvent.press(getByText(label));
      fireEvent.press(
        getByText(index === firstOptionLabels.length - 1 ? "Tiến hành phân tích" : "Tiếp theo")
      );
    });

    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/analystic",
      params: {
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
      },
    });
  });
});
