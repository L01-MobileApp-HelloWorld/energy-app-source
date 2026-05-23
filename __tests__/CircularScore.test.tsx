import { render } from "@testing-library/react-native";
import React from "react";

import { CircularScore } from "@/components/ui/circular-score";
import { mockColors } from "../test-helpers";

jest.mock("react-native-svg", () => ({
  __esModule: true,
  default: ({ children, ...props }: any) => {
    const React = require("react");
    const { View } = require("react-native");
    const Comp = ({ children: innerChildren, ...innerProps }: any) => (
      <View {...innerProps}>{innerChildren}</View>
    );
    Comp.displayName = "MockSvg";
    return <Comp {...props}>{children}</Comp>;
  },
  Circle: (props: any) => {
    const React = require("react");
    const { View } = require("react-native");
    const Comp = (innerProps: any) => <View {...innerProps} />;
    Comp.displayName = "MockCircle";
    return <Comp {...props} />;
  },
}));

describe("CircularScore", () => {
  test("renders score and suffix", () => {
    const screen = render(
      <CircularScore score={2.5} color="#00ff00" colors={mockColors} />
    );

    expect(screen.getByText("2.5")).toBeTruthy();
    expect(screen.getByText("/ 5.0")).toBeTruthy();
  });

  test.each([0, 2.5, 5])("renders score variant %s with colored progress circle", (score) => {
    const screen = render(
      <CircularScore score={score} color="#00ff00" colors={mockColors} />
    );

    expect(screen.getByText(score.toFixed(1))).toBeTruthy();

    const progressCircle = screen.UNSAFE_getAllByProps({ stroke: "#00ff00" })[0];
    expect(progressCircle.props.stroke).toBe("#00ff00");
    expect(progressCircle.props.strokeDasharray).toBeTruthy();
  });
});
