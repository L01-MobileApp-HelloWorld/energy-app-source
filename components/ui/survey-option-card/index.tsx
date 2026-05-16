import React from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';

import { RadioButton } from '@/components/ui/radio-button';
import { AppColorsType, FontFamily } from '@/constants/theme';
import { useAppColors } from '@/hooks/use-app-theme';
import type { ISurveyOption } from '@/typescript';

const { width } = Dimensions.get('window');
const scale = (size: number) => (width / 390) * size;

export type SurveyOption = ISurveyOption;

type SurveyOptionCardProps = {
  option: ISurveyOption;
  selected: boolean;
  onPress: () => void;
};

export function SurveyOptionCard({ option, selected, onPress }: SurveyOptionCardProps) {
  const colors = useAppColors();
  const styles = createStyles(colors);

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

const createStyles = (colors: AppColorsType) =>
  StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.bgSurface1,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.borderDefault,
      padding: 14,
      gap: 12,
    },
    cardSelected: {
      borderColor: colors.primaryMain,
      backgroundColor: colors.primarySurface,
    },
    emojiBox: {
      width: 40,
      height: 40,
      borderRadius: 8,
      backgroundColor: colors.bgSurface2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    text: { flex: 1 },
    label: {
      fontFamily: FontFamily.sansBold,
      fontSize: scale(14),
      color: colors.textPrimary,
    },
    description: {
      fontFamily: FontFamily.sans,
      fontSize: scale(12),
      color: colors.textMuted,
      marginTop: 2,
    },
  });
