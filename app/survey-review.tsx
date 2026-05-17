import { AppColorsType, FontFamily } from '@/constants/theme';
import { useAppColors } from '@/hooks/use-app-theme';
import { apiClient } from '@/services/api-client';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const scale = (size: number) => (width / 390) * size;

type BackendQuestionOption = {
  label: string;
  emoji: string;
  subtext: string;
  score: number;
};

type BackendQuestion = {
  _id: string;
  questionId: number;
  group: 'energy' | 'work' | 'psychology' | 'environment';
  question: string;
  hint?: string;
  options: BackendQuestionOption[];
  order?: number;
};

const GROUP_META: Record<
  BackendQuestion['group'],
  { label: string; emoji: string }
> = {
  energy: { label: 'Năng lượng', emoji: '⚡' },
  work: { label: 'Công việc', emoji: '💼' },
  psychology: { label: 'Tâm lý', emoji: '🧠' },
  environment: { label: 'Môi trường', emoji: '🌿' },
};

function normalizeSelectedOption(selectedOption: number, optionCount: number) {
  if (selectedOption >= 0 && selectedOption < optionCount) {
    return selectedOption;
  }

  if (selectedOption > 0 && selectedOption <= optionCount) {
    return selectedOption - 1;
  }

  return -1;
}

export default function SurveyReviewScreen() {
  const colors = useAppColors();
  const styles = createStyles(colors);
  const { answersJson, questionsJson } = useLocalSearchParams<{
    answersJson?: string;
    questionsJson?: string;
  }>();

  const answers = useMemo(() => {
    try {
      return JSON.parse(answersJson ?? '{}') as Record<number, number>;
    } catch {
      return {};
    }
  }, [answersJson]);

  const [questions, setQuestions] = useState<BackendQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function loadQuestions() {
      setLoading(true);
      setError('');

      try {
        if (questionsJson) {
          const parsed = JSON.parse(questionsJson) as BackendQuestion[];
          if (active) {
            setQuestions(
              [...parsed].sort(
                (a, b) => (a.order ?? a.questionId) - (b.order ?? b.questionId),
              ),
            );
            setLoading(false);
          }
          return;
        }

        const questionIds = Object.keys(answers)
          .map((key) => Number(key))
          .filter((id) => Number.isFinite(id))
          .sort((a, b) => a - b);

        if (questionIds.length === 0) {
          if (active) {
            setQuestions([]);
            setLoading(false);
          }
          return;
        }

        const res = await apiClient.get<{
          success: boolean;
          data: { questions: BackendQuestion[] };
        }>('/questions', {
          query: {
            questionId: questionIds.join(','),
          },
        });

        if (active) {
          setQuestions(
            [...(res.data.questions ?? [])].sort(
              (a, b) => (a.order ?? a.questionId) - (b.order ?? b.questionId),
            ),
          );
          setLoading(false);
        }
      } catch (fetchError) {
        if (active) {
          setError('Không thể tải câu hỏi khảo sát.');
          setLoading(false);
        }
        console.warn('[SurveyReview] fetch questions failed:', fetchError);
      }
    }

    loadQuestions();

    return () => {
      active = false;
    };
  }, [answers, questionsJson]);

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.headerBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Câu trả lời của bạn</Text>
        <View style={styles.headerBtn} />
      </View>

      {loading ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={colors.primaryMain} />
        </View>
      ) : error ? (
        <View style={styles.centerState}>
          <Text style={styles.emptyTitle}>{error}</Text>
        </View>
      ) : questions.length === 0 ? (
        <View style={styles.centerState}>
          <Text style={styles.emptyTitle}>Không có câu trả lời để hiển thị</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {questions.map((q, index) => {
            const rawSelected = answers[q.questionId];
            const selected = normalizeSelectedOption(rawSelected, q.options.length);
            const groupMeta = GROUP_META[q.group];

            return (
              <View key={q._id ?? q.questionId} style={styles.questionCard}>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {groupMeta.emoji} {groupMeta.label}
                  </Text>
                </View>

                <Text style={styles.questionText}>
                  <Text style={styles.questionNumber}>{index + 1}. </Text>
                  {q.question}
                </Text>

                {q.hint ? <Text style={styles.hintText}>{q.hint}</Text> : null}

                <View style={styles.optionsList}>
                  {q.options.map((opt, optionIndex) => {
                    const isSelected = selected === optionIndex;
                    return (
                      <View
                        key={`${q.questionId}-${optionIndex}`}
                        style={[
                          styles.optionRow,
                          isSelected && {
                            backgroundColor: colors.primarySurface,
                            borderColor: colors.primaryMain,
                          },
                        ]}
                      >
                        <Text style={styles.optionEmoji}>{opt.emoji}</Text>
                        <View style={styles.optionTexts}>
                          <Text
                            style={[
                              styles.optionLabel,
                              isSelected && { color: colors.primaryMain },
                            ]}
                          >
                            {opt.label}
                          </Text>
                          {opt.subtext ? (
                            <Text style={styles.optionDesc}>{opt.subtext}</Text>
                          ) : null}
                        </View>
                        {isSelected ? (
                          <Ionicons
                            name="checkmark-circle"
                            size={20}
                            color={colors.primaryMain}
                          />
                        ) : null}
                      </View>
                    );
                  })}
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const createStyles = (colors: AppColorsType) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.bgApp },
    centerState: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 32,
    },
    emptyTitle: {
      fontFamily: FontFamily.sansBold,
      fontSize: scale(16),
      color: colors.textPrimary,
      textAlign: 'center',
    },

    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    headerBtn: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTitle: {
      flex: 1,
      textAlign: 'center',
      fontFamily: FontFamily.sansBold,
      fontSize: scale(18),
      color: colors.textPrimary,
    },

    scrollContent: {
      paddingHorizontal: 20,
      paddingTop: 4,
      paddingBottom: 32,
      gap: 16,
    },

    questionCard: {
      backgroundColor: colors.bgSurface1,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.borderDefault,
      padding: 16,
      gap: 12,
    },

    badge: {
      alignSelf: 'flex-start',
      borderWidth: 1,
      borderColor: colors.primaryLight,
      borderRadius: 999,
      paddingVertical: 3,
      paddingHorizontal: 10,
    },
    badgeText: {
      fontFamily: FontFamily.sansSemiBold,
      fontSize: scale(11),
      color: colors.primaryLight,
    },

    questionNumber: {
      fontFamily: FontFamily.sansBold,
      color: colors.primaryMain,
    },
    questionText: {
      fontFamily: FontFamily.sansSemiBold,
      fontSize: scale(14),
      color: colors.textPrimary,
      lineHeight: scale(21),
    },
    hintText: {
      fontFamily: FontFamily.sans,
      fontSize: scale(12),
      color: colors.textMuted,
      lineHeight: scale(18),
    },

    optionsList: { gap: 8 },
    optionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.borderDefault,
      backgroundColor: colors.bgSurface2,
      paddingVertical: 10,
      paddingHorizontal: 12,
    },
    optionEmoji: { fontSize: scale(18) },
    optionTexts: { flex: 1 },
    optionLabel: {
      fontFamily: FontFamily.sansMedium,
      fontSize: scale(13),
      color: colors.textPrimary,
    },
    optionDesc: {
      fontFamily: FontFamily.sans,
      fontSize: scale(11),
      color: colors.textMuted,
      marginTop: 1,
    },
  });
