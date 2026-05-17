import React from "react";
import { render } from "@testing-library/react-native";

jest.mock("react-native-safe-area-context", () => {
  const React = require("react");
  const { View } = require("react-native");
  return {
    SafeAreaView: ({ children, ...props }: any) => <View {...props}>{children}</View>,
  };
});

jest.mock("@react-native-community/datetimepicker", () => "DateTimePicker");

jest.mock("@/components/ui/actionsheet", () => {
  const React = require("react");
  const { View } = require("react-native");

  const MockView = ({ children, ...props }: any) => <View {...props}>{children}</View>;

  return {
    Actionsheet: MockView,
    ActionsheetBackdrop: MockView,
    ActionsheetContent: MockView,
    ActionsheetDragIndicator: MockView,
    ActionsheetDragIndicatorWrapper: MockView,
  };
});

const mockAuthValue = {
  user: {
    _id: "user-1",
    username: "tester",
    email: "tester@example.com",
    preferences: {
      notificationsEnabled: true,
      reminderTime: "17:00",
      reminderFrequency: "daily",
      customReminderDays: [],
    },
  },
  updateProfile: jest.fn(() => Promise.resolve()),
};

jest.mock("@/hooks/auth-context", () => ({
  useAuth: () => mockAuthValue,
}));

jest.mock("@/hooks/use-app-theme", () => ({
  useAppTheme: () => ({
    resolvedTheme: "light",
  }),
  useAppColors: () => ({
    bgApp: "#fff",
    bgSurface1: "#fff",
    bgSurface3: "#eee",
    textPrimary: "#111",
    textMuted: "#666",
    textGhost: "#999",
    primaryMain: "#0a84ff",
    primarySurface: "#eaf4ff",
    primaryLight: "#8fc0ff",
    borderDefault: "#ddd",
    black: "#000",
    stateExhaustedText: "#c00",
  }),
}));

const ReminderScreen = require("../app/reminder").default;

describe("ReminderScreen", () => {
  test("does not render the unsupported twice frequency option", () => {
    const screen = render(<ReminderScreen />);

    expect(screen.getByText("Hàng ngày")).toBeTruthy();
    expect(screen.getByText("Tùy chỉnh")).toBeTruthy();
    expect(screen.queryByText("2 lần / ngày")).toBeNull();
  });
});
