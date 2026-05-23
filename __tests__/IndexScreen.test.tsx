import React from "react";

import { renderWithTheme } from "../test-utils";

const mockRedirect = jest.fn((_props: any) => null);
const mockUseAuth = jest.fn(() => ({
  isAuthenticated: false,
  isLoading: false,
}));

jest.mock("expo-router", () => ({
  Redirect: (props: any) => {
    mockRedirect(props);
    return null;
  },
}));

jest.mock("@/hooks/auth-context", () => ({
  useAuth: () => mockUseAuth(),
}));

const IndexScreen = require("../app/index").default;

describe("IndexScreen", () => {
  beforeEach(() => {
    mockRedirect.mockClear();
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
    });
  });

  test("redirects users to onboarding", () => {
    renderWithTheme(<IndexScreen />);

    expect(mockRedirect).toHaveBeenCalledWith(
      expect.objectContaining({ href: "/onboarding" })
    );
  });
});
