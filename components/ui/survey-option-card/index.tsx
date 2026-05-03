import React from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';

import { RadioButton } from '@/components/ui/radio-button';
import { AppColors, FontFamily } from '@/constants/theme';

const { width } = Dimensions.get('window');
const scale = (size: number) => (width / 390) * size;

export type SurveyOption = {
  emoji: string;
  label: string;
  description: string;
};

type SurveyOptionCardProps = {
  option: SurveyOption;
  selected: boolean;
  onPress: () => void;
};

export function SurveyOptionCard({ option, selected, onPress }: SurveyOptionCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.card, selected && styles.cardSelected]}
    >
      <View style={styles.emojiBox}>
        <Text style={{ fontSize: scale(22) }}>{option.emoji}</Text>
      </View>
      <View style={styles.text}>
        <Text style={styles.label}>{option.label}</Text>
        <Text style={styles.description}>{option.description}</Text>
      </View>
      <RadioButton selected={selected} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.bgSurface1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: AppColors.borderDefault,
    padding: 14,
    gap: 12,
  },
  cardSelected: {
    borderColor: AppColors.primaryMain,
    backgroundColor: AppColors.primarySurface,
  },
  emojiBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: AppColors.bgSurface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { flex: 1 },
  label: {
    fontFamily: FontFamily.sansBold,
    fontSize: scale(14),
    color: AppColors.textPrimary,
  },
  description: {
    fontFamily: FontFamily.sans,
    fontSize: scale(12),
    color: AppColors.textMuted,
    marginTop: 2,
  },
});
