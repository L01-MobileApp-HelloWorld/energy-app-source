import { fireEvent, render } from "@testing-library/react-native";
import React from "react";

import { SortSheet } from "@/components/ui/sort-sheet";
import { mockColors } from "../test-helpers";

jest.mock("@/hooks/use-app-theme", () => ({
  useAppColors: () => mockColors,
}));

describe("SortSheet", () => {
  test("renders options when visible", () => {
    const screen = render(
      <SortSheet
        visible
        selected="createdAt:desc"
        onSelect={jest.fn()}
        onClose={jest.fn()}
      />
    );

    expect(screen.getByText("Sắp xếp theo")).toBeTruthy();
    expect(screen.getByText("Mới nhất trước")).toBeTruthy();
    expect(screen.getByText("Cũ nhất trước")).toBeTruthy();
  });

  test("does not render title when hidden", () => {
    const screen = render(
      <SortSheet
        visible={false}
        selected="createdAt:desc"
        onSelect={jest.fn()}
        onClose={jest.fn()}
      />
    );

    expect(screen.queryByText("Sắp xếp theo")).toBeNull();
  });

  test("pressing backdrop closes sheet", () => {
    const onClose = jest.fn();
    const screen = render(
      <SortSheet
        visible
        selected="createdAt:desc"
        onSelect={jest.fn()}
        onClose={onClose}
      />
    );

    screen.UNSAFE_getByType(require("react-native").Modal).props.onRequestClose();

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("pressing close button closes sheet", () => {
    const onClose = jest.fn();
    const screen = render(
      <SortSheet
        visible
        selected="createdAt:desc"
        onSelect={jest.fn()}
        onClose={onClose}
      />
    );

    fireEvent.press(screen.UNSAFE_getAllByType(require("react-native").TouchableOpacity)[0]);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("selecting option calls onSelect then onClose", () => {
    const onSelect = jest.fn();
    const onClose = jest.fn();
    const screen = render(
      <SortSheet
        visible
        selected="createdAt:desc"
        onSelect={onSelect}
        onClose={onClose}
      />
    );

    fireEvent.press(screen.getByText("Cũ nhất trước"));

    expect(onSelect).toHaveBeenCalledWith("createdAt:asc");
    expect(onClose).toHaveBeenCalled();
  });
});
