import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CategoryBar } from "@/components/ui/category-bar";
import { CircularScore } from "@/components/ui/circular-score";
import { StateBadge, StateKey } from "@/components/ui/state-badge";
import { AppColorsType, FontFamily, getStateColorMap } from "@/constants/theme";
import { useAppColors, useAppTheme } from "@/hooks/use-app-theme";
import { apiClient } from "@/services/api-client";
import type { IServerResult } from "@/typescript";

const { width } = Dimensions.get("window");
const scale = (size: number) => (width / 390) * size;

type HistoryAnswer = {
  _id?: string;
  questionId: number;
  group: string;
  selectedOption: number;
  score: number;
};

type HistoryDetail = IServerResult & {
  _id: string;
  userId?: string;
  createdAt?: string;
  meta?: {
    completionTime?: number;
    deviceInfo?: string;
    appVersion?: string;
  };
  answers: HistoryAnswer[];
};

type BackendQuestionOption = {
  label: string;
  emoji: string;
  subtext: string;
  score: number;
};

type BackendQuestion = {
  _id: string;
  questionId: number;
  group: string;
  question: string;
  hint?: string;
  options: BackendQuestionOption[];
  order?: number;
};

const CATEGORIES: { label: string; key: keyof IServerResult["scores"] }[] = [
  { label: "Năng lượng", key: "energy" },
  { label: "Sức khỏe", key: "environment" },
  { label: "Tâm lý", key: "psychology" },
  { label: "Công việc", key: "work" },
];

const SERVER_STATE_MAP: Record<string, StateKey> = {
  exhausted: "exhausted",
  tired: "tired",
  lazy_with_deadline: "lazy",
  ready: "ready",
  focused: "focused",
  unmotivated: "unmotivated",
};

function mapServerStateToKey(state: string): StateKey {
  return SERVER_STATE_MAP[state] ?? "tired";
}

function buildCategoryScoresFromServer(scores: IServerResult["scores"]) {
  return CATEGORIES.map((category) => (scores[category.key] / 100) * 5);
}

function buildAnswersMapFromHistory(historyAnswers: HistoryAnswer[]) {
  return Object.fromEntries(
    historyAnswers.map((answer) => [answer.questionId, answer.selectedOption]),
  );
}

