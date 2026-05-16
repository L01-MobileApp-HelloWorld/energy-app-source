import { EntryCard, HistoryEntry } from '@/components/ui/entry-card';
import { ScreenBackTitle } from '@/components/ui/ScreenBackTitle';
import { SortOption, SortSheet } from '@/components/ui/sort-sheet';
import { AppColorsType, FontFamily, StateKey } from '@/constants/theme';
import { useAppColors } from '@/hooks/use-app-theme';
import { apiClient } from '@/services/api-client';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const scale = (size: number) => (width / 390) * size;

type HistorySection = {
  label: string;
  entries: HistoryEntry[];
};

// ─── Map API response to local format ─────────────────────────────────────────

const BACKEND_STATE_MAP: Record<string, StateKey> = {
  exhausted: 'exhausted',
  tired: 'tired',
  lazy_with_deadline: 'lazy',
  ready: 'ready',
  focused: 'focused',
  unmotivated: 'unmotivated',
};

function mapApiHistoryToSections(grouped: Record<string, unknown[]>): HistorySection[] {
  const sections: HistorySection[] = [];
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  for (const [dateStr, items] of Object.entries(grouped)) {
    let label: string;
    if (dateStr === today) {
      label = 'HÔM NAY';
    } else if (dateStr === yesterday) {
      label = 'HÔM QUA';
    } else {
      const d = new Date(dateStr);
      const diffDays = Math.floor((Date.now() - d.getTime()) / 86400000);
      if (diffDays < 7) {
        label = `${diffDays} NGÀY TRƯỚC`;
      } else if (diffDays < 30) {
        label = 'TUẦN TRƯỚC';
      } else {
        label = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
      }
    }

    const entries: HistoryEntry[] = (items as Record<string, unknown>[]).map((item: Record<string, unknown>) => {
      const scores = item.scores as { energy: number; work: number; psychology: number; environment: number; total: number } | undefined;
      const state = BACKEND_STATE_MAP[item.state as string] ?? 'tired';
      const overallScore = scores ? (scores.total / 100) * 5 : 3;
      const createdAt = new Date(item.createdAt as string);
      const time = createdAt.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase();

      const stateDetails = item.stateDetails as { name?: string } | undefined;
      const title = stateDetails?.name ?? state;

      return {
        id: (item._id as string) ?? String(Math.random()),
        time,
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
    });

    sections.push({ label, entries });
  }

  return sections;
}

// ─── Sort logic ────────────────────────────────────────────────────────────────

function sortSections(sections: HistorySection[], sort: SortOption): HistorySection[] {
  switch (sort) {
    case 'date-desc':
      return sections.map((s) => ({ ...s, entries: [...s.entries] }));
    case 'date-asc':
      return [...sections].reverse().map((s) => ({ ...s, entries: [...s.entries].reverse() }));
    case 'name-asc':
      return sections.map((s) => ({
        ...s,
        entries: [...s.entries].sort((a, b) => a.title.localeCompare(b.title, 'vi')),
      }));
    case 'name-desc':
      return sections.map((s) => ({
        ...s,
        entries: [...s.entries].sort((a, b) => b.title.localeCompare(a.title, 'vi')),
      }));
  }
}

// ─── Screen ────────────────────────────────────────────────────────────────────

export default function HistoryScreen() {
  const colors = useAppColors();
  const styles = createStyles(colors);
  const [sortVisible, setSortVisible] = useState(false);
  const [sort, setSort] = useState<SortOption>('date-desc');
  const [rawSections, setRawSections] = useState<HistorySection[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchHistory = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError('');

    try {
      const res = await apiClient.get<{
        success: boolean;
        data: {
          histories: Record<string, unknown[]>;
          pagination: { total: number; page: number; pages: number };
        };
      }>('/api/history');

      const sections = mapApiHistoryToSections(res.data.histories);
      setRawSections(sections);
    } catch (e) {
      setError('Không thể tải lịch sử. Vui lòng thử lại.');
      console.warn('[History] fetch failed:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const sections = useMemo(() => sortSections(rawSections, sort), [rawSections, sort]);

  const isEmpty = !loading && sections.length === 0 && !error;

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
                color={sort !== 'date-desc' ? colors.primaryMain : colors.textPrimary}
              />
            </TouchableOpacity>
          }
        />
      </View>

      {loading ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={colors.primaryMain} />
        </View>
      ) : error ? (
        <View style={styles.centerState}>
          <Ionicons name="cloud-offline-outline" size={48} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>{error}</Text>
          <TouchableOpacity onPress={() => fetchHistory()} style={styles.retryBtn}>
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
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchHistory(true)}
              tintColor={colors.primaryMain}
            />
          }
        >
          {sections.map((section) => (
            <View key={section.label} style={{ marginBottom: 8 }}>
              <Text style={styles.sectionLabel}>{section.label}</Text>
              {section.entries.map((entry) => (
                <EntryCard key={entry.id} entry={entry} colors={colors} />
              ))}
            </View>
          ))}
        </ScrollView>
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
    sectionLabel: {
      fontFamily: FontFamily.sansSemiBold,
      fontSize: 11,
      letterSpacing: 1.2,
      color: colors.textMuted,
      marginBottom: 12,
      marginTop: 4,
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
      fontSize: scale(14),
      color: colors.textMuted,
      textAlign: 'center',
    },
    retryBtn: {
      paddingHorizontal: 20,
      paddingVertical: 10,
      backgroundColor: colors.primaryMain,
      borderRadius: 8,
      marginTop: 8,
    },
    retryText: {
      fontFamily: FontFamily.sansSemiBold,
      fontSize: scale(14),
      color: '#fff',
    },
  });
