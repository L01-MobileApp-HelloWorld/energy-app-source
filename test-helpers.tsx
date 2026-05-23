import React from "react";
import { View } from "react-native";

import { getAppColors } from "@/constants/theme";

export const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
};

export const mockColors = getAppColors("light");

export const mockUser = {
  _id: "user-1",
  username: "tester",
  displayName: "Tester",
  email: "tester@example.com",
  preferences: {
    darkMode: false,
    notificationsEnabled: true,
    reminderTime: "17:00",
    reminderFrequency: "daily",
    customReminderDays: [],
  },
};

export const MockSafeAreaView = ({ children, ...props }: any) => (
  <View {...props}>{children}</View>
);

export function createDeferredPromise<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: unknown) => void;

  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
}
