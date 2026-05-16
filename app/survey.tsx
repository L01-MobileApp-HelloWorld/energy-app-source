import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ScreenBackTitle } from "@/components/ui/ScreenBackTitle";
import { SurveyOptionCard } from "@/components/ui/survey-option-card";
import { AppColorsType, FontFamily } from "@/constants/theme";
import { useAppColors, useAppTheme } from "@/hooks/use-app-theme";
import { apiClient } from "@/services/api-client";
import type { BackendGroup, ISurveyOption } from "@/typescript";

const { width } = Dimensions.get("window");
const scale = (size: number) => (width / 390) * size;

type BackendQuestionOption = {
  _id: string;
  label: string;
  emoji: string;
  subtext: string;
  score: number;
};

type BackendQuestion = {
  _id: string;
  questionId: number;
  group: BackendGroup;
  question: string;
  hint?: string;
  options: BackendQuestionOption[];
};

type SelectedAnswer = {
  selectedOption: number;
  score: number;
};

export default function SurveyScreen() {
  const colors = useAppColors();
  const { resolvedTheme } = useAppTheme();
  const styles = createStyles(colors);
  const primaryForeground =
    resolvedTheme === "dark" ? colors.textPrimary : "#ffffff";

  const [questions, setQuestions] = useState<BackendQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, SelectedAnswer>>({});
  const [startedAt, setStartedAt] = useState<number | null>(null);

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const res = await apiClient.get<{
        success: boolean;
        data: { questions: BackendQuestion[] };
      }>("/api/questions");

      const fetchedQuestions = res.data.questions ?? [];

      if (fetchedQuestions.length === 0) {
        setQuestions([]);
        setError("Không có câu hỏi để hiển thị. Vui lòng thử lại.");
        return;
      }

      setQuestions(fetchedQuestions);
      setCurrentIndex(0);
      setAnswers({});
      setStartedAt(Date.now());
    } catch (e) {
      setError("Không thể tải câu hỏi. Vui lòng thử lại.");
      console.warn("[Survey] fetch questions failed:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const question = questions[currentIndex];
  const selectedAnswer = question ? answers[question.questionId] : undefined;
  const progress = questions.length
    ? Math.round(((currentIndex + 1) / questions.length) * 100)
    : 0;
  const isLastQuestion =
    questions.length > 0 && currentIndex === questions.length - 1;
  const hasAnswer = selectedAnswer !== undefined;
  const isEmpty = !loading && !error && questions.length === 0;

  const mappedOptions = useMemo<ISurveyOption[]>(() => {
    if (!question) return [];

    return question.options.map((option) => ({
      emoji: option.emoji,
      label: option.label,
      description: option.subtext,
    }));
  }, [question]);

  const handleSelect = (optionIndex: number) => {
    if (!question) return;

    const selectedOption = question.options[optionIndex];
    setAnswers((prev) => ({
      ...prev,
      [question.questionId]: {
        selectedOption: optionIndex,
        score: selectedOption.score,
      },
    }));
  };

  const handleNext = () => {
    if (!question) return;

    if (isLastQuestion) {
      try {
        const apiAnswers = questions.map((item) => {
          const selected = answers[item.questionId];

          return {
            questionId: item.questionId,
            group: item.group,
            selectedOption: selected?.selectedOption ?? 0,
            score: selected?.score ?? item.options[0]?.score ?? 0,
          };
        });

        const answersForResult = Object.fromEntries(
          questions.map((item) => [
            item.questionId,
            answers[item.questionId]?.selectedOption ?? 0,
          ]),
        );

        router.push({
          pathname: "/analystic",
          params: {
            answers: JSON.stringify(answersForResult),
            apiAnswers: JSON.stringify(apiAnswers),
            startedAt: String(startedAt ?? Date.now()),
          },
        });
      } catch (e) {
        Alert.alert("Navigation error", String(e));
      }

      return;
    }

    setCurrentIndex((i) => i + 1);
  };

  const handleBack = () => {
    if (currentIndex === 0) {
      router.back();
    } else {
      setCurrentIndex((i) => i - 1);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.screen} edges={["top", "bottom"]}>
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={colors.primaryMain} />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.screen} edges={["top", "bottom"]}>
        <View style={styles.topBar}>
          <ScreenBackTitle
            title="Khảo sát nhanh"
            onPress={() => router.back()}
          />
        </View>
        <View style={styles.centerState}>
          <Ionicons
            name="cloud-offline-outline"
            size={48}
            color={colors.textMuted}
          />
          <Text style={styles.emptyTitle}>{error}</Text>
          <TouchableOpacity
            onPress={() => fetchQuestions()}
            style={styles.retryBtn}
            activeOpacity={0.8}
          >
            <Text style={styles.retryText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (isEmpty || !question) {
    return (
      <SafeAreaView style={styles.screen} edges={["top", "bottom"]}>
        <View style={styles.topBar}>
          <ScreenBackTitle
            title="Khảo sát nhanh"
            onPress={() => router.back()}
          />
        </View>
        <View style={styles.centerState}>
          <Text style={styles.emptyTitle}>Không có câu hỏi để hiển thị</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={["top", "bottom"]}>
      <View style={styles.topBar}>
        <ScreenBackTitle title="Khảo sát nhanh" onPress={() => router.back()} />
      </View>

      <View style={styles.header}>
        <Text style={styles.headerCounter}>
          Câu hỏi {currentIndex + 1} / {questions.length}
        </Text>
        <Text style={styles.headerPercent}>{progress}%</Text>
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.question}>{question.question}</Text>

        {question.hint ? (
          <Text style={styles.hint}>{question.hint}</Text>
        ) : null}

        <View style={styles.options}>
          {mappedOptions.map((option, index) => (
            <SurveyOptionCard
              key={question.options[index]._id}
              option={option}
              selected={selectedAnswer?.selectedOption === index}
              onPress={() => handleSelect(index)}
            />
          ))}
        </View>
      </ScrollView>

      <View style={currentIndex > 0 ? styles.footer : styles.footerSingle}>
        {currentIndex > 0 ? (
          <Pressable style={styles.backBtn} onPress={handleBack}>
            <Ionicons
              name="chevron-back"
              size={24}
              color={colors.textPrimary}
            />
          </Pressable>
        ) : null}
        <Pressable
          style={[
            currentIndex > 0 ? styles.nextBtn : styles.nextBtnFull,
            !hasAnswer && styles.nextBtnDisabled,
          ]}
          onPress={handleNext}
          disabled={!hasAnswer}
        >
          <Text style={[styles.nextBtnText, { color: primaryForeground }]}>
            {isLastQuestion ? "Tiến hành phân tích" : "Tiếp theo"}
          </Text>
          <Ionicons
            name={isLastQuestion ? "checkmark" : "arrow-forward"}
            size={18}
            color={primaryForeground}
          />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (colors: AppColorsType) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.bgApp,
    },
    topBar: {
      paddingHorizontal: 20,
      paddingTop: 12,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 10,
    },
    headerCounter: {
      fontFamily: FontFamily.sansBold,
      fontSize: scale(16),
      color: colors.textPrimary,
    },
    headerPercent: {
      fontFamily: FontFamily.sansBold,
      fontSize: scale(16),
      color: colors.primaryMain,
    },
    progressTrack: {
      height: 4,
      marginHorizontal: 20,
      backgroundColor: colors.bgSurface3,
      borderRadius: 2,
      overflow: "hidden",
    },
    progressFill: {
      height: 4,
      backgroundColor: colors.primaryMain,
      borderRadius: 2,
    },
    scroll: { flex: 1 },
    scrollContent: {
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 12,
    },
    question: {
      fontFamily: FontFamily.sansBold,
      fontSize: scale(20),
      color: colors.textPrimary,
      lineHeight: scale(28),
      marginBottom: 12,
    },
    hint: {
      fontFamily: FontFamily.sans,
      fontSize: scale(14),
      color: colors.textMuted,
      lineHeight: scale(20),
      marginBottom: 24,
    },
    options: { gap: 10 },
    footer: {
      flexDirection: "row",
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 16,
      gap: 12,
    },
    footerSingle: {
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 16,
    },
    backBtn: {
      width: 52,
      height: 52,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.borderDefault,
      backgroundColor: colors.bgSurface1,
      alignItems: "center",
      justifyContent: "center",
    },
    nextBtn: {
      flex: 1,
      height: 52,
      borderRadius: 8,
      backgroundColor: colors.primaryMain,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    nextBtnFull: {
      width: "100%",
      height: 52,
      borderRadius: 8,
      backgroundColor: colors.primaryMain,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    nextBtnDisabled: {
      opacity: 0.45,
    },
    nextBtnText: {
      fontFamily: FontFamily.sansBold,
      fontSize: scale(14),
    },
    centerState: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
      paddingHorizontal: 40,
    },
    emptyTitle: {
      fontFamily: FontFamily.sansBold,
      fontSize: scale(16),
      color: colors.textPrimary,
      textAlign: "center",
    },
    retryBtn: {
      minHeight: 46,
      paddingHorizontal: 18,
      borderRadius: 8,
      backgroundColor: colors.primaryMain,
      alignItems: "center",
      justifyContent: "center",
    },
    retryText: {
      fontFamily: FontFamily.sansBold,
      fontSize: scale(14),
      color: "#ffffff",
    },
  });
