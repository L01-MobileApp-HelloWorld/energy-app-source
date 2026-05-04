import { AppColorsType, FontFamily } from '@/constants/theme';
import React from 'react';
import { Dimensions, Text, View } from 'react-native';

const { width } = Dimensions.get('window');
const scale = (size: number) => (width / 390) * size;

type CategoryBarProps = {
  label: string;
  score: number;
  color: string;
  colors: AppColorsType;
};

export function CategoryBar({ label, score, color, colors }: CategoryBarProps) {
  return (
    <View style={{ gap: 6 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ fontFamily: FontFamily.sansMedium, fontSize: scale(13), color: colors.textSecondary }}>
          {label}
        </Text>
        <Text style={{ fontFamily: FontFamily.monoMedium, fontSize: scale(12), color }}>
          {score.toFixed(1)}
        </Text>
      </View>
      <View style={{ height: 6, backgroundColor: colors.bgSurface3, borderRadius: 3, overflow: 'hidden' }}>
        <View style={{ height: 6, width: `${(score / 5) * 100}%`, backgroundColor: color, borderRadius: 3 }} />
      </View>
    </View>
  );
}
