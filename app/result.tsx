import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo } from 'react';
import { Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';

import { StateBadge, StateKey } from '@/components/ui/state-badge';
import { AppColors, FontFamily, STATE_COLOR_MAP } from '@/constants/theme';

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

// ─── Sub-components ───────────────────────────────────────────────────────────

function CircularScore({ score, color }: { score: number; color: string }) {
  const SIZE = 164;
  const SW = 12;
  const r = (SIZE - SW) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - score / 5);

  return (
    <View style={{ width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={SIZE} height={SIZE}>
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={r}
          stroke={AppColors.bgSurface3}
          strokeWidth={SW}
          fill="none"
        />
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={r}
          stroke={color}
          strokeWidth={SW}
          fill="none"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90, ${SIZE / 2}, ${SIZE / 2})`}
        />
      </Svg>
      <View style={StyleSheet.absoluteFill}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontFamily: FontFamily.monoMedium, fontSize: scale(36), color }}>
            {score.toFixed(1)}
          </Text>
          <Text style={{ fontFamily: FontFamily.sans, fontSize: scale(12), color: AppColors.textMuted }}>
            / 5.0
          </Text>
        </View>
      </View>
    </View>
  );
}

function CategoryBar({ label, score, color }: { label: string; score: number; color: string }) {
  return (
    <View style={{ gap: 6 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ fontFamily: FontFamily.sansMedium, fontSize: scale(13), color: AppColors.textSecondary }}>
          {label}
        </Text>
        <Text style={{ fontFamily: FontFamily.monoMedium, fontSize: scale(12), color }}>
          {score.toFixed(1)}
        </Text>
      </View>
      <View style={{ height: 6, backgroundColor: AppColors.bgSurface3, borderRadius: 3, overflow: 'hidden' }}>
        <View
          style={{ height: 6, width: `${(score / 5) * 100}%`, backgroundColor: color, borderRadius: 3 }}
        />
      </View>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ResultScreen() {
  const { answers: answersJson } = useLocalSearchParams<{ answers: string }>();

  const { overall, categoryScores, stateKey, stateColor } = useMemo(() => {
    let parsed: Record<number, number> = {};
    try {
      parsed = JSON.parse(answersJson ?? '{}');
    } catch {}

    const scores = computeScores(parsed);
    const overall = scores.reduce((a, b) => a + b, 0) / scores.length;
    const categoryScores = CATEGORIES.map((c) => categoryAvg(c.indices, scores));
    const stateKey = getState(overall);
    const stateColor = STATE_COLOR_MAP[stateKey].text;

    return { overall, categoryScores, stateKey, stateColor };
  }, [answersJson]);

  const info = STATE_INFO[stateKey];

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
          <Text style={styles.emoji}>{info.emoji}</Text>
          <Text style={styles.stateTitle}>{info.title}</Text>
          <CircularScore score={overall} color={stateColor} />
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
              />
            ))}
          </View>
        </View>

        {/* Summary */}
        <View style={[styles.summaryCard, { borderLeftColor: stateColor }]}>
          <Text style={styles.summaryText}>{info.summary}</Text>
        </View>

        {/* Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gợi ý cho bạn</Text>
          {info.tips.map((tip, i) => (
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
        <Pressable style={styles.retryBtn} onPress={() => router.replace('/survey')}>
          <Text style={styles.retryBtnText}>Làm lại</Text>
        </Pressable>
        <Pressable
          style={[styles.homeBtn, { backgroundColor: stateColor }]}
          onPress={() => router.replace('/(tabs)')}
        >
          <Text style={styles.homeBtnText}>Về trang chủ</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: AppColors.bgApp },
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
    color: AppColors.textPrimary,
  },

  scoreCard: {
    backgroundColor: AppColors.bgSurface1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: AppColors.borderDefault,
    padding: 24,
    alignItems: 'center',
    gap: 12,
  },
  emoji: { fontSize: scale(48) },
  stateTitle: {
    fontFamily: FontFamily.sansBold,
    fontSize: scale(20),
    color: AppColors.textPrimary,
  },

  section: { gap: 12 },
  sectionTitle: {
    fontFamily: FontFamily.sansSemiBold,
    fontSize: scale(15),
    color: AppColors.textSecondary,
  },
  card: {
    backgroundColor: AppColors.bgSurface1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: AppColors.borderDefault,
    padding: 16,
    gap: 16,
  },

  summaryCard: {
    backgroundColor: AppColors.bgSurface1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: AppColors.borderDefault,
    borderLeftWidth: 4,
    padding: 16,
  },
  summaryText: {
    fontFamily: FontFamily.sans,
    fontSize: scale(14),
    color: AppColors.textSecondary,
    lineHeight: scale(22),
  },

  tipCard: {
    backgroundColor: AppColors.bgSurface1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: AppColors.borderDefault,
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
    color: '#ffffff',
  },
  tipText: {
    fontFamily: FontFamily.sans,
    fontSize: scale(14),
    color: AppColors.textSecondary,
    lineHeight: scale(22),
    flex: 1,
  },

  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    gap: 12,
  },
  retryBtn: {
    flex: 1,
    height: 52,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: AppColors.borderDefault,
    backgroundColor: AppColors.bgSurface1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryBtnText: {
    fontFamily: FontFamily.sansBold,
    fontSize: scale(14),
    color: AppColors.textPrimary,
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
    color: '#ffffff',
  },
});
