import { fireEvent, render } from "@testing-library/react-native";
import React from "react";
import { Text } from "react-native";

import { ScreenBackTitle } from "@/components/ui/ScreenBackTitle";
import { mockColors } from "../test-helpers";

jest.mock("@/hooks/use-app-theme", () => ({
  useAppColors: () => mockColors,
}));

describe("ScreenBackTitle", () => {
  test("renders title text", () => {
    const screen = render(<ScreenBackTitle title="Đăng ký" onPress={jest.fn()} />);

    expect(screen.getByText("Đăng ký")).toBeTruthy();
  });

  test("pressing back calls onPress", () => {
    const onPress = jest.fn();
    const screen = render(<ScreenBackTitle title="Lịch sử" onPress={onPress} />);

    fireEvent.press(screen.getByLabelText("Quay lại từ màn Lịch sử"));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  test("renders right element when provided", () => {
    const screen = render(
      <ScreenBackTitle
        title="Cài đặt"
        onPress={jest.fn()}
        rightElement={<Text>Bộ lọc</Text>}
      />
    );

    expect(screen.getByText("Bộ lọc")).toBeTruthy();
  });

  test("still renders title when right element is omitted", () => {
    const screen = render(<ScreenBackTitle title="Kết quả" onPress={jest.fn()} />);

    expect(screen.getByText("Kết quả")).toBeTruthy();
    expect(screen.queryByText("Bộ lọc")).toBeNull();
  });
});
