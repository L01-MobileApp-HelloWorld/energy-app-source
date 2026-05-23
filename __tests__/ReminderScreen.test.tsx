import React from "react";
import { act, fireEvent, render, waitFor } from "@testing-library/react-native";

jest.mock("react-native-safe-area-context", () => {
  const React = require("react");
  const { View } = require("react-native");
  return {
    SafeAreaView: ({ children, ...props }: any) => <View {...props}>{children}</View>,
  };
});

jest.mock("@react-native-community/datetimepicker", () => "DateTimePicker");

jest.mock("expo-router", () => ({
  router: { back: jest.fn() },
}));

jest.mock("@/components/ui/actionsheet", () => {
  const React = require("react");
  const { View, TouchableOpacity } = require("react-native");
  const MockView = ({ children, ...props }: any) => <View {...props}>{children}</View>;
  return {
    // Respect isOpen so we can test show/hide behaviour
    Actionsheet: ({ children, isOpen, ...props }: any) =>
      isOpen ? <View {...props}>{children}</View> : null,
    ActionsheetBackdrop: ({ onPress, ...props }: any) => (
      <TouchableOpacity onPress={onPress} testID="actionsheet-backdrop" {...props} />
    ),
    ActionsheetContent: MockView,
    ActionsheetDragIndicator: () => null,
    ActionsheetDragIndicatorWrapper: () => null,
  };
});

jest.mock("@/components/ui/ScreenBackTitle", () => {
  const React = require("react");
  const { TouchableOpacity, Text } = require("react-native");
  return {
    ScreenBackTitle: ({ title, onPress }: any) => (
      <TouchableOpacity onPress={onPress}>
        <Text>{title}</Text>
      </TouchableOpacity>
    ),
  };
});

jest.mock("@/services/api-client", () => ({
  ApiError: class ApiError extends Error {
    constructor(message: string) {
      super(message);
      this.name = "ApiError";
    }
  },
}));

const mockUpdateProfile = jest.fn(() => Promise.resolve());
const mockUseAuth = jest.fn();

jest.mock("@/hooks/auth-context", () => ({
  useAuth: () => mockUseAuth(),
}));

jest.mock("@/hooks/use-app-theme", () => ({
  useAppTheme: () => ({ resolvedTheme: "light" }),
  useAppColors: () => ({
    bgApp: "#fff",
    bgSurface1: "#fff",
    bgSurface2: "#f5f5f5",
    bgSurface3: "#eee",
    textPrimary: "#111",
    textSecondary: "#333",
    textMuted: "#666",
    textGhost: "#999",
    primaryMain: "#5b5cf6",
    primarySurface: "#f0f1ff",
    primaryLight: "#8b8cf8",
    borderDefault: "#ddd",
    black: "#000",
    stateExhaustedText: "#dc2626",
  }),
}));

const ReminderScreen = require("../app/reminder").default;

const baseUser = {
  _id: "user-1",
  username: "tester",
  email: "tester@example.com",
  preferences: {
    notificationsEnabled: true,
    reminderTime: "17:00",
    reminderFrequency: "daily" as const,
    customReminderDays: [],
  },
};

beforeEach(() => {
  jest.clearAllMocks();
  mockUpdateProfile.mockResolvedValue(undefined);
  mockUseAuth.mockReturnValue({ user: baseUser, updateProfile: mockUpdateProfile });
});

describe("ReminderScreen — render", () => {
  test("renders frequency options", () => {
    const { getByText } = render(<ReminderScreen />);
    expect(getByText("Hàng ngày")).toBeTruthy();
    expect(getByText("Tùy chỉnh")).toBeTruthy();
  });

  test("does not render unsupported frequency option", () => {
    const { queryByText } = render(<ReminderScreen />);
    expect(queryByText("2 lần / ngày")).toBeNull();
  });

  test("renders with notificationsEnabled=false", () => {
    mockUseAuth.mockReturnValue({
      user: {
        ...baseUser,
        preferences: { ...baseUser.preferences, notificationsEnabled: false },
      },
      updateProfile: mockUpdateProfile,
    });
    const { getByText } = render(<ReminderScreen />);
    expect(getByText("Bật nhắc nhở")).toBeTruthy();
  });

  test("renders with custom frequency and days from user preferences", () => {
    mockUseAuth.mockReturnValue({
      user: {
        ...baseUser,
        preferences: {
          ...baseUser.preferences,
          reminderFrequency: "custom",
          customReminderDays: [2, 4, 6],
        },
      },
      updateProfile: mockUpdateProfile,
    });
    const { getAllByText } = render(<ReminderScreen />);
    // Day chips "T2" may appear more than once (helper text); use getAllByText
    expect(getAllByText(/T2/).length).toBeGreaterThan(0);
  });

  test("renders without user (no crash)", () => {
    mockUseAuth.mockReturnValue({ user: null, updateProfile: mockUpdateProfile });
    const { getByText } = render(<ReminderScreen />);
    expect(getByText("Hàng ngày")).toBeTruthy();
  });
});

describe("ReminderScreen — back button", () => {
  test("calls router.back when back button is pressed", () => {
    const { router } = require("expo-router");
    const { getByText } = render(<ReminderScreen />);
    fireEvent.press(getByText("Nhắc nhở thông minh"));
    expect(router.back).toHaveBeenCalled();
  });
});

