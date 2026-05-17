import { EntryCard } from '@/components/ui/entry-card';
import { ScreenBackTitle } from '@/components/ui/ScreenBackTitle';
import { SortOption, SortSheet } from '@/components/ui/sort-sheet';
import { AppColorsType, FontFamily, StateKey } from '@/constants/theme';
import { useAppColors } from '@/hooks/use-app-theme';
import { apiClient } from '@/services/api-client';
import type { IHistoryEntry } from '@/typescript';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const scale = (size: number) => (width / 390) * size;
const HISTORY_PAGE_LIMIT = 25;

type HistoryApiItem = {
  _id: string;
  userId: string;
  state: string;
  scores?: {
    energy: number;
    work: number;
    psychology: number;
    environment: number;
    total: number;
  };
  stateDetails?: {
    name?: string;
    emoji?: string;
    color?: string;
    description?: string;
    recommendations?: string[];
  };
  createdAt: string;
};

type HistoriesPagination = {
  total: number;
  page: number;
  pages: number;
};

type HistoriesResponseData = {
  histories: HistoryApiItem[];
  pagination: HistoriesPagination;
};

const BACKEND_STATE_MAP: Record<string, StateKey> = {
  exhausted: 'exhausted',
  tired: 'tired',
  lazy_with_deadline: 'lazy',
  ready: 'ready',
  focused: 'focused',
  unmotivated: 'unmotivated',
};

function formatHistoryTimestamp(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const isSameDay =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();
  const isSameYear = date.getFullYear() === now.getFullYear();
  const weekdayLabelMap = ['CN', 'Th2', 'Th3', 'Th4', 'Th5', 'Th6', 'Th7'];
  const weekdayLabel = weekdayLabelMap[date.getDay()];
  const timeLabel = date.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  if (isSameDay) {
    return timeLabel;
  }

  if (isSameYear) {
    return `${weekdayLabel}, ${date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
    })}, ${timeLabel}`;
  }

  return `${weekdayLabel}, ${date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })}, ${timeLabel}`;
}

function mapApiHistoryItem(item: HistoryApiItem): IHistoryEntry {
  const scores = item.scores;
  const state = BACKEND_STATE_MAP[item.state] ?? 'tired';
  const overallScore = scores ? (scores.total / 100) * 5 : 3;
  const title = item.stateDetails?.name ?? state;

  return {
    id: item._id,
    createdAt: item.createdAt,
    time: formatHistoryTimestamp(item.createdAt),
    title,
    states: [state],
    rating: Math.round(overallScore * 10) / 10,
    resultData: {
      stateKey: state,
      overall: overallScore,
      categoryScores: scores
        ? [
            (scores.energy / 100) * 5,
            ((scores.energy + scores.environment) / 200) * 5,
            (scores.psychology / 100) * 5,
            (scores.work / 100) * 5,
          ]
        : [3, 3, 3, 3],
    },
    surveyAnswers: {},
  };
}