export default function ResultScreen() {
  const colors = useAppColors();
  const styles = createStyles(colors);
  const { resolvedTheme } = useAppTheme();
  const { historyId, fromHistory } = useLocalSearchParams<{
    historyId?: string;
    fromHistory?: string;
  }>();

  const [historyDetail, setHistoryDetail] = useState<HistoryDetail | null>(
    null,
  );
  const [reviewQuestions, setReviewQuestions] = useState<BackendQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchHistoryDetail = useCallback(async () => {
    if (!historyId) {
      setError("Thiếu historyId để tải kết quả.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const historyRes = await apiClient.get<{
        success: boolean;
        data: { history: HistoryDetail };
      }>(`/histories/${historyId}`);

      const history = historyRes.data.history;
      const questionIds = history.answers
        .map((answer) => answer.questionId)
        .filter((value, index, self) => self.indexOf(value) === index)
        .sort((a, b) => a - b);

      const questionsRes =
        questionIds.length > 0
          ? await apiClient.get<{
              success: boolean;
              data: { questions: BackendQuestion[] };
            }>("/questions", {
              query: {
                questionId: questionIds.join(","),
              },
            })
          : null;

      setHistoryDetail(history);
      setReviewQuestions(
        [...(questionsRes?.data.questions ?? [])].sort(
          (a, b) => (a.order ?? a.questionId) - (b.order ?? b.questionId),
        ),
      );
    } catch (fetchError) {
      setError("Không thể tải kết quả từ backend. Vui lòng thử lại.");
      console.warn("[Result] fetch result failed:", fetchError);
    } finally {
      setLoading(false);
    }
  }, [historyId]);

  useEffect(() => {
    fetchHistoryDetail();
  }, [fetchHistoryDetail]);

  const derivedData = useMemo(() => {
    if (!historyDetail) {
      return null;
    }

    const stateKey = mapServerStateToKey(historyDetail.state);
    const stateColor = getStateColorMap(resolvedTheme)[stateKey].text;

    return {
      overall: (historyDetail.scores.total / 100) * 5,
      categoryScores: buildCategoryScoresFromServer(historyDetail.scores),
      stateKey,
      stateColor,
      reviewAnswersJson: JSON.stringify(
        buildAnswersMapFromHistory(historyDetail.answers),
      ),
      reviewQuestionsJson: JSON.stringify(reviewQuestions),
      displayTitle: historyDetail.stateDetails.name,
      displayEmoji: historyDetail.stateDetails.emoji,
      displaySummary: historyDetail.stateDetails.description,
      displayTips: historyDetail.stateDetails.recommendations ?? [],
    };
  }, [historyDetail, resolvedTheme, reviewQuestions]);

  const isFromHistory = fromHistory === "1";

  if (loading) {
    return (
      <SafeAreaView style={styles.screen} edges={["top", "bottom"]}>
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={colors.primaryMain} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !derivedData) {
    return (
      <SafeAreaView style={styles.screen} edges={["top", "bottom"]}>
        <View style={styles.centerState}>
          <Text style={styles.emptyTitle}>
            {error || "Không có dữ liệu kết quả."}
          </Text>
          <Pressable style={styles.retryBtn} onPress={fetchHistoryDetail}>
            <Text style={styles.retryBtnText}>Thử lại</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={["top", "bottom"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Kết quả phân tích</Text>
          <StateBadge state={derivedData.stateKey} />
        </View>

        <View style={styles.scoreCard}>
          <Text style={styles.emoji}>{derivedData.displayEmoji}</Text>
          <Text style={styles.stateTitle}>{derivedData.displayTitle}</Text>
          <CircularScore
            score={derivedData.overall}
            color={derivedData.stateColor}
            colors={colors}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chỉ số chi tiết</Text>
          <View style={styles.card}>
            {CATEGORIES.map((category, index) => (
              <CategoryBar
                key={category.label}
                label={category.label}
                score={derivedData.categoryScores[index]}
                color={derivedData.stateColor}
                colors={colors}
              />
            ))}
          </View>
        </View>

        <View
          style={[
            styles.summaryCard,
            { borderLeftColor: derivedData.stateColor },
          ]}
        >
          <Text style={styles.summaryText}>{derivedData.displaySummary}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gợi ý cho bạn</Text>
          {derivedData.displayTips.map((tip, index) => (
            <View key={`${index}-${tip}`} style={styles.tipCard}>
              <View
                style={[
                  styles.tipBadge,
                  { backgroundColor: derivedData.stateColor },
                ]}
              >
                <Text style={styles.tipBadgeText}>{index + 1}</Text>
              </View>
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          style={styles.reviewBtn}
          onPress={() =>
            router.push({
              pathname: "/survey-review",
              params: {
                answersJson: derivedData.reviewAnswersJson,
                questionsJson: derivedData.reviewQuestionsJson,
              },
            })
          }
        >
          <Text style={styles.reviewBtnText}>Xem lại khảo sát</Text>
        </Pressable>
        <View style={styles.footerRow}>
          {isFromHistory ? (
            <Pressable
              style={[
                styles.homeBtn,
                { backgroundColor: derivedData.stateColor, flex: 1 },
              ]}
              onPress={() => router.back()}
            >
              <Text style={styles.homeBtnText}>Về lịch sử</Text>
            </Pressable>
          ) : (
            <Pressable
              style={[
                styles.homeBtn,
                { backgroundColor: derivedData.stateColor, flex: 1 },
              ]}
              onPress={() => router.replace("/(tabs)")}
            >
              <Text style={styles.homeBtnText}>Về trang chủ</Text>
            </Pressable>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (colors: AppColorsType) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.bgApp },
    scroll: { flex: 1 },
    scrollContent: { padding: 20, gap: 20, paddingBottom: 8 },
    centerState: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
      paddingHorizontal: 32,
    },
    emptyTitle: {
      fontFamily: FontFamily.sansBold,
      fontSize: scale(16),
      color: colors.textPrimary,
      textAlign: "center",
    },

    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
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
      alignItems: "center",
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
      flexDirection: "row",
      gap: 12,
      alignItems: "flex-start",
    },
    tipBadge: {
      width: 24,
      height: 24,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
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
      alignItems: "center",
      justifyContent: "center",
    },
    reviewBtnText: {
      fontFamily: FontFamily.sansBold,
      fontSize: scale(14),
      color: colors.textSecondary,
    },
    footerRow: {
      flexDirection: "row",
      gap: 12,
    },
    retryBtn: {
      minWidth: 140,
      height: 52,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.borderDefault,
      backgroundColor: colors.bgSurface1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 20,
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
      alignItems: "center",
      justifyContent: "center",
    },
    homeBtnText: {
      fontFamily: FontFamily.sansBold,
      fontSize: scale(14),
      color: colors.textPrimary,
    },
  });
