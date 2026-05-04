import { QUESTIONS } from '@/app/survey';
import { AppColorsType, FontFamily } from '@/constants/theme';
import { useAppColors } from '@/hooks/use-app-theme';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const scale = (size: number) => (width / 390) * size;

export default function SurveyReviewScreen() {
  const colors = useAppColors();
  const styles = createStyles(colors);
  const { answersJson } = useLocalSearchParams<{ answersJson: string }>();

  let answers: Record<number, number> = {};
  try {
    answers = JSON.parse(answersJson ?? '{}');
  } catch {}

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Câu trả lời của bạn</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {QUESTIONS.map((q, qi) => {
          const selected = answers[qi];
          return (
            <View key={qi} style={styles.questionCard}>
              {/* Category badge */}
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {q.categoryEmoji} {q.category}
                </Text>
              </View>

              {/* Question */}
              <Text style={styles.questionText}>
                <Text style={styles.questionNumber}>{qi + 1}. </Text>
                {q.question}
              </Text>

              {/* Options */}
              <View style={styles.optionsList}>
                {q.options.map((opt, oi) => {
                  const isSelected = selected === oi;
                  return (
                    <View
                      key={oi}
                      style={[
                        styles.optionRow,
                        isSelected && { backgroundColor: colors.primarySurface, borderColor: colors.primaryMain },
                      ]}
                    >
                      <Text style={styles.optionEmoji}>{opt.emoji}</Text>
                      <View style={styles.optionTexts}>
                        <Text style={[styles.optionLabel, isSelected && { color: colors.primaryMain }]}>
                          {opt.label}
                        </Text>
                        {'description' in opt && opt.description ? (
                          <Text style={styles.optionDesc}>{opt.description}</Text>
                        ) : null}
                      </View>
                      {isSelected && (
                        <Ionicons name="checkmark-circle" size={20} color={colors.primaryMain} />
                      )}
                    </View>
                  );
                })}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: AppColorsType) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.bgApp },

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
