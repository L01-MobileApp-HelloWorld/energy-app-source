import { render } from "@testing-library/react-native";
import React from "react";

import { StateBadge } from "@/components/ui/state-badge";

describe("StateBadge", () => {
  test.each([
    ["exhausted", "KIỆT SỨC"],
    ["tired", "MỆT MỎI"],
    ["lazy", "LƯỜI CÓ DEADLINE"],
    ["ready", "SẴN SÀNG"],
    ["focused", "TẬP TRUNG"],
    ["unmotivated", "THIẾU ĐỘNG LỰC"],
  ] as const)("renders label for %s", (state, label) => {
    const screen = render(<StateBadge state={state} />);

    expect(screen.getByText(label)).toBeTruthy();
  });

  test("merges custom className", () => {
    const screen = render(<StateBadge state="ready" className="extra-class" />);

    const view = screen.UNSAFE_getByType(require("react-native").View);
    expect(view.props.className).toContain("extra-class");
  });
});
