import { render } from "@testing-library/react-native";
import React from "react";

jest.mock("react-native-safe-area-context", () => {
  const React = require("react");
  const { View } = require("react-native");
  return {
    SafeAreaView: ({ children, ...props }: any) => (
      <View {...props}>{children}</View>
    ),
  };
});

jest.mock("@/components/ui/heading", () => ({
  Heading: ({ children, ...props }: any) => {
    const { Text } = require("react-native");
    return <Text {...props}>{children}</Text>;
  },
}));

const SettingsScreen = require("../app/(tabs)/settings").default;

describe("SettingsScreen", () => {
  test("renders settings heading", () => {
    const { getByText } = render(<SettingsScreen />);
    expect(getByText("Cài đặt")).toBeTruthy();
  });
});
