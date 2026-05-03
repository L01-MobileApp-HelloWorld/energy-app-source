import React from 'react';
import { StyleSheet, View } from 'react-native';

import { AppColors } from '@/constants/theme';

type RadioButtonProps = {
  selected: boolean;
};

export function RadioButton({ selected }: RadioButtonProps) {
  return (
    <View style={[styles.radio, selected && styles.radioSelected]}>
      {selected && <View style={styles.radioDot} />}
    </View>
  );
}

const styles = StyleSheet.create({
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: AppColors.borderDefault,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: AppColors.primaryMain,
    backgroundColor: AppColors.primaryMain,
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: AppColors.bgSurface1,
  },
});
