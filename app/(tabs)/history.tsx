import { EntryCard, HistoryEntry } from '@/components/ui/entry-card';
import { ScreenBackTitle } from '@/components/ui/ScreenBackTitle';
import { SortOption, SortSheet } from '@/components/ui/sort-sheet';
import { AppColorsType } from '@/constants/theme';
import { useAppColors } from '@/hooks/use-app-theme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type HistorySection = {
  label: string;
  entries: HistoryEntry[];
};

const RAW_HISTORY: HistorySection[] = [
  {
    label: 'HÔM NAY',
    entries: [
      {
        id: '1',
        time: '08:30 AM',
        title: 'Tỉnh táo, sẵn sàng',
        states: ['ready', 'focused'],
        rating: 4.2,
        resultData: { stateKey: 'ready', overall: 4.2, categoryScores: [4.4, 4.1, 4.3, 4.0] },
        surveyAnswers: { 0: 3, 1: 2, 2: 3, 3: 3, 4: 3, 5: 2, 6: 3, 7: 3, 8: 3, 9: 2 },
      },
      {
        id: '2',
        time: '02:15 PM',
        title: 'Mệt mỏi nhẹ',
        states: ['tired'],
        rating: 3.5,
        resultData: { stateKey: 'tired', overall: 3.5, categoryScores: [3.2, 3.5, 3.8, 3.5] },
        surveyAnswers: { 0: 1, 1: 1, 2: 1, 3: 2, 4: 2, 5: 1, 6: 2, 7: 2, 8: 2, 9: 1 },
      },
    ],
  },
  {
    label: 'HÔM QUA',
    entries: [
      {
        id: '3',
        time: '09:00 PM',
        title: 'Kiệt sức hoàn toàn',
        states: ['exhausted'],
        rating: 2.1,
        resultData: { stateKey: 'exhausted', overall: 2.1, categoryScores: [1.8, 2.3, 2.0, 2.3] },
        surveyAnswers: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 },
      },
    ],
  },
  {
    label: 'TUẦN TRƯỚC',
    entries: [
      {
        id: '4',
        time: '03:45 PM',
        title: 'Tập trung cao độ',
        states: ['focused'],
        rating: 4.8,
        resultData: { stateKey: 'focused', overall: 4.8, categoryScores: [4.9, 4.8, 4.7, 4.8] },
        surveyAnswers: { 0: 4, 1: 3, 2: 3, 3: 3, 4: 3, 5: 3, 6: 3, 7: 3, 8: 3, 9: 3 },
      },
    ],
  },
];

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

export default function HistoryScreen() {
  const colors = useAppColors();
  const styles = createStyles(colors);
  const [sortVisible, setSortVisible] = useState(false);
  const [sort, setSort] = useState<SortOption>('date-desc');

  const sections = useMemo(() => sortSections(RAW_HISTORY, sort), [sort]);

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

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
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
      fontFamily: 'PlusJakartaSans_600SemiBold',
      fontSize: 11,
      letterSpacing: 1.2,
      color: colors.textMuted,
      marginBottom: 12,
      marginTop: 4,
    },
  });
