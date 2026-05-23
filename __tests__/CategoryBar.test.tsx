import { render } from "@testing-library/react-native";
import React from "react";

import { CategoryBar } from "@/components/ui/category-bar";
import { mockColors } from "../test-helpers";

describe("CategoryBar", () => {
  test("renders label and score", () => {
    const screen = render(
      <CategoryBar
        label="Năng lượng"
        score={2.5}
        color="#ff0000"
        colors={mockColors}
      />
    );

    expect(screen.getByText("Năng lượng")).toBeTruthy();
    expect(screen.getByText("2.5")).toBeTruthy();
  });

  test("uses width proportional to score", () => {
    const screen = render(
      <CategoryBar
        label="Năng lượng"
        score={2.5}
        color="#ff0000"
        colors={mockColors}
      />
    );

    const views = screen.UNSAFE_getAllByType(require("react-native").View);
    expect(views[3].props.style.width).toBe("50%");
    expect(views[3].props.style.backgroundColor).toBe("#ff0000");
  });
});
