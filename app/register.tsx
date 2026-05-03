import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenBackTitle } from '@/components/ui/ScreenBackTitle';
import { AppColorsType, FontFamily } from '@/constants/theme';
import { useAppColors } from '@/hooks/use-app-theme';

const { width } = Dimensions.get('window');
const scale = (size: number) => (width / 390) * size;

export default function RegisterScreen() {
  const colors = useAppColors();
  const styles = createStyles(colors);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [passwordConfirmationFocused, setPasswordConfirmationFocused] = useState(false);

  const canSubmit =
    email.trim().length > 0 &&
    password.length > 0 &&
    passwordConfirmation.length > 0;

  const handleRegister = () => {
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <ScreenBackTitle title="Đăng ký" onPress={() => router.back()} />

          <View style={styles.brandSection}>
            <View style={styles.logoBox}>
              <Text style={styles.logoEmoji}>⚡</Text>
            </View>
            <Text style={styles.appName}>Energy Check</Text>
            <Text style={styles.tagline}>Tạo tài khoản để bắt đầu hành trình theo dõi năng lượng</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Đăng ký</Text>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={[styles.input, emailFocused && styles.inputFocused]}
                value={email}
                onChangeText={setEmail}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                placeholder="you@example.com"
                placeholderTextColor={colors.textGhost}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Mật khẩu</Text>
              <View style={[styles.input, styles.inputRow, passwordFocused && styles.inputFocused]}>
                <TextInput
                  style={styles.passwordInput}
                  value={password}
                  onChangeText={setPassword}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  placeholder="••••••••"
                  placeholderTextColor={colors.textGhost}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <Pressable
                  onPress={() => setShowPassword((value) => !value)}
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

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Xác nhận mật khẩu</Text>
              <View
                style={[
                  styles.input,
                  styles.inputRow,
                  passwordConfirmationFocused && styles.inputFocused,
                ]}
              >
                <TextInput
                  style={styles.passwordInput}
                  value={passwordConfirmation}
                  onChangeText={setPasswordConfirmation}
                  onFocus={() => setPasswordConfirmationFocused(true)}
                  onBlur={() => setPasswordConfirmationFocused(false)}
                  placeholder="••••••••"
                  placeholderTextColor={colors.textGhost}
                  secureTextEntry={!showPasswordConfirmation}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <Pressable
                  onPress={() => setShowPasswordConfirmation((value) => !value)}
                  hitSlop={8}
                  style={styles.eyeBtn}
                >
                  <Ionicons
                    name={showPasswordConfirmation ? 'eye-outline' : 'eye-off-outline'}
                    size={20}
                    color={colors.textMuted}
                  />
                </Pressable>
              </View>
            </View>
          </View>

          <Pressable
            style={[styles.registerBtn, !canSubmit && styles.registerBtnDisabled]}
            onPress={handleRegister}
            disabled={!canSubmit}
          >
            <Text style={styles.registerBtnText}>Tạo tài khoản</Text>
          </Pressable>

          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Đã có tài khoản? </Text>
            <Pressable hitSlop={8} onPress={() => router.replace('/login')}>
              <Text style={styles.loginLink}>Đăng nhập</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (colors: AppColorsType) =>
  StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bgApp,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 32,
    gap: 20,
  },
  brandSection: {
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  logoBox: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: colors.primarySurface,
    borderWidth: 1,
    borderColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  logoEmoji: {
    fontSize: scale(36),
  },
  appName: {
    fontFamily: FontFamily.sansExtraBold,
    fontSize: scale(28),
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  tagline: {
    fontFamily: FontFamily.sans,
    fontSize: scale(14),
    lineHeight: scale(22),
    color: colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: colors.bgSurface1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    padding: 20,
    gap: 16,
  },
  cardTitle: {
    fontFamily: FontFamily.sansBold,
    fontSize: scale(18),
    color: colors.textPrimary,
    marginBottom: 4,
  },
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
  registerBtn: {
    height: 52,
    backgroundColor: colors.primaryMain,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  registerBtnDisabled: {
    opacity: 0.45,
  },
  registerBtnText: {
    fontFamily: FontFamily.sansBold,
    fontSize: scale(15),
    color: colors.textPrimary,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  loginText: {
    fontFamily: FontFamily.sans,
    fontSize: scale(14),
    color: colors.textMuted,
  },
  loginLink: {
    fontFamily: FontFamily.sansBold,
    fontSize: scale(14),
    color: colors.primaryMain,
  },
});
