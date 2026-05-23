import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { AppColorsType, FontFamily } from '@/constants/theme';
import { useAppColors } from '@/hooks/use-app-theme';

const { width } = Dimensions.get('window');
const scale = (size: number) => (width / 390) * size;

interface PasswordFieldProps {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  editable?: boolean;
  testID?: string;
}

export function PasswordField({
  label,
  value,
  onChangeText,
  placeholder = '••••••••',
  editable = true,
  testID,
}: PasswordFieldProps) {
  const colors = useAppColors();
  const styles = createStyles(colors);
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[
          styles.input,
          styles.inputRow,
          focused && styles.inputFocused,
        ]}
      >
        <TextInput
          style={styles.passwordInput}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          placeholderTextColor={colors.textGhost}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          autoCorrect={false}
          editable={editable}
          testID={testID}
        />
        <Pressable
          onPress={() => setShowPassword((v) => !v)}
          hitSlop={8}
          style={styles.eyeBtn}
        >
          <Ionicons
            name={showPassword ? 'eye-outline' : 'eye-off-outline'}
            size={20}
            color={colors.textMuted}
          />
        </Pressable>
      </View>
    </View>
  );
}

const createStyles = (colors: AppColorsType) =>
  StyleSheet.create({
    fieldGroup: {
      gap: 6,
    },
    label: {
      fontFamily: FontFamily.sansSemiBold,
      fontSize: scale(13),
      color: colors.textSecondary,
    },
    input: {
      backgroundColor: colors.bgSurface2,
      borderWidth: 1,
      borderColor: colors.borderDefault,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontFamily: FontFamily.sans,
      fontSize: scale(15),
      color: colors.textPrimary,
    },
    inputFocused: {
      borderColor: colors.primaryMain,
      backgroundColor: colors.bgSurface1,
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 0,
      paddingHorizontal: 0,
      paddingLeft: 14,
    },
    passwordInput: {
      flex: 1,
      fontFamily: FontFamily.sans,
      fontSize: scale(15),
      color: colors.textPrimary,
      paddingVertical: 12,
    },
    eyeBtn: {
      padding: 12,
    },
  });
