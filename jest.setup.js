import "@testing-library/jest-native/extend-expect";

const asyncStorageState = {};

// mock expo router
jest.mock("expo-router", () => ({
  Link: "Link",
  Stack: "Stack",
  useRouter: () => ({ push: jest.fn() }),
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
