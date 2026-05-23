import { act, fireEvent } from "@testing-library/react-native";
import React from "react";

import { ApiError } from "@/services/api-client";
import { renderWithTheme } from "../test-utils";
import { MockSafeAreaView, mockRouter, mockUser } from "../test-helpers";

const mockUpdateProfile = jest.fn();
const mockUseAuth = jest.fn(() => ({
  user: mockUser,
  updateProfile: mockUpdateProfile,
}));

jest.mock("expo-router", () => ({
  router: mockRouter,
}));

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: MockSafeAreaView,
}));

jest.mock("@/hooks/auth-context", () => ({
  useAuth: () => mockUseAuth(),
}));

const ProfileUpdateScreen = require("../app/profile-update").default;

describe("ProfileUpdateScreen", () => {
  beforeEach(() => {
    mockUpdateProfile.mockReset();
    mockRouter.back.mockClear();
    mockRouter.replace.mockClear();
    mockUseAuth.mockReturnValue({
      user: { ...mockUser },
      updateProfile: mockUpdateProfile,
    });
  });

  test("renders empty state when user is missing", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      updateProfile: mockUpdateProfile,
    });
    const screen = renderWithTheme(<ProfileUpdateScreen />);

    expect(screen.getByText("Không tìm thấy thông tin tài khoản")).toBeTruthy();
    fireEvent.press(screen.getByText("Về đăng nhập"));
    expect(mockRouter.replace).toHaveBeenCalledWith("/login");
  });

  test("hydrates display name and email", () => {
    const screen = renderWithTheme(<ProfileUpdateScreen />);

    expect(screen.getByDisplayValue("Tester")).toBeTruthy();
    expect(screen.getByText("tester@example.com")).toBeTruthy();
  });

  test("back navigation works", () => {
    const screen = renderWithTheme(<ProfileUpdateScreen />);
    fireEvent.press(screen.getByLabelText("Quay lại từ màn Cập nhật hồ sơ"));
    expect(mockRouter.back).toHaveBeenCalled();
  });

  test("successful save shows success message", async () => {
    mockUpdateProfile.mockResolvedValue(undefined);
    const screen = renderWithTheme(<ProfileUpdateScreen />);

    fireEvent.changeText(screen.getByDisplayValue("Tester"), "New Name");

    await act(async () => {
      fireEvent.press(screen.getByText("Lưu thay đổi"));
    });

    expect(mockUpdateProfile).toHaveBeenCalledWith({ displayName: "New Name" });
    expect(screen.getByText("Cập nhật hồ sơ thành công")).toBeTruthy();
  });

  test("shows ApiError and network fallback", async () => {
    mockUpdateProfile.mockRejectedValueOnce(new ApiError("Tên không hợp lệ", 400, {}));
    const screen = renderWithTheme(<ProfileUpdateScreen />);

    fireEvent.changeText(screen.getByDisplayValue("Tester"), "New Name");
    await act(async () => {
      fireEvent.press(screen.getByText("Lưu thay đổi"));
    });
    expect(screen.getByText("Tên không hợp lệ")).toBeTruthy();

    mockUpdateProfile.mockRejectedValueOnce(new Error("offline"));
    await act(async () => {
      fireEvent.press(screen.getByText("Lưu thay đổi"));
    });
    expect(screen.getByText("Không thể kết nối đến server. Vui lòng thử lại.")).toBeTruthy();
  });

  test("editing clears messages", async () => {
    mockUpdateProfile.mockRejectedValue(new ApiError("Tên không hợp lệ", 400, {}));
    const screen = renderWithTheme(<ProfileUpdateScreen />);

    fireEvent.changeText(screen.getByDisplayValue("Tester"), "New Name");
    await act(async () => {
      fireEvent.press(screen.getByText("Lưu thay đổi"));
    });

    fireEvent.changeText(screen.getByDisplayValue("New Name"), "Another");
    expect(screen.queryByText("Tên không hợp lệ")).toBeNull();
  });
});
