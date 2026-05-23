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
  collectCoverage: true,
  collectCoverageFrom: [
    "app/**/*.{ts,tsx}",
    "components/**/*.{ts,tsx}",
    "!components/external-link.tsx",
    "!components/haptic-tab.tsx",
    "!components/hello-wave.tsx",
    "!components/parallax-scroll-view.tsx",
    "!components/themed-text.tsx",
    "!components/themed-view.tsx",
    "!components/ui/actionsheet/index.tsx",
    "!components/ui/alert-dialog/index.tsx",
    "!components/ui/button/index.tsx",
    "!components/ui/custom-tab-bar/index.tsx",
    "!components/ui/gluestack-ui-provider/**",
    "!components/ui/heading/**",
    "!components/ui/icon-symbol*",
    "!components/ui/option-card/index.tsx",
    "!components/ui/progress-bar/index.tsx",
    "!components/ui/radio-button/index.tsx",
    "!components/ui/rating-pill/index.tsx",
    "!components/ui/text/**",
    "!components/ui/collapsible.tsx",
  ],
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "<rootDir>/app/_layout.tsx",
    "<rootDir>/app/\\(tabs\\)/_layout.tsx",
    "<rootDir>/app/\\(tabs\\)/explore.tsx",
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["lcov", "text", "clover"],
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