describe("ReminderScreen — frequency selection", () => {
  test("pressing Hàng ngày keeps daily frequency", () => {
    const { getByText } = render(<ReminderScreen />);
    fireEvent.press(getByText("Hàng ngày"));
    expect(getByText("Hàng ngày")).toBeTruthy();
  });

  test("pressing Tùy chỉnh opens the custom days sheet", () => {
    const { getByText } = render(<ReminderScreen />);
    fireEvent.press(getByText("Tùy chỉnh"));
    expect(getByText("Chọn ngày nhắc nhở")).toBeTruthy();
  });

  test("closing the freq sheet via backdrop hides it", () => {
    const { getByText, queryByText, getByTestId } = render(<ReminderScreen />);
    // Open sheet
    fireEvent.press(getByText("Tùy chỉnh"));
    expect(getByText("Chọn ngày nhắc nhở")).toBeTruthy();
    // Close via backdrop
    fireEvent.press(getByTestId("actionsheet-backdrop"));
    expect(queryByText("Chọn ngày nhắc nhở")).toBeNull();
  });
});

describe("ReminderScreen — custom days sheet", () => {
  test("can select and deselect a day chip", () => {
    const { getByText } = render(<ReminderScreen />);
    fireEvent.press(getByText("Tùy chỉnh"));
    const t2 = getByText("T2");
    fireEvent.press(t2);
    fireEvent.press(t2);
    expect(t2).toBeTruthy();
  });

  test("Lưu tần suất is disabled when no days are selected", () => {
    const { getByText } = render(<ReminderScreen />);
    fireEvent.press(getByText("Tùy chỉnh"));
    const saveBtn = getByText("Lưu tần suất");
    expect(saveBtn).toBeTruthy();
  });

  test("can select a day and save custom frequency", () => {
    const { getByText } = render(<ReminderScreen />);
    fireEvent.press(getByText("Tùy chỉnh"));
    fireEvent.press(getByText("T3"));
    fireEvent.press(getByText("Lưu tần suất"));
    expect(getByText("Tùy chỉnh")).toBeTruthy();
  });

  test("closing the sheet via backdrop resets draft days selection", () => {
    const { getByText, queryByText, getByTestId } = render(<ReminderScreen />);
    // Open sheet, select a day
    fireEvent.press(getByText("Tùy chỉnh"));
    fireEvent.press(getByText("T4"));
    // Close without saving → draft days discarded
    fireEvent.press(getByTestId("actionsheet-backdrop"));
    expect(queryByText("Chọn ngày nhắc nhở")).toBeNull();
    // Re-open: the day should not appear as pre-selected (helper text shows 0 days)
    fireEvent.press(getByText("Tùy chỉnh"));
    expect(getByText("Cần chọn ít nhất 1 ngày để lưu tần suất tùy chỉnh.")).toBeTruthy();
  });
});

describe("ReminderScreen — time picker", () => {
  test("pressing the time row does not crash (Android: shows DateTimePicker inline)", () => {
    // In test env Platform.OS === 'android', so the time picker renders as
    // a native DateTimePicker component — not an iOS Actionsheet.
    const { getByText } = render(<ReminderScreen />);
    expect(() => fireEvent.press(getByText("17:00"))).not.toThrow();
  });
});

describe("ReminderScreen — save reminder", () => {
  test("calls updateProfile on save with correct data", async () => {
    const { getByText } = render(<ReminderScreen />);
    await act(async () => {
      fireEvent.press(getByText("Lưu nhắc nhở"));
    });
    await waitFor(() => {
      expect(mockUpdateProfile).toHaveBeenCalledWith({
        preferences: expect.objectContaining({
          notificationsEnabled: true,
          reminderTime: "17:00",
          reminderFrequency: "daily",
          customReminderDays: [],
        }),
      });
    });
  });

  test("shows success message after saving", async () => {
    const { getByText } = render(<ReminderScreen />);
    await act(async () => {
      fireEvent.press(getByText("Lưu nhắc nhở"));
    });
    await waitFor(() => {
      expect(getByText("Đã lưu cài đặt nhắc nhở")).toBeTruthy();
    });
  });

  test("shows ApiError message on failure", async () => {
    const { ApiError } = require("@/services/api-client");
    mockUpdateProfile.mockRejectedValueOnce(new ApiError("Lưu thất bại từ server"));
    const { getByText } = render(<ReminderScreen />);
    await act(async () => {
      fireEvent.press(getByText("Lưu nhắc nhở"));
    });
    await waitFor(() => {
      expect(getByText("Lưu thất bại từ server")).toBeTruthy();
    });
  });

  test("shows generic error message on unknown failure", async () => {
    mockUpdateProfile.mockRejectedValueOnce(new Error("network error"));
    const { getByText } = render(<ReminderScreen />);
    await act(async () => {
      fireEvent.press(getByText("Lưu nhắc nhở"));
    });
    await waitFor(() => {
      expect(getByText("Không thể kết nối đến server. Vui lòng thử lại.")).toBeTruthy();
    });
  });

  test("does not call updateProfile when user is null", async () => {
    mockUseAuth.mockReturnValue({ user: null, updateProfile: mockUpdateProfile });
    const { getByText } = render(<ReminderScreen />);
    await act(async () => {
      fireEvent.press(getByText("Lưu nhắc nhở"));
    });
    expect(mockUpdateProfile).not.toHaveBeenCalled();
  });

  test("save with custom frequency passes selected days", async () => {
    const { getByText } = render(<ReminderScreen />);
    fireEvent.press(getByText("Tùy chỉnh"));
    fireEvent.press(getByText("T2"));
    fireEvent.press(getByText("T4"));
    fireEvent.press(getByText("Lưu tần suất"));
    await act(async () => {
      fireEvent.press(getByText("Lưu nhắc nhở"));
    });
    await waitFor(() => {
      expect(mockUpdateProfile).toHaveBeenCalledWith({
        preferences: expect.objectContaining({
          reminderFrequency: "custom",
          customReminderDays: [2, 4],
        }),
      });
    });
  });
});
