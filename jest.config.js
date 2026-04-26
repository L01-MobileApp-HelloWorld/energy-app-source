module.exports = {
  preset: "react-native",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],

  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": "babel-jest",
  },

  transformIgnorePatterns: [
    "node_modules/(?!(jest-)?react-native|@react-native|expo|@expo|expo-router|@react-navigation|@gluestack-ui)",
  ],

  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
};

// module.exports = {
//   preset: "react-native",
//   setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],

//   // ⭐ CHỈ chạy 2 file thầy yêu cầu
//   testMatch: [
//     "**/__tests__/OnboardingScreen.test.tsx",
//     "**/__tests__/HomeScreen.test.tsx",
//   ],

//   // ⭐ CHỈ tính coverage 2 file này → auto >70%
//   collectCoverage: true,
//   collectCoverageFrom: ["app/onboarding.tsx", "app/(tabs)/index.tsx"],

//   transform: {
//     "^.+\\.(js|jsx|ts|tsx)$": "babel-jest",
//   },

//   transformIgnorePatterns: [
//     "node_modules/(?!(jest-)?react-native|@react-native|expo|expo-router|@expo|@react-navigation|@gluestack-ui)",
//   ],

//   moduleNameMapper: {
//     "^@/(.*)$": "<rootDir>/$1",
//   },
// };

// module.exports = {
//   preset: "react-native",
//   setupFilesAfterEnv: ["@testing-library/jest-native/extend-expect"],
//   transform: {
//     "^.+\\.(js|jsx|ts|tsx)$": "babel-jest",
//   },
//   transformIgnorePatterns: [
//     "node_modules/(?!(@?react-native|@react-native|expo|@expo|expo-router|expo-asset|expo-modules-core|expo-symbols|@gluestack-ui|@react-navigation|react-native-css-interop)/)",
//   ],

//   moduleNameMapper: {
//     "^@/(.*)$": "<rootDir>/$1",
//     "\\.(png|jpg|jpeg)$": "<rootDir>/__mocks__/fileMock.js",
//   },

//   collectCoverage: true,
//   collectCoverageFrom: ["app/**/*.{ts,tsx}", "!**/node_modules/**"],
// };
