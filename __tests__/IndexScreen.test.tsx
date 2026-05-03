import { render } from "@testing-library/react-native";
import React from "react";

const mockRedirect = jest.fn((_props: any) => null);

jest.mock("expo-router", () => ({
  Redirect: (props: any) => {
    mockRedirect(props);
    return null;
  },
}));

const IndexScreen = require("../app/index").default;

describe("IndexScreen", () => {
  beforeEach(() => {
    mockRedirect.mockClear();
  });

  test("redirects users to onboarding", () => {
    render(<IndexScreen />);

    expect(mockRedirect).toHaveBeenCalledWith(
      expect.objectContaining({ href: "/onboarding" })
    );
  });
});
