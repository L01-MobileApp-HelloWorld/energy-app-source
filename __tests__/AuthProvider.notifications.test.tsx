import { act, fireEvent, render, waitFor } from "@testing-library/react-native";
import React from "react";
import { Pressable, Text, View } from "react-native";

import { AuthProvider, useAuth } from "@/hooks/auth-context";
import { ThemePreferencesProvider } from "@/hooks/use-app-theme";
import { apiClient } from "@/services/api-client";
import {
  clearAuth,
  clearStoredFcmToken,
  getStoredFcmToken,
} from "@/services/auth-service";

function AuthProbe() {
  const { isAuthenticated, isLoading, login, logout } = useAuth();

  return (
    <View>
      <Text>{`auth:${String(isAuthenticated)}`}</Text>
      <Text>{`loading:${String(isLoading)}`}</Text>
      <Pressable onPress={() => void login("tester@example.com", "Password1")}>
        <Text>login</Text>
      </Pressable>
      <Pressable onPress={() => void logout()}>
        <Text>logout</Text>
      </Pressable>
    </View>
  );
}

describe("AuthProvider FCM integration", () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    apiClient.clearAuthToken();
    await clearAuth();
    await clearStoredFcmToken();
  });

  test("registers the FCM token after login", async () => {
    jest.spyOn(apiClient, "post").mockImplementation((endpoint) => {
      if (endpoint === "/auth/login") {
        return Promise.resolve({
          success: true,
          data: {
            user: {
              _id: "user-1",
              username: "tester",
              email: "tester@example.com",
              preferences: {},
            },
            token: "access-token",
            refreshToken: "refresh-token",
          },
        });
      }

      if (endpoint === "/auth/fcm-token") {
        return Promise.resolve({
          success: true,
          data: { fcmTokens: ["mock-fcm-token"] },
        });
      }

      if (endpoint === "/auth/logout") {
        return Promise.resolve({ success: true });
      }

      throw new Error(`Unexpected POST ${endpoint}`);
    });

    const screen = render(
      <ThemePreferencesProvider>
        <AuthProvider>
          <AuthProbe />
        </AuthProvider>
      </ThemePreferencesProvider>
    );

    await waitFor(() => expect(screen.getByText("loading:false")).toBeTruthy());

    await act(async () => {
      fireEvent.press(screen.getByText("login"));
    });

    await waitFor(() => expect(screen.getByText("auth:true")).toBeTruthy());
    await waitFor(() =>
      expect(apiClient.post).toHaveBeenCalledWith("/auth/fcm-token", {
        token: "mock-fcm-token",
      })
    );
    await expect(getStoredFcmToken()).resolves.toBe("mock-fcm-token");
  });

  test("continues logout cleanup when FCM token deletion fails", async () => {
    jest.spyOn(apiClient, "post").mockImplementation((endpoint) => {
      if (endpoint === "/auth/login") {
        return Promise.resolve({
          success: true,
          data: {
            user: {
              _id: "user-1",
              username: "tester",
              email: "tester@example.com",
              preferences: {},
            },
            token: "access-token",
            refreshToken: "refresh-token",
          },
        });
      }

      if (endpoint === "/auth/fcm-token") {
        return Promise.resolve({
          success: true,
          data: { fcmTokens: ["mock-fcm-token"] },
        });
      }

      if (endpoint === "/auth/logout") {
        return Promise.resolve({ success: true });
      }

      throw new Error(`Unexpected POST ${endpoint}`);
    });

    jest.spyOn(apiClient, "delete").mockRejectedValue(new Error("delete failed"));

    const screen = render(
      <ThemePreferencesProvider>
        <AuthProvider>
          <AuthProbe />
        </AuthProvider>
      </ThemePreferencesProvider>
    );

    await waitFor(() => expect(screen.getByText("loading:false")).toBeTruthy());

    await act(async () => {
      fireEvent.press(screen.getByText("login"));
    });

    await waitFor(() => expect(screen.getByText("auth:true")).toBeTruthy());

    await act(async () => {
      fireEvent.press(screen.getByText("logout"));
    });

    await waitFor(() => expect(screen.getByText("auth:false")).toBeTruthy());
    expect(apiClient.delete).toHaveBeenCalledWith("/auth/fcm-token", {
      body: { token: "mock-fcm-token" },
    });
    await expect(getStoredFcmToken()).resolves.toBeNull();
  });
});
