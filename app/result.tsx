import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo } from 'react';
import { Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CategoryBar } from '@/components/ui/category-bar';
import { CircularScore } from '@/components/ui/circular-score';
import { StateBadge, StateKey } from '@/components/ui/state-badge';
import { AppColorsType, FontFamily, getStateColorMap } from '@/constants/theme';
import { useAppColors, useAppTheme } from '@/hooks/use-app-theme';
import type { IServerResult } from '@/typescript';

const { width } = Dimensions.get('window');
const scale = (size: number) => (width / 390) * size;

// ─── Scoring config ──────────────────────────────────────────────────────────

// Number of options per question (matches QUESTIONS order in survey.tsx)
const Q_OPTIONS = [5, 4, 4, 4, 4, 4, 4, 4, 4, 4];

const CATEGORIES: { label: string; indices: number[] }[] = [
  { label: 'Năng lượng', indices: [0, 9] },
  { label: 'Sức khỏe', indices: [1, 2, 5] },
  { label: 'Tâm lý', indices: [3, 8] },
  { label: 'Công việc', indices: [4, 6, 7] },
];

// ─── State content ────────────────────────────────────────────────────────────

const STATE_INFO: Record<StateKey, { emoji: string; title: string; summary: string; tips: string[] }> = {
  exhausted: {
    emoji: '😫',
    title: 'Bạn đang kiệt sức',
    summary:
      'Cơ thể và tinh thần của bạn đang ở mức thấp nhất. Đây không phải lười — bạn thực sự cần được nghỉ ngơi và phục hồi trước khi làm bất cứ điều gì.',
    tips: [
      'Nghỉ hoàn toàn 30–60 phút, không nhìn điện thoại hay màn hình.',
      'Uống nước, ăn nhẹ, và chỉ đặt mục tiêu hoàn thành đúng 1 việc nhỏ nhất hôm nay.',
    ],
  },
  tired: {
    emoji: '😴',
    title: 'Bạn đang mệt mỏi',
    summary:
      'Bạn đang mệt nhưng vẫn có thể hoạt động ở mức độ nhẹ. Hãy ưu tiên phục hồi và làm việc từng bước nhỏ thay vì cố ép bản thân.',
    tips: [
      'Thử Pomodoro: 25 phút tập trung, 5 phút nghỉ — lặp lại 3–4 vòng rồi nghỉ dài.',
      'Ưu tiên 1–2 việc quan trọng nhất, để những việc khác sang ngày mai.',
    ],
  },
  lazy: {
    emoji: '🥱',
    title: 'Bạn đang lười biếng',
    summary:
      'Bạn không thực sự mệt — chỉ thiếu hứng khởi để bắt đầu. Điều này hoàn toàn bình thường và có thể thay đổi nhanh chóng.',
    tips: [
      'Bắt đầu ngay với một việc chỉ mất 2 phút. Momentum sẽ tự đến sau đó.',
      'Hẹn giờ 15 phút: làm bất cứ thứ gì liên quan đến mục tiêu, không cần hoàn hảo.',
    ],
  },
  unmotivated: {
    emoji: '😑',
    title: 'Bạn thiếu động lực',
    summary:
      'Bạn biết cần làm gì nhưng không thấy lý do để làm. Hãy kết nối lại với mục tiêu và tìm nguồn năng lượng bên ngoài.',
    tips: [
      'Viết ra 3 lý do tại sao việc này quan trọng với bạn — đọc lại mỗi sáng.',
      'Tìm một người làm việc cùng (body doubling) để tạo áp lực xã hội tích cực.',
    ],
  },
  ready: {
    emoji: '💪',
    title: 'Bạn đang sẵn sàng',
    summary:
      'Năng lượng và tâm trạng của bạn đang ở mức tốt. Đây là thời điểm lý tưởng để xử lý những công việc quan trọng và khó nhất.',
    tips: [
      'Giải quyết công việc khó và quan trọng nhất trước khi làm những việc dễ hơn.',
      'Đặt lịch cố định mỗi ngày để duy trì nhịp điệu năng lượng này lâu dài.',
    ],
  },
  focused: {
    emoji: '🎯',
    title: 'Bạn đang tập trung cao',
    summary:
      'Bạn đang ở trạng thái "flow" — đây là thời điểm vàng để làm việc sâu và tạo ra kết quả chất lượng cao nhất.',
    tips: [
      'Tắt thông báo và bảo vệ khung giờ này — tránh mọi phân tâm không cần thiết.',
      'Ghi lại điều bạn đang làm đúng (ngủ đủ, ăn tốt, v.v.) để tái tạo trạng thái này.',
    ],
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function computeScores(answers: Record<number, number>): number[] {
  return Q_OPTIONS.map((numOptions, i) => {
    const ans = answers[i];
    return ans !== undefined ? (ans / (numOptions - 1)) * 5 : 2.5;
  });
}

function categoryAvg(indices: number[], scores: number[]): number {
  const vals = indices.map((i) => scores[i]);
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

function getState(overall: number): StateKey {
  if (overall < 1.5) return 'exhausted';
  if (overall < 2.5) return 'tired';
  if (overall < 3.2) return 'lazy';
  if (overall < 3.8) return 'unmotivated';
  if (overall < 4.4) return 'ready';
  return 'focused';
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ResultScreen() {
  const colors = useAppColors();
  const styles = createStyles(colors);
  const { resolvedTheme } = useAppTheme();
  const {
    answers: answersJson,
    resultData: resultDataJson,
    surveyAnswers: surveyAnswersJson,
    serverResult: serverResultJson,
    fromHistory,
  } = useLocalSearchParams<{
    answers?: string;
    resultData?: string;
    surveyAnswers?: string;
    serverResult?: string;
    fromHistory?: string;
  }>();

  const isFromHistory = fromHistory === '1';

  const {
    overall,
    categoryScores,
    stateKey,
    stateColor,
    reviewAnswersJson,
    displayTitle,
    displayEmoji,
    displaySummary,
    displayTips,
  } = useMemo(() => {
    // History mode: use pre-computed data
    if (resultDataJson) {
      try {
        const d = JSON.parse(resultDataJson) as {
          stateKey: StateKey;
          overall: number;
          categoryScores: number[];
        };
        const stateColor = getStateColorMap(resolvedTheme)[d.stateKey].text;
        return {
          overall: d.overall,
          categoryScores: d.categoryScores,
          stateKey: d.stateKey,
          stateColor,
          reviewAnswersJson: surveyAnswersJson ?? '{}',
          displayTitle: STATE_INFO[d.stateKey].title,
          displayEmoji: STATE_INFO[d.stateKey].emoji,
          displaySummary: STATE_INFO[d.stateKey].summary,
          displayTips: STATE_INFO[d.stateKey].tips,
        };
      } catch {}
    }

    // Server result mode: use API response
    if (serverResultJson) {
      try {
        const sr = JSON.parse(serverResultJson) as IServerResult;

        // Map backend state names to frontend StateKey
        const stateMap: Record<string, StateKey> = {
          exhausted: 'exhausted',
          tired: 'tired',
          lazy_with_deadline: 'lazy',
          ready: 'ready',
          focused: 'focused',
          unmotivated: 'unmotivated',
        };
        const mappedState = stateMap[sr.state] ?? 'tired';
        const overall = (sr.scores.total / 100) * 5;
        const categoryScores = [
          (sr.scores.energy / 100) * 5,
          ((sr.scores.energy + sr.scores.environment) / 200) * 5,
          (sr.scores.psychology / 100) * 5,
          (sr.scores.work / 100) * 5,
        ];
        const stateColor = getStateColorMap(resolvedTheme)[mappedState].text;

        return {
          overall,
          categoryScores,
          stateKey: mappedState,
          stateColor,
          reviewAnswersJson: answersJson ?? '{}',
          displayTitle: sr.stateDetails.name || STATE_INFO[mappedState].title,
          displayEmoji: sr.stateDetails.emoji || STATE_INFO[mappedState].emoji,
          displaySummary:
            sr.stateDetails.description || STATE_INFO[mappedState].summary,
          displayTips:
            sr.stateDetails.recommendations?.length
              ? sr.stateDetails.recommendations
              : STATE_INFO[mappedState].tips,
        };
      } catch {}
    }

    // Fallback: Survey mode — compute from raw answers locally
    let parsed: Record<number, number> = {};
    try {
      parsed = JSON.parse(answersJson ?? '{}');
    } catch {}

    const scores = computeScores(parsed);
    const overall = scores.reduce((a, b) => a + b, 0) / scores.length;
    const categoryScores = CATEGORIES.map((c) => categoryAvg(c.indices, scores));
    const stateKey = getState(overall);
    const stateColor = getStateColorMap(resolvedTheme)[stateKey].text;

    return {
      overall,
      categoryScores,
      stateKey,
      stateColor,
      reviewAnswersJson: answersJson ?? '{}',
      displayTitle: STATE_INFO[stateKey].title,
      displayEmoji: STATE_INFO[stateKey].emoji,
      displaySummary: STATE_INFO[stateKey].summary,
      displayTips: STATE_INFO[stateKey].tips,
    };
  }, [answersJson, resultDataJson, surveyAnswersJson, serverResultJson, resolvedTheme]);

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Kết quả phân tích</Text>
          <StateBadge state={stateKey} />
        </View>

        {/* Score card */}
        <View style={styles.scoreCard}>
          <Text style={styles.emoji}>{displayEmoji}</Text>
          <Text style={styles.stateTitle}>{displayTitle}</Text>
          <CircularScore score={overall} color={stateColor} colors={colors} />
        </View>

        {/* Category breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chỉ số chi tiết</Text>
          <View style={styles.card}>
            {CATEGORIES.map((cat, i) => (
              <CategoryBar
                key={cat.label}
                label={cat.label}
                score={categoryScores[i]}
                color={stateColor}
                colors={colors}
              />
            ))}
          </View>
        </View>

        {/* Summary */}
        <View style={[styles.summaryCard, { borderLeftColor: stateColor }]}>
          <Text style={styles.summaryText}>{displaySummary}</Text>
        </View>

        {/* Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gợi ý cho bạn</Text>
          {displayTips.map((tip, i) => (
            <View key={i} style={styles.tipCard}>
              <View style={[styles.tipBadge, { backgroundColor: stateColor }]}>
                <Text style={styles.tipBadgeText}>{i + 1}</Text>
              </View>
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Pressable
          style={styles.reviewBtn}
          onPress={() => router.push({ pathname: '/survey-review', params: { answersJson: reviewAnswersJson } })}
        >
          <Text style={styles.reviewBtnText}>Xem lại khảo sát</Text>
        </Pressable>
        <View style={styles.footerRow}>
          {isFromHistory ? (
            <Pressable
              style={[styles.homeBtn, { backgroundColor: stateColor, flex: 1 }]}
              onPress={() => router.back()}
            >
              <Text style={styles.homeBtnText}>Về lịch sử</Text>
            </Pressable>
          ) : (
            <>
              <Pressable style={styles.retryBtn} onPress={() => router.replace('/survey')}>
                <Text style={styles.retryBtnText}>Làm lại</Text>
              </Pressable>
              <Pressable
                style={[styles.homeBtn, { backgroundColor: stateColor }]}
                onPress={() => router.replace('/(tabs)')}
              >
                <Text style={styles.homeBtnText}>Về trang chủ</Text>
              </Pressable>
            </>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const createStyles = (colors: AppColorsType) =>
  StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bgApp },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, gap: 20, paddingBottom: 8 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontFamily: FontFamily.sansBold,
    fontSize: scale(18),
    color: colors.textPrimary,
  },

  scoreCard: {
    backgroundColor: colors.bgSurface1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    padding: 24,
    alignItems: 'center',
    gap: 12,
  },
  emoji: { fontSize: scale(48) },
  stateTitle: {
    fontFamily: FontFamily.sansBold,
    fontSize: scale(20),
    color: colors.textPrimary,
  },

  section: { gap: 12 },
  sectionTitle: {
    fontFamily: FontFamily.sansSemiBold,
    fontSize: scale(15),
    color: colors.textSecondary,
  },
  card: {
    backgroundColor: colors.bgSurface1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    padding: 16,
    gap: 16,
  },

  summaryCard: {
    backgroundColor: colors.bgSurface1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderLeftWidth: 4,
    padding: 16,
  },
  summaryText: {
    fontFamily: FontFamily.sans,
    fontSize: scale(14),
    color: colors.textSecondary,
    lineHeight: scale(22),
  },

  tipCard: {
    backgroundColor: colors.bgSurface1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  tipBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 1,
  },
  tipBadgeText: {
    fontFamily: FontFamily.sansBold,
    fontSize: scale(12),
    color: colors.textPrimary,
  },
  tipText: {
    fontFamily: FontFamily.sans,
    fontSize: scale(14),
    color: colors.textSecondary,
    lineHeight: scale(22),
    flex: 1,
  },

  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    gap: 10,
  },
  reviewBtn: {
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    backgroundColor: colors.bgSurface1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewBtnText: {
    fontFamily: FontFamily.sansBold,
    fontSize: scale(14),
    color: colors.textSecondary,
  },
  footerRow: {
    flexDirection: 'row',
    gap: 12,
  },
  retryBtn: {
    flex: 1,
    height: 52,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    backgroundColor: colors.bgSurface1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryBtnText: {
    fontFamily: FontFamily.sansBold,
    fontSize: scale(14),
    color: colors.textPrimary,
  },
  homeBtn: {
    flex: 2,
    height: 52,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeBtnText: {
    fontFamily: FontFamily.sansBold,
    fontSize: scale(14),
    color: colors.textPrimary,
  },
});
