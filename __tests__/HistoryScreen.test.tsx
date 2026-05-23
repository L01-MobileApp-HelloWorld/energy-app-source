import { act, fireEvent, waitFor } from "@testing-library/react-native";
import React from "react";

import { renderWithTheme } from "../test-utils";
import { MockSafeAreaView, mockRouter } from "../test-helpers";

const mockGet = jest.fn();
const mockEntryCard = jest.fn();
let mockSortSheetProps: any = null;

jest.mock("expo-router", () => ({
  router: mockRouter,
}));

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: MockSafeAreaView,
}));

jest.mock("@/services/api-client", () => ({
  apiClient: {
    get: (...args: any[]) => mockGet(...args),
  },
}));

jest.mock("@/components/ui/entry-card", () => ({
  EntryCard: ({ entry }: any) => {
    const { Text } = require("react-native");
    mockEntryCard(entry);
    return <Text>{entry.title}</Text>;
  },
}));

jest.mock("@/components/ui/sort-sheet", () => ({
  SortSheet: (props: any) => {
    const { Text, TouchableOpacity, View } = require("react-native");
    mockSortSheetProps = props;
    if (!props.visible) return null;
    return (
      <View>
        <TouchableOpacity onPress={() => props.onSelect("createdAt:asc")}>
          <Text>sort-asc</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={props.onClose}>
          <Text>close-sort</Text>
        </TouchableOpacity>
      </View>
    );
  },
}));

const HistoryScreen = require("../app/(tabs)/history").default;

describe("HistoryScreen", () => {
  beforeEach(() => {
    mockGet.mockReset();
    mockEntryCard.mockClear();
    mockRouter.push.mockClear();
    mockSortSheetProps = null;
  });

  const page1 = {
    success: true,
    data: {
      histories: [
        {
          _id: "h1",
          userId: "u1",
          state: "exhausted",
          scores: { energy: 20, work: 40, psychology: 60, environment: 80, total: 50 },
          stateDetails: { name: "Kiệt sức" },
          createdAt: "2026-05-23T10:00:00.000Z",
        },
      ],
      pagination: { total: 2, page: 1, pages: 2 },
    },
  };

  const page2 = {
    success: true,
    data: {
      histories: [
        {
          _id: "h2",
          userId: "u1",
          state: "ready",
          scores: { energy: 90, work: 80, psychology: 70, environment: 60, total: 75 },
          stateDetails: { name: "Sẵn sàng" },
          createdAt: "2026-05-22T10:00:00.000Z",
        },
      ],
      pagination: { total: 2, page: 2, pages: 2 },
    },
  };

  test("renders loading then mapped history entries", async () => {
    mockGet.mockResolvedValue(page1);
    const screen = renderWithTheme(<HistoryScreen />);

    expect(screen.UNSAFE_getByType(require("react-native").ActivityIndicator)).toBeTruthy();
    await waitFor(() => expect(screen.getByText("Kiệt sức")).toBeTruthy());
    expect(mockEntryCard).toHaveBeenCalled();
  });

  test("renders empty state", async () => {
    mockGet.mockResolvedValue({
      success: true,
      data: { histories: [], pagination: { total: 0, page: 1, pages: 1 } },
    });
    const screen = renderWithTheme(<HistoryScreen />);
    await waitFor(() => expect(screen.getByText("Chưa có lịch sử")).toBeTruthy());
  });

  test("renders error and retries", async () => {
    mockGet.mockRejectedValueOnce(new Error("offline")).mockResolvedValueOnce(page1);
    const screen = renderWithTheme(<HistoryScreen />);
    await waitFor(() => expect(screen.getByText("Không thể tải lịch sử. Vui lòng thử lại.")).toBeTruthy());

    await act(async () => {
      fireEvent.press(screen.getByText("Thử lại"));
    });

    await waitFor(() => expect(screen.getByText("Kiệt sức")).toBeTruthy());
  });

  test("loads more when end reached", async () => {
    mockGet.mockResolvedValueOnce(page1).mockResolvedValueOnce(page2);
    const screen = renderWithTheme(<HistoryScreen />);
    await waitFor(() => expect(screen.getByText("Kiệt sức")).toBeTruthy());

    await act(async () => {
      fireEvent(screen.UNSAFE_getByType(require("react-native").FlatList), "onEndReached");
    });

    await waitFor(() => expect(screen.getByText("Sẵn sàng")).toBeTruthy());
  });

  test("changing sort refetches first page and closes sheet", async () => {
    mockGet.mockResolvedValue(page1);
    const screen = renderWithTheme(<HistoryScreen />);
    await waitFor(() => expect(screen.getByText("Kiệt sức")).toBeTruthy());

    fireEvent.press(screen.UNSAFE_getAllByType(require("react-native").TouchableOpacity)[0]);
    expect(mockSortSheetProps.visible).toBe(true);

    await act(async () => {
      fireEvent.press(screen.getByText("sort-asc"));
    });

    await waitFor(() => expect(mockGet).toHaveBeenLastCalledWith("/histories", {
      query: { page: 1, limit: 25, sort: "createdAt:asc" },
    }));
  });
});
