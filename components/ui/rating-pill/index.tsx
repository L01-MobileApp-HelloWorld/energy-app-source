import { AppColorsType } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';

type RatingPillProps = {
  rating: number;
  colors: AppColorsType;
};

export function RatingPill({ rating, colors }: RatingPillProps) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.bgSurface2,
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 5,
        gap: 4,
      }}
    >
      <Ionicons name="star" size={13} color="#f59e0b" />
      <Text style={{ fontFamily: 'DMMono_500Medium', fontSize: 13, color: colors.textSecondary }}>
        {rating.toFixed(1)}/5
      </Text>
    </View>
  );
}
