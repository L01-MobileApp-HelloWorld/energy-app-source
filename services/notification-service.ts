import type { FirebaseMessagingTypes } from "@react-native-firebase/messaging";
import { router } from "expo-router";
import { PermissionsAndroid, Platform } from "react-native";

import { apiClient } from "@/services/api-client";
import {
  clearStoredFcmToken,
  getStoredFcmToken,
  saveFcmToken,
} from "@/services/auth-service";
import type { IFcmTokenResponse, INotificationPayload } from "@/typescript";

const SURVEY_ROUTE = "/survey";
const APP_SCHEME = "energyappsource:";

type MessagingModule =
  typeof import("@react-native-firebase/messaging").default;

function getMessaging(): MessagingModule | null {
  try {
    const messagingModule = require("@react-native-firebase/messaging");

    return messagingModule.default;
  } catch {
    return null;
  }
}

function toOptionalString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function normalizeDeepLink(deepLink?: string | null): string | null {
  if (!deepLink) {
    return null;
  }

  if (deepLink.startsWith("/")) {
    return deepLink;
  }

  if (deepLink.startsWith(APP_SCHEME + "//")) {
    const path = deepLink.slice(`${APP_SCHEME}//`.length);
    return path.startsWith("/") ? path : `/${path}`;
  }

  return null;
}

function buildNotificationPayload(
  remoteMessage: FirebaseMessagingTypes.RemoteMessage | null,
): INotificationPayload | null {
  if (!remoteMessage) {
    return null;
  }

  return {
    title: remoteMessage.notification?.title,
    body: remoteMessage.notification?.body,
    deepLink: toOptionalString(remoteMessage.data?.deepLink),
    data: {
      type: toOptionalString(remoteMessage.data?.type),
      reminderTime: toOptionalString(remoteMessage.data?.reminderTime),
      reminderFrequency: toOptionalString(
        remoteMessage.data?.reminderFrequency,
      ),
    },
  };
}

export async function requestAndroidNotificationPermission(): Promise<boolean> {
  if (Platform.OS !== "android") {
    return false;
  }

  if (Platform.Version < 33) {
    return true;
  }

  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
  );

  return granted === PermissionsAndroid.RESULTS.GRANTED;
}

export async function registerFcmToken(): Promise<string | null> {
  if (Platform.OS !== "android") {
    return null;
  }

  const messaging = getMessaging();
  if (!messaging) {
    return null;
  }

  const hasPermission = await requestAndroidNotificationPermission();
  if (!hasPermission) {
    return null;
  }

  await messaging().registerDeviceForRemoteMessages();
  const nextToken = await messaging().getToken();
  const currentToken = await getStoredFcmToken();

  if (currentToken === nextToken) {
    return nextToken;
  }

  await apiClient.post<IFcmTokenResponse>("/auth/fcm-token", {
    token: nextToken,
  });
  await saveFcmToken(nextToken);

  return nextToken;
}

export async function unregisterFcmToken(token?: string | null): Promise<void> {
  const tokenToDelete = token ?? (await getStoredFcmToken());

  if (!tokenToDelete) {
    return;
  }

  try {
    await apiClient.delete<{ success: boolean }>("/auth/fcm-token", {
      body: { token: tokenToDelete },
    });
  } finally {
    await clearStoredFcmToken();
  }
}

export function subscribeToFcmTokenRefresh(): () => void {
  if (Platform.OS !== "android") {
    return () => undefined;
  }

  const messaging = getMessaging();
  if (!messaging) {
    return () => undefined;
  }

  return messaging().onTokenRefresh(async (token) => {
    await apiClient.post<IFcmTokenResponse>("/auth/fcm-token", { token });
    await saveFcmToken(token);
  });
}

export function handleNotificationNavigation(
  payload: INotificationPayload | null,
): void {
  const normalizedRoute = normalizeDeepLink(payload?.deepLink);

  if (normalizedRoute === SURVEY_ROUTE) {
    router.push(SURVEY_ROUTE);
  }
}

export async function handleInitialNotification(): Promise<void> {
  if (Platform.OS !== "android") {
    return;
  }

  const messaging = getMessaging();
  if (!messaging) {
    return;
  }

  const payload = buildNotificationPayload(
    await messaging().getInitialNotification(),
  );
  handleNotificationNavigation(payload);
}

export function subscribeToNotificationOpens(): () => void {
  if (Platform.OS !== "android") {
    return () => undefined;
  }

  const messaging = getMessaging();
  if (!messaging) {
    return () => undefined;
  }

  return messaging().onNotificationOpenedApp((remoteMessage) => {
    handleNotificationNavigation(buildNotificationPayload(remoteMessage));
  });
}
