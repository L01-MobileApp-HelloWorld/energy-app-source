import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';

import { AppColorsType, FontFamily } from '@/constants/theme';
import { useAppColors } from '@/hooks/use-app-theme';

const { width } = Dimensions.get('window');
const scale = (size: number) => (width / 390) * size;

interface FormMessageProps {
  error?: string;
  success?: string;
}

export function FormMessage({ error, success }: FormMessageProps) {
  const colors = useAppColors();
  const styles = createStyles(colors);

  if (!error && !success) {
    return null;
  }

  return (
    <View
      style={[
        styles.messageBox,
        error ? styles.errorBox : styles.successBox,
      ]}
    >
      <Ionicons
        name={error ? 'alert-circle' : 'checkmark-circle'}
        size={16}
        color={error ? colors.stateExhaustedText : colors.primaryMain}
      />
      <Text
        style={[
          styles.messageText,
          error ? styles.errorText : styles.successText,
        ]}
      >
        {error || success}
      </Text>
    </View>
  );
}

const createStyles = (colors: AppColorsType) =>
  StyleSheet.create({
    messageBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: colors.bgSurface2,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderWidth: 1,
    },
    errorBox: {
      borderColor: colors.stateExhaustedText + '33',
    },
    successBox: {
      borderColor: colors.primaryLight,
      backgroundColor: colors.primarySurface,
    },
    messageText: {
      flex: 1,
      fontFamily: FontFamily.sans,
      fontSize: scale(13),
    },
    errorText: {
      color: colors.stateExhaustedText,
    },
    successText: {
      color: colors.primaryMain,
    },
  });