export default function HistoryScreen() {
  const colors = useAppColors();
  const styles = createStyles(colors);
  const [sortVisible, setSortVisible] = useState(false);
  const [sort, setSort] = useState<SortOption>('createdAt:desc');
  const [items, setItems] = useState<IHistoryEntry[]>([]);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchHistory = useCallback(
    async (targetPage: number, options?: { replace?: boolean; refresh?: boolean }) => {
      const replace = options?.replace ?? false;
      const refresh = options?.refresh ?? false;

      if (refresh) {
        setRefreshing(true);
      } else if (targetPage === 1) {
        setLoadingInitial(true);
      } else {
        setLoadingMore(true);
      }

      if (targetPage === 1) {
        setError('');
      }

      try {
        const res = await apiClient.get<{
          success: boolean;
          data: HistoriesResponseData;
        }>('/histories', {
          query: {
            page: targetPage,
            limit: HISTORY_PAGE_LIMIT,
            sort,
          },
        });

        const nextItems = res.data.histories.map(mapApiHistoryItem);
        const pagination = res.data.pagination;

        setItems((prevItems) =>
          replace || targetPage === 1 ? nextItems : [...prevItems, ...nextItems],
        );
        setPage(pagination.page);
        setHasNextPage(pagination.page < pagination.pages && nextItems.length > 0);
      } catch (e) {
        if (targetPage === 1) {
          setError('Không thể tải lịch sử. Vui lòng thử lại.');
        } else {
          console.warn('[History] load more failed:', e);
        }
      } finally {
        setLoadingInitial(false);
        setLoadingMore(false);
        setRefreshing(false);
      }
    },
    [sort],
  );

  useEffect(() => {
    setItems([]);
    setPage(1);
    setHasNextPage(true);
    setError('');
    fetchHistory(1, { replace: true });
  }, [fetchHistory, sort]);

  const handleRefresh = useCallback(() => {
    setHasNextPage(true);
    fetchHistory(1, { replace: true, refresh: true });
  }, [fetchHistory]);

  const handleLoadMore = useCallback(() => {
    if (loadingInitial || loadingMore || refreshing || !hasNextPage) {
      return;
    }

    fetchHistory(page + 1);
  }, [fetchHistory, hasNextPage, loadingInitial, loadingMore, page, refreshing]);

  const handleRetry = useCallback(() => {
    setItems([]);
    setPage(1);
    setHasNextPage(true);
    fetchHistory(1, { replace: true });
  }, [fetchHistory]);

  const renderFooter = useCallback(() => {
    if (!loadingMore) {
      return <View style={styles.listFooterSpacer} />;
    }

    return (
      <View style={styles.listFooter}>
        <ActivityIndicator size="small" color={colors.primaryMain} />
      </View>
    );
  }, [colors.primaryMain, loadingMore, styles.listFooter, styles.listFooterSpacer]);

  const isEmpty = !loadingInitial && items.length === 0 && !error;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgApp }}>
      <View style={styles.header}>
        <ScreenBackTitle
          title="Lịch sử"
          onPress={() => router.push('/')}
          rightElement={
            <TouchableOpacity activeOpacity={0.7} onPress={() => setSortVisible(true)}>
              <Ionicons
                name="filter-outline"
                size={22}
                color={sort !== 'createdAt:desc' ? colors.primaryMain : colors.textPrimary}
              />
            </TouchableOpacity>
          }
        />
      </View>

      {loadingInitial ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={colors.primaryMain} />
        </View>
      ) : error ? (
        <View style={styles.centerState}>
          <Ionicons name="cloud-offline-outline" size={48} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>{error}</Text>
          <TouchableOpacity onPress={handleRetry} style={styles.retryBtn}>
            <Text style={styles.retryText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : isEmpty ? (
        <View style={styles.centerState}>
          <Text style={{ fontSize: 48 }}>📋</Text>
          <Text style={styles.emptyTitle}>Chưa có lịch sử</Text>
          <Text style={styles.emptySubtitle}>Hãy thực hiện khảo sát đầu tiên của bạn!</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <EntryCard entry={item} colors={colors} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.4}
          ListFooterComponent={renderFooter}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primaryMain}
            />
          }
        />
      )}

      <SortSheet
        visible={sortVisible}
        selected={sort}
        onSelect={setSort}
        onClose={() => setSortVisible(false)}
      />
    </SafeAreaView>
  );
}

const createStyles = (colors: AppColorsType) =>
  StyleSheet.create({
    header: {
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    centerState: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
      paddingHorizontal: 40,
    },
    emptyTitle: {
      fontFamily: FontFamily.sansBold,
      fontSize: scale(16),
      color: colors.textPrimary,
      textAlign: 'center',
    },
    emptySubtitle: {
      fontFamily: FontFamily.sans,
      fontSize: scale(13),
      color: colors.textMuted,
      textAlign: 'center',
      lineHeight: 20,
    },
    retryBtn: {
      marginTop: 4,
      backgroundColor: colors.primaryMain,
      paddingHorizontal: 18,
      paddingVertical: 10,
      borderRadius: 12,
    },
    retryText: {
      fontFamily: FontFamily.sansSemiBold,
      color: '#fff',
      fontSize: scale(13),
    },
    listContent: {
      paddingHorizontal: 20,
      paddingTop: 8,
      paddingBottom: 100,
    },
    listFooter: {
      paddingVertical: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    listFooterSpacer: {
      height: 12,
    },
  });
