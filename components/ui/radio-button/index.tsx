import React from 'react';
import { StyleSheet, View } from 'react-native';

import { AppColorsType } from '@/constants/theme';
import { useAppColors } from '@/hooks/use-app-theme';

type RadioButtonProps = {
  selected: boolean;
};

export function RadioButton({ selected }: RadioButtonProps) {
  const colors = useAppColors();
  const styles = createStyles(colors);

  return (
    <View style={[styles.radio, selected && styles.radioSelected]}>
      {selected && <View style={styles.radioDot} />}
    </View>
  );
}

const createStyles = (colors: AppColorsType) =>
  StyleSheet.create({
    radio: {
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: 2,
      borderColor: colors.borderDefault,
      alignItems: 'center',
      justifyContent: 'center',
    },
    radioSelected: {
      borderColor: colors.primaryMain,
      backgroundColor: colors.primaryMain,
    },
    radioDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.bgSurface1,
    },
  });
