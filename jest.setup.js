import "@testing-library/jest-native/extend-expect";
import { PermissionsAndroid, Platform } from "react-native";

const asyncStorageState = {};
const secureStoreState = {};

const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
};

const mockMessagingInstance = {
  registerDeviceForRemoteMessages: jest.fn(() => Promise.resolve()),
  getToken: jest.fn(() => Promise.resolve("mock-fcm-token")),
  getInitialNotification: jest.fn(() => Promise.resolve(null)),
  onNotificationOpenedApp: jest.fn(() => jest.fn()),
  onTokenRefresh: jest.fn(() => jest.fn()),
};

// mock expo router
jest.mock("expo-router", () => ({
  Link: "Link",
  Stack: "Stack",
  router: mockRouter,
  useRouter: () => mockRouter,
}));

jest.mock("@/hooks/use-color-scheme", () => ({
  useColorScheme: jest.fn(() => "light"),
}));

jest.mock("@react-native-async-storage/async-storage", () => ({
  __esModule: true,
  default: {
    getItem: jest.fn((key) => Promise.resolve(key in asyncStorageState ? asyncStorageState[key] : null)),
    setItem: jest.fn((key, value) => {
      asyncStorageState[key] = value;
      return Promise.resolve();
    }),
    removeItem: jest.fn((key) => {
      delete asyncStorageState[key];
      return Promise.resolve();
    }),
    clear: jest.fn(() => {
      Object.keys(asyncStorageState).forEach((key) => delete asyncStorageState[key]);
      return Promise.resolve();
    }),
  },
}));

jest.mock("expo-secure-store", () => ({
  setItemAsync: jest.fn((key, value) => {
    secureStoreState[key] = value;
    return Promise.resolve();
  }),
  getItemAsync: jest.fn((key) =>
    Promise.resolve(key in secureStoreState ? secureStoreState[key] : null)
  ),
  deleteItemAsync: jest.fn((key) => {
    delete secureStoreState[key];
    return Promise.resolve();
  }),
}));

// mock expo modules
jest.mock("expo-status-bar", () => ({
  StatusBar: () => null,
}));

jest.mock("expo-image", () => ({
  Image: "Image",
}));

jest.mock("@expo/vector-icons", () => {
  const React = require("react");
  const { Text } = require("react-native");

  const Icon = ({ name, ...props }) => <Text {...props}>{name}</Text>;

  return {
    Ionicons: Icon,
    MaterialIcons: Icon,
    FontAwesome: Icon,
  };
});

jest.mock("@react-native-firebase/messaging", () => {
  const messaging = () => mockMessagingInstance;
  messaging.AuthorizationStatus = {
    AUTHORIZED: 1,
    PROVISIONAL: 2,
    DENIED: 0,
  };

  return {
    __esModule: true,
    default: messaging,
  };
});

PermissionsAndroid.request = jest.fn(() =>
  Promise.resolve(PermissionsAndroid.RESULTS.GRANTED)
);

Object.defineProperty(Platform, "OS", {
  configurable: true,
  get: () => "android",
});

Object.defineProperty(Platform, "Version", {
  configurable: true,
  get: () => 34,
});

// import "@testing-library/jest-native/extend-expect";

// // Mock expo-router toàn cục
// jest.mock("expo-router", () => ({
//   Stack: () => null,
//   Tabs: () => null,
//   Link: ({ children }) => children,
//   useRouter: () => ({
//     push: jest.fn(),
//     replace: jest.fn(),
//   }),
// }));

// // Mock expo-status-bar
// jest.mock("expo-status-bar", () => ({
//   StatusBar: () => null,
// }));

// // Mock expo-image
// jest.mock("expo-image", () => ({
//   Image: () => null,
// }));

// // Fix lỗi EventEmitter
// jest.mock("expo-modules-core", () => ({
//   EventEmitter: jest.fn(),
// }));
