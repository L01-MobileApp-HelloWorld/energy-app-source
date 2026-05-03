import "@testing-library/jest-native/extend-expect";

// mock expo router
jest.mock("expo-router", () => ({
  Link: "Link",
  Stack: "Stack",
  useRouter: () => ({ push: jest.fn() }),
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
