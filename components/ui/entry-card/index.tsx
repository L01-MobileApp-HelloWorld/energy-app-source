import { RatingPill } from '@/components/ui/rating-pill';
import { StateBadge } from '@/components/ui/state-badge';
import { AppColorsType, StateKey } from '@/constants/theme';
import { router } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import type { IHistoryEntry } from '@/typescript';

export type HistoryEntry = IHistoryEntry;

type EntryCardProps = {
  entry: IHistoryEntry;
  colors: AppColorsType;
};

export function EntryCard({ entry, colors }: EntryCardProps) {
  const handlePress = () => {
    router.push({
      pathname: '/result',
      params: {
        resultData: JSON.stringify(entry.resultData),
        surveyAnswers: JSON.stringify(entry.surveyAnswers),
        fromHistory: '1',
      },
    });
  };

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={handlePress}
      style={{
        backgroundColor: colors.bgSurface1,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.borderDefault,
        padding: 16,
        marginBottom: 12,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <Text style={{ fontFamily: 'DMMono_400Regular', fontSize: 12, color: colors.textDisabled }}>
          {entry.time}
        </Text>
        <RatingPill rating={entry.rating} colors={colors} />
      </View>
      <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 16, color: colors.textPrimary, marginBottom: 10 }}>
        {entry.title}
      </Text>
      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
        {entry.states.map((state) => (
          <StateBadge key={state} state={state} />
        ))}
      </View>
    </TouchableOpacity>
  );
}
