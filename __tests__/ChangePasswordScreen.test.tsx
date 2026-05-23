import { act, fireEvent } from "@testing-library/react-native";
import React from "react";

import { ApiError } from "@/services/api-client";
import { renderWithTheme } from "../test-utils";
import { MockSafeAreaView, mockRouter } from "../test-helpers";

const mockChangePassword = jest.fn();
const mockUseAuth = jest.fn(() => ({
  changePassword: mockChangePassword,
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

const ChangePasswordScreen = require("../app/change-password").default;

describe("ChangePasswordScreen", () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  beforeEach(() => {
    mockChangePassword.mockReset();
    mockRouter.back.mockClear();
  });

  function fillValid(screen: any) {
    const inputs = screen.UNSAFE_getAllByType(require("react-native").TextInput);
    fireEvent.changeText(inputs[0], "OldPass1");
    fireEvent.changeText(inputs[1], "NewPass1");
    fireEvent.changeText(inputs[2], "NewPass1");
  }

  function pressSubmit(screen: any) {
    fireEvent.press(screen.getAllByText("Đổi mật khẩu")[1]);
  }

  test("renders all password fields", () => {
    const screen = renderWithTheme(<ChangePasswordScreen />);
    expect(screen.getByText("Mật khẩu hiện tại")).toBeTruthy();
    expect(screen.getByText("Mật khẩu mới")).toBeTruthy();
    expect(screen.getByText("Xác nhận mật khẩu mới")).toBeTruthy();
  });

  test("validates uppercase, number, mismatch and same password", async () => {
    const screen = renderWithTheme(<ChangePasswordScreen />);
    const inputs = screen.UNSAFE_getAllByType(require("react-native").TextInput);

    fireEvent.changeText(inputs[0], "OldPass1");
    fireEvent.changeText(inputs[1], "newpass1");
    fireEvent.changeText(inputs[2], "newpass1");
    await act(async () => pressSubmit(screen));
    expect(screen.getByText("Mật khẩu mới phải chứa ít nhất 1 chữ hoa")).toBeTruthy();

    fireEvent.changeText(inputs[1], "Newpass");
    fireEvent.changeText(inputs[2], "Newpass");
    await act(async () => pressSubmit(screen));
    expect(screen.getByText("Mật khẩu mới phải chứa ít nhất 1 số")).toBeTruthy();

    fireEvent.changeText(inputs[1], "NewPass1");
    fireEvent.changeText(inputs[2], "Mismatch1");
    await act(async () => pressSubmit(screen));
    expect(screen.getByText("Mật khẩu xác nhận không khớp")).toBeTruthy();

    fireEvent.changeText(inputs[1], "OldPass1");
    fireEvent.changeText(inputs[2], "OldPass1");
    await act(async () => pressSubmit(screen));
    expect(screen.getByText("Mật khẩu mới phải khác mật khẩu hiện tại")).toBeTruthy();
  });

  test("editing clears messages", async () => {
    const screen = renderWithTheme(<ChangePasswordScreen />);
    const inputs = screen.UNSAFE_getAllByType(require("react-native").TextInput);

    fireEvent.changeText(inputs[0], "OldPass1");
    fireEvent.changeText(inputs[1], "newpass1");
    fireEvent.changeText(inputs[2], "newpass1");
    await act(async () => pressSubmit(screen));

    fireEvent.changeText(inputs[1], "OtherPass1");
    expect(screen.queryByText("Mật khẩu mới phải chứa ít nhất 1 chữ hoa")).toBeNull();
  });

  test("success shows message then navigates back", async () => {
    mockChangePassword.mockResolvedValue(undefined);
    const screen = renderWithTheme(<ChangePasswordScreen />);
    fillValid(screen);

    await act(async () => {
      pressSubmit(screen);
    });

    expect(screen.getByText("Đổi mật khẩu thành công")).toBeTruthy();

    act(() => {
      jest.advanceTimersByTime(900);
    });

    expect(mockRouter.back).toHaveBeenCalled();
  });

  test("shows ApiError and network fallback", async () => {
    mockChangePassword.mockRejectedValueOnce(new ApiError("Sai mật khẩu hiện tại", 400, {}));
    const screen = renderWithTheme(<ChangePasswordScreen />);
    fillValid(screen);

    await act(async () => {
      pressSubmit(screen);
    });
    expect(screen.getByText("Sai mật khẩu hiện tại")).toBeTruthy();

    mockChangePassword.mockRejectedValueOnce(new Error("offline"));
    await act(async () => {
      pressSubmit(screen);
    });
    expect(screen.getByText("Không thể kết nối đến server. Vui lòng thử lại.")).toBeTruthy();
  });
});
