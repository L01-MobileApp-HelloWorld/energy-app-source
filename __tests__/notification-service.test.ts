import { PermissionsAndroid } from "react-native";

import { apiClient } from "@/services/api-client";
import {
  clearStoredFcmToken,
  getStoredFcmToken,
  saveFcmToken,
} from "@/services/auth-service";
import {
  handleNotificationNavigation,
  registerFcmToken,
  subscribeToFcmTokenRefresh,
  unregisterFcmToken,
} from "@/services/notification-service";

const { router } = require("expo-router");
const messaging = require("@react-native-firebase/messaging").default;

describe("notification-service", () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await clearStoredFcmToken();
  });

  test("registers a fresh FCM token with the backend", async () => {
    jest.spyOn(apiClient, "post").mockResolvedValue({
      success: true,
      data: { fcmTokens: ["fresh-token"] },
    });
    PermissionsAndroid.request = jest.fn(() =>
      Promise.resolve(PermissionsAndroid.RESULTS.GRANTED)
    );
    messaging().getToken.mockResolvedValue("fresh-token");

    const token = await registerFcmToken();

    expect(token).toBe("fresh-token");
    expect(messaging().registerDeviceForRemoteMessages).toHaveBeenCalled();
    expect(apiClient.post).toHaveBeenCalledWith("/auth/fcm-token", {
      token: "fresh-token",
    });
    await expect(getStoredFcmToken()).resolves.toBe("fresh-token");
  });

  test("skips backend registration when the stored token matches", async () => {
    await saveFcmToken("same-token");
    const postSpy = jest.spyOn(apiClient, "post").mockResolvedValue({
      success: true,
      data: { fcmTokens: ["same-token"] },
    });
    messaging().getToken.mockResolvedValue("same-token");

    const token = await registerFcmToken();

    expect(token).toBe("same-token");
    expect(postSpy).not.toHaveBeenCalled();
  });

  test("subscribes token refresh and re-registers the new token", async () => {
    const postSpy = jest.spyOn(apiClient, "post").mockResolvedValue({
      success: true,
      data: { fcmTokens: ["rotated-token"] },
    });
    let refreshHandler: ((token: string) => Promise<void>) | undefined;

    messaging().onTokenRefresh.mockImplementation((handler: (token: string) => Promise<void>) => {
      refreshHandler = handler;
      return jest.fn();
    });

    const unsubscribe = subscribeToFcmTokenRefresh();
    await refreshHandler?.("rotated-token");

    expect(postSpy).toHaveBeenCalledWith("/auth/fcm-token", {
      token: "rotated-token",
    });
    await expect(getStoredFcmToken()).resolves.toBe("rotated-token");
    unsubscribe();
  });

  test("deletes the registered token from the backend and local storage", async () => {
    await saveFcmToken("delete-me");
    jest.spyOn(apiClient, "delete").mockResolvedValue({ success: true });

    await unregisterFcmToken();

    expect(apiClient.delete).toHaveBeenCalledWith("/auth/fcm-token", {
      body: { token: "delete-me" },
    });
    await expect(getStoredFcmToken()).resolves.toBeNull();
  });

  test("routes survey deep links from notification payloads", () => {
    handleNotificationNavigation({
      deepLink: "energyappsource://survey",
      data: { type: "daily-reminder" },
    });

    expect(router.push).toHaveBeenCalledWith("/survey");
  });
});
