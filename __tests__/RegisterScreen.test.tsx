import { act, fireEvent } from "@testing-library/react-native";
import React from "react";

import { ApiError } from "@/services/api-client";
import { renderWithTheme } from "../test-utils";
import { MockSafeAreaView, mockRouter } from "../test-helpers";

const mockRegister = jest.fn();
const mockUseAuth = jest.fn(() => ({
  register: mockRegister,
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

const RegisterScreen = require("../app/register").default;

describe("RegisterScreen", () => {
  beforeEach(() => {
    mockRegister.mockReset();
    mockRouter.back.mockClear();
    mockRouter.replace.mockClear();
    jest.spyOn(console, "log").mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  function fillValid(screen: any) {
    fireEvent.changeText(screen.getByPlaceholderText("Tên sẽ hiển thị trong ứng dụng"), "Tester");
    fireEvent.changeText(screen.getByPlaceholderText("you@example.com"), "user@example.com");
    fireEvent.changeText(screen.getByPlaceholderText("Ít nhất 6 ký tự, 1 chữ hoa, 1 số"), "Password1");
    fireEvent.changeText(screen.getByPlaceholderText("••••••••"), "Password1");
  }

  test("renders fields and cta", () => {
    const screen = renderWithTheme(<RegisterScreen />);
    expect(screen.getByText("Đăng ký")).toBeTruthy();
    expect(screen.getByText("Tạo tài khoản")).toBeTruthy();
  });

  test("back button navigates back", () => {
    const screen = renderWithTheme(<RegisterScreen />);
    fireEvent.press(screen.getByLabelText("Quay lại từ màn Đăng ký"));
    expect(mockRouter.back).toHaveBeenCalled();
  });

  test("login link redirects to login", () => {
    const screen = renderWithTheme(<RegisterScreen />);
    fireEvent.press(screen.getByText("Đăng nhập"));
    expect(mockRouter.replace).toHaveBeenCalledWith("/login");
  });

  test("validates mismatched passwords", async () => {
    const screen = renderWithTheme(<RegisterScreen />);
    fillValid(screen);
    fireEvent.changeText(screen.getByPlaceholderText("••••••••"), "Password2");

    await act(async () => {
      fireEvent.press(screen.getByText("Tạo tài khoản"));
    });

    expect(screen.getByText("Mật khẩu xác nhận không khớp")).toBeTruthy();
  });

  test("validates uppercase rule", async () => {
    const screen = renderWithTheme(<RegisterScreen />);
    fireEvent.changeText(screen.getByPlaceholderText("you@example.com"), "user@example.com");
    fireEvent.changeText(screen.getByPlaceholderText("Ít nhất 6 ký tự, 1 chữ hoa, 1 số"), "password1");
    fireEvent.changeText(screen.getByPlaceholderText("••••••••"), "password1");

    await act(async () => {
      fireEvent.press(screen.getByText("Tạo tài khoản"));
    });

    expect(screen.getByText("Mật khẩu phải chứa ít nhất 1 chữ hoa")).toBeTruthy();
  });

  test("validates number rule", async () => {
    const screen = renderWithTheme(<RegisterScreen />);
    fireEvent.changeText(screen.getByPlaceholderText("you@example.com"), "user@example.com");
    fireEvent.changeText(screen.getByPlaceholderText("Ít nhất 6 ký tự, 1 chữ hoa, 1 số"), "Password");
    fireEvent.changeText(screen.getByPlaceholderText("••••••••"), "Password");

    await act(async () => {
      fireEvent.press(screen.getByText("Tạo tài khoản"));
    });

    expect(screen.getByText("Mật khẩu phải chứa ít nhất 1 số")).toBeTruthy();
  });

  test("editing clears error", async () => {
    const screen = renderWithTheme(<RegisterScreen />);
    fireEvent.changeText(screen.getByPlaceholderText("you@example.com"), "user@example.com");
    fireEvent.changeText(screen.getByPlaceholderText("Ít nhất 6 ký tự, 1 chữ hoa, 1 số"), "Password");
    fireEvent.changeText(screen.getByPlaceholderText("••••••••"), "Password");

    await act(async () => {
      fireEvent.press(screen.getByText("Tạo tài khoản"));
    });

    fireEvent.changeText(screen.getByPlaceholderText("you@example.com"), "next@example.com");

    expect(screen.queryByText("Mật khẩu phải chứa ít nhất 1 số")).toBeNull();
  });

  test("successful register redirects to tabs", async () => {
    mockRegister.mockResolvedValue(undefined);
    const screen = renderWithTheme(<RegisterScreen />);
    fillValid(screen);

    await act(async () => {
      fireEvent.press(screen.getByText("Tạo tài khoản"));
    });

    expect(mockRegister).toHaveBeenCalledWith("", "Tester", "user@example.com", "Password1");
    expect(mockRouter.replace).toHaveBeenCalledWith("/(tabs)");
  });

  test("shows ApiError and network fallback", async () => {
    mockRegister.mockRejectedValueOnce(new ApiError("Email đã tồn tại", 409, {}));
    const screen = renderWithTheme(<RegisterScreen />);
    fillValid(screen);

    await act(async () => {
      fireEvent.press(screen.getByText("Tạo tài khoản"));
    });
    expect(screen.getByText("Email đã tồn tại")).toBeTruthy();

    mockRegister.mockRejectedValueOnce(new Error("offline"));
    await act(async () => {
      fireEvent.press(screen.getByText("Tạo tài khoản"));
    });
    expect(screen.getByText("Không thể kết nối đến server. Vui lòng thử lại.")).toBeTruthy();
  });
});
