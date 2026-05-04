import { AppColorsType, FontFamily } from '@/constants/theme';
import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

const { width } = Dimensions.get('window');
const scale = (size: number) => (width / 390) * size;

type CircularScoreProps = {
  score: number;
  color: string;
  colors: AppColorsType;
};

const SIZE = 164;
const SW = 12;
const R = (SIZE - SW) / 2;
const CIRC = 2 * Math.PI * R;

export function CircularScore({ score, color, colors }: CircularScoreProps) {
  const offset = CIRC * (1 - score / 5);

  return (
    <View style={{ width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={SIZE} height={SIZE}>
        <Circle cx={SIZE / 2} cy={SIZE / 2} r={R} stroke={colors.bgSurface3} strokeWidth={SW} fill="none" />
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R}
          stroke={color}
          strokeWidth={SW}
          fill="none"
          strokeDasharray={CIRC}
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
          <Text style={{ fontFamily: FontFamily.sans, fontSize: scale(12), color: colors.textMuted }}>
            / 5.0
          </Text>
        </View>
      </View>
    </View>
  );
}
