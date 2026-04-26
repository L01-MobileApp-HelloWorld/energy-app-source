import { render } from "@testing-library/react-native";
import React from "react";

const mockLink = jest.fn(({ children }: any) => children);

jest.mock("expo-router", () => ({
  Link: (props: any) => {
    mockLink(props);
    return <>{props.children}</>;
  },
}));

jest.mock("@/components/themed-text", () => ({
  ThemedText: ({ children, ...props }: any) => {
    const { Text } = require("react-native");
    return <Text {...props}>{children}</Text>;
  },
}));

jest.mock("@/components/themed-view", () => ({
  ThemedView: ({ children, ...props }: any) => {
    const { View } = require("react-native");
    return <View {...props}>{children}</View>;
  },
}));

const ModalScreen = require("../app/modal").default;

describe("ModalScreen", () => {
  beforeEach(() => {
    mockLink.mockClear();
  });

  test("renders modal title", () => {
    const { getByText } = render(<ModalScreen />);
    expect(getByText("This is a modal")).toBeTruthy();
  });

  test("renders home navigation link text", () => {
    const { getByText } = render(<ModalScreen />);
    expect(getByText("Go to home screen")).toBeTruthy();
  });

  test("configures dismiss link back to root", () => {
    render(<ModalScreen />);

    expect(mockLink).toHaveBeenCalledWith(
      expect.objectContaining({ href: "/", dismissTo: true })
    );
  });
});
