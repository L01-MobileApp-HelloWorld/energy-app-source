import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SurveyOptionCard, SurveyOption } from '@/components/ui/survey-option-card';
import { AppColors, FontFamily } from '@/constants/theme';

const { width } = Dimensions.get('window');
const scale = (size: number) => (width / 390) * size;

// ─── Types ────────────────────────────────────────────────────────────────────

type Question = {
  category: string;
  categoryEmoji: string;
  question: string;
  options: SurveyOption[];
};

// ─── Hard-coded data (sẽ thay bằng API sau) ──────────────────────────────────

const QUESTIONS: Question[] = [
  {
    category: 'Năng lượng và sức khỏe',
    categoryEmoji: '⚡',
    question: 'Mức năng lượng của bạn lúc này như thế nào?',
    options: [
      { emoji: '😤', label: 'Kiệt sức hoàn toàn', description: 'Không muốn làm gì cả' },
      { emoji: '😢', label: 'Khá mệt', description: 'Cần nghỉ ngơi thêm' },
      { emoji: '😐', label: 'Bình thường', description: 'Không mệt, không khỏe lắm' },
      { emoji: '😊', label: 'Khá tốt', description: 'Sẵn sàng làm việc nhẹ' },
      { emoji: '🔥', label: 'Tràn đầy năng lượng', description: 'Sẵn sàng chiến hết mình' },
    ],
  },
  {
    category: 'Giấc ngủ',
    categoryEmoji: '🌙',
    question: 'Bạn ngủ được khoảng mấy tiếng tối qua?',
    options: [
      { emoji: '😵', label: 'Dưới 4 tiếng', description: 'Gần như không ngủ được' },
      { emoji: '😴', label: '4 – 6 tiếng', description: 'Thiếu ngủ, còn buồn ngủ' },
      { emoji: '🙂', label: '6 – 8 tiếng', description: 'Ngủ tạm ổn' },
      { emoji: '😎', label: 'Trên 8 tiếng', description: 'Ngủ đủ giấc, cảm thấy sảng khoái' },
    ],
  },
  {
    category: 'Cơ thể',
    categoryEmoji: '💪',
    question: 'Cơ thể bạn đang cảm thấy thế nào?',
    options: [
      { emoji: '🤕', label: 'Đau nhức, khó chịu', description: 'Cơ thể không ổn chút nào' },
      { emoji: '😓', label: 'Nặng nề, uể oải', description: 'Muốn nằm xuống nghỉ' },
      { emoji: '😐', label: 'Bình thường', description: 'Không đau nhưng cũng không khỏe' },
      { emoji: '💪', label: 'Khỏe khoắn', description: 'Cơ thể nhẹ nhàng, thoải mái' },
    ],
  },
  {
    category: 'Tâm trạng',
    categoryEmoji: '🧠',
    question: 'Tâm trạng chung của bạn lúc này?',
    options: [
      { emoji: '😞', label: 'Chán nản, tiêu cực', description: 'Không muốn làm gì' },
      { emoji: '😕', label: 'Hơi buồn bực', description: 'Khó chịu, không vui lắm' },
      { emoji: '😐', label: 'Trung lập', description: 'Không vui không buồn' },
      { emoji: '😊', label: 'Ổn, tích cực', description: 'Cảm thấy thoải mái' },
    ],
  },
  {
    category: 'Công việc & học tập',
    categoryEmoji: '📚',
    question: 'Khi nghĩ đến công việc / bài vở hôm nay, bạn cảm thấy?',
    options: [
      { emoji: '😰', label: 'Sợ hãi, né tránh', description: 'Không dám nghĩ đến' },
      { emoji: '😒', label: 'Chán, không muốn làm', description: 'Biết phải làm nhưng lười' },
      { emoji: '😑', label: 'Bình thường', description: 'Làm được nhưng không hứng' },
      { emoji: '💡', label: 'Có hứng thú', description: 'Muốn bắt tay vào làm ngay' },
    ],
  },
  {
    category: 'Ăn uống',
    categoryEmoji: '🍱',
    question: 'Bạn đã ăn uống đầy đủ chưa?',
    options: [
      { emoji: '😵', label: 'Chưa ăn gì cả', description: 'Bỏ bữa hoặc quên ăn' },
      { emoji: '🥱', label: 'Ăn ít, không đủ', description: 'Ăn qua loa cho có' },
      { emoji: '🙂', label: 'Ăn bình thường', description: 'Đủ bữa, không ngon lắm' },
      { emoji: '😋', label: 'Ăn đầy đủ, ngon miệng', description: 'No và có năng lượng' },
    ],
  },
  {
    category: 'Tập trung',
    categoryEmoji: '🎯',
    question: 'Gần đây bạn có thể tập trung vào 1 việc trong bao lâu?',
    options: [
      { emoji: '😵‍💫', label: 'Dưới 5 phút', description: 'Đầu óc liên tục phân tâm' },
      { emoji: '😓', label: '5 – 15 phút', description: 'Khó giữ tập trung lâu' },
      { emoji: '🙂', label: '15 – 30 phút', description: 'Tạm ổn, hay bị gián đoạn' },
      { emoji: '🧘', label: 'Trên 30 phút', description: 'Tập trung tốt, ít bị phân tán' },
    ],
  },
  {
    category: 'Deadline',
    categoryEmoji: '⏰',
    question: 'Deadline của bạn đang như thế nào?',
    options: [
      { emoji: '🔥', label: 'Rất gấp, sắp hết giờ', description: 'Stress cao, áp lực lớn' },
      { emoji: '😬', label: 'Sắp tới, còn ít thời gian', description: 'Cần tăng tốc' },
      { emoji: '🙂', label: 'Còn vài ngày', description: 'Chưa gấp, có thể lên kế hoạch' },
      { emoji: '😌', label: 'Còn nhiều thời gian', description: 'Chưa có deadline gấp' },
    ],
  },
  {
    category: 'Cảm xúc với bản thân',
    categoryEmoji: '🪞',
    question: 'Bạn nghĩ lý do bạn chưa làm việc là vì?',
    options: [
      { emoji: '😮‍💨', label: 'Thực sự kiệt sức', description: 'Cơ thể và tinh thần đều cạn' },
      { emoji: '🥱', label: 'Lười, không có hứng', description: 'Không mệt nhưng không muốn làm' },
      { emoji: '😵', label: 'Quá nhiều việc, không biết bắt đầu từ đâu', description: 'Bị overwhelmed' },
      { emoji: '🤔', label: 'Chưa rõ lý do', description: 'Không chắc mình đang thế nào' },
    ],
  },
  {
    category: 'Năng lượng và sức khỏe',
    categoryEmoji: '⚡',
    question: 'Mức độ tập trung của bạn hôm nay như thế nào?',
    options: [
      { emoji: '😤', label: 'Rất khó tập trung', description: 'Dễ bị sao nhãng' },
      { emoji: '😢', label: 'Tập trung kém', description: 'Cần nghỉ ngơi thêm' },
      { emoji: '😐', label: 'Tập trung ổn', description: 'Làm việc bình thường' },
      { emoji: '😊', label: 'Tập trung cao', description: 'Làm việc trôi chảy' },
    ],
  },
];

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function SurveyScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});

  const question = QUESTIONS[currentIndex];
  const selectedAnswer = answers[currentIndex];
  const progress = Math.round(((currentIndex + 1) / QUESTIONS.length) * 100);
  const isLastQuestion = currentIndex === QUESTIONS.length - 1;
  const hasAnswer = selectedAnswer !== undefined;

  const handleSelect = (optionIndex: number) => {
    setAnswers((prev) => ({ ...prev, [currentIndex]: optionIndex }));
  };

  const handleNext = () => {
    if (isLastQuestion) {
      try {
        console.log('[Survey] navigating to analystic, answers:', answers);
        router.push({ pathname: '/analystic', params: { answers: JSON.stringify(answers) } });
      } catch (e) {
        Alert.alert('Navigation error', String(e));
      }
    } else {
      setCurrentIndex((i) => i + 1);
    }
  };

  const handleBack = () => {
    if (currentIndex === 0) {
      router.back();
    } else {
      setCurrentIndex((i) => i - 1);
    }
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerCounter}>
          Câu hỏi {currentIndex + 1} / {QUESTIONS.length}
        </Text>
        <Text style={styles.headerPercent}>{progress}%</Text>
      </View>

      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Category badge */}
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {question.categoryEmoji} {question.category}
          </Text>
        </View>

        {/* Question */}
        <Text style={styles.question}>{question.question}</Text>

        {/* Options */}
        <View style={styles.options}>
          {question.options.map((option, index) => (
            <SurveyOptionCard
              key={index}
              option={option}
              selected={selectedAnswer === index}
              onPress={() => handleSelect(index)}
            />
          ))}
        </View>
      </ScrollView>

      {/* Bottom actions */}
      <View style={styles.footer}>
        <Pressable style={styles.backBtn} onPress={handleBack}>
          <Ionicons name="chevron-back" size={24} color={AppColors.textPrimary} />
        </Pressable>
        <Pressable
          style={[styles.nextBtn, !hasAnswer && styles.nextBtnDisabled]}
          onPress={handleNext}
          disabled={!hasAnswer}
        >
          <Text style={styles.nextBtnText}>
            {isLastQuestion ? 'Tiến hành phân tích' : 'Tiếp theo'}
          </Text>
          <Ionicons
            name={isLastQuestion ? 'checkmark' : 'arrow-forward'}
            size={18}
            color="#ffffff"
          />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: AppColors.bgApp,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 10,
  },
  headerCounter: {
    fontFamily: FontFamily.sansBold,
    fontSize: scale(16),
    color: AppColors.textPrimary,
  },
  headerPercent: {
    fontFamily: FontFamily.sansBold,
    fontSize: scale(16),
    color: AppColors.primaryMain,
  },

  // Progress
  progressTrack: {
    height: 4,
    marginHorizontal: 20,
    backgroundColor: AppColors.bgSurface3,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: 4,
    backgroundColor: AppColors.primaryMain,
    borderRadius: 2,
  },

  // Scroll
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },

  // Category badge
  badge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: AppColors.stateTiredText,
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  badgeText: {
    fontFamily: FontFamily.sansSemiBold,
    fontSize: scale(12),
    color: AppColors.stateTiredText,
  },

  // Question
  question: {
    fontFamily: FontFamily.sansBold,
    fontSize: scale(20),
    color: AppColors.textPrimary,
    lineHeight: scale(28),
    marginBottom: 24,
  },

  // Options
  options: { gap: 10 },

  // Footer
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    gap: 12,
  },
  backBtn: {
    width: 52,
    height: 52,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: AppColors.borderDefault,
    backgroundColor: AppColors.bgSurface1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextBtn: {
    flex: 1,
    height: 52,
    borderRadius: 8,
    backgroundColor: AppColors.primaryMain,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  nextBtnDisabled: {
    opacity: 0.45,
  },
  nextBtnText: {
    fontFamily: FontFamily.sansBold,
    fontSize: scale(14),
    color: AppColors.bgSurface1,
  },
});
