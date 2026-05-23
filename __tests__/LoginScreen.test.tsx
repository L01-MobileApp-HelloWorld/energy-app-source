import { act, fireEvent, waitFor } from "@testing-library/react-native";
import React from "react";

import { ApiError } from "@/services/api-client";
import { renderWithTheme } from "../test-utils";
import { MockSafeAreaView, createDeferredPromise, mockRouter } from "../test-helpers";

const mockLogin = jest.fn();
const mockUseAuth = jest.fn(() => ({
  login: mockLogin,
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

const LoginScreen = require("../app/login").default;

describe("LoginScreen", () => {
  beforeEach(() => {
    mockLogin.mockReset();
    mockRouter.push.mockClear();
    mockRouter.replace.mockClear();
  });

  test("renders default state", () => {
    const screen = renderWithTheme(<LoginScreen />);

    expect(screen.getAllByText("Đăng nhập").length).toBe(2);
    expect(screen.getByText("Hiểu rõ bản thân mỗi ngày")).toBeTruthy();
    expect(screen.getByPlaceholderText("you@example.com")).toBeTruthy();
    expect(screen.getByPlaceholderText("••••••••")).toBeTruthy();
  });

  test("submit is disabled when inputs are empty", () => {
    const screen = renderWithTheme(<LoginScreen />);

    fireEvent.press(screen.getAllByText("Đăng nhập")[1]);

    expect(mockLogin).not.toHaveBeenCalled();
  });

  test("navigates to register", () => {
    const screen = renderWithTheme(<LoginScreen />);

    fireEvent.press(screen.getByText("Đăng ký"));

    expect(mockRouter.push).toHaveBeenCalledWith("/register");
  });

  test("toggles password visibility", () => {
    const screen = renderWithTheme(<LoginScreen />);
    const passwordInput = screen.getByPlaceholderText("••••••••");

    expect(passwordInput.props.secureTextEntry).toBe(true);

    fireEvent.press(screen.getByText("eye-off-outline"));

    expect(screen.getByPlaceholderText("••••••••").props.secureTextEntry).toBe(false);
  });

  test("successful login redirects to tabs", async () => {
    mockLogin.mockResolvedValue(undefined);
    const screen = renderWithTheme(<LoginScreen />);

    fireEvent.changeText(screen.getByPlaceholderText("you@example.com"), "user@example.com");
    fireEvent.changeText(screen.getByPlaceholderText("••••••••"), "Password1");

    await act(async () => {
      fireEvent.press(screen.getAllByText("Đăng nhập")[1]);
    });

    expect(mockLogin).toHaveBeenCalledWith("user@example.com", "Password1");
    expect(mockRouter.replace).toHaveBeenCalledWith("/(tabs)");
  });

  test("shows ApiError message", async () => {
    mockLogin.mockRejectedValue(new ApiError("Sai mật khẩu", 401, {}));
    const screen = renderWithTheme(<LoginScreen />);

    fireEvent.changeText(screen.getByPlaceholderText("you@example.com"), "user@example.com");
    fireEvent.changeText(screen.getByPlaceholderText("••••••••"), "Password1");

    await act(async () => {
      fireEvent.press(screen.getAllByText("Đăng nhập")[1]);
    });

    expect(screen.getByText("Sai mật khẩu")).toBeTruthy();
  });

  test("shows fallback network error", async () => {
    mockLogin.mockRejectedValue(new Error("offline"));
    const screen = renderWithTheme(<LoginScreen />);

    fireEvent.changeText(screen.getByPlaceholderText("you@example.com"), "user@example.com");
    fireEvent.changeText(screen.getByPlaceholderText("••••••••"), "Password1");

    await act(async () => {
      fireEvent.press(screen.getAllByText("Đăng nhập")[1]);
    });

    expect(screen.getByText("Không thể kết nối đến server. Vui lòng thử lại.")).toBeTruthy();
  });

  test("editing input clears error", async () => {
    mockLogin.mockRejectedValue(new ApiError("Sai mật khẩu", 401, {}));
    const screen = renderWithTheme(<LoginScreen />);

    fireEvent.changeText(screen.getByPlaceholderText("you@example.com"), "user@example.com");
    fireEvent.changeText(screen.getByPlaceholderText("••••••••"), "Password1");

    await act(async () => {
      fireEvent.press(screen.getAllByText("Đăng nhập")[1]);
    });

    fireEvent.changeText(screen.getByPlaceholderText("you@example.com"), "next@example.com");

    expect(screen.queryByText("Sai mật khẩu")).toBeNull();
  });

  test("shows loading state and prevents double submit", async () => {
    const deferred = createDeferredPromise<void>();
    mockLogin.mockReturnValue(deferred.promise);
    const screen = renderWithTheme(<LoginScreen />);

    fireEvent.changeText(screen.getByPlaceholderText("you@example.com"), "user@example.com");
    fireEvent.changeText(screen.getByPlaceholderText("••••••••"), "Password1");

    fireEvent.press(screen.getAllByText("Đăng nhập")[1]);
    fireEvent.press(screen.UNSAFE_getByType(require("react-native").ActivityIndicator).parent);

    expect(mockLogin).toHaveBeenCalledTimes(1);

    await act(async () => {
      deferred.resolve();
      await deferred.promise;
    });
  });
});
