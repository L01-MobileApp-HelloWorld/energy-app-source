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

import { AppColors, FontFamily } from '@/constants/theme';

const { width } = Dimensions.get('window');
const scale = (size: number) => (width / 390) * size;

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);


  const handleLogin = () => {
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
          {/* Branding */}
          <View style={styles.brandSection}>
            <View style={styles.logoBox}>
              <Text style={styles.logoEmoji}>⚡</Text>
            </View>
            <Text style={styles.appName}>Energy Check</Text>
            <Text style={styles.tagline}>Hiểu rõ bản thân mỗi ngày</Text>
          </View>

          {/* Form card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Đăng nhập</Text>

            {/* Email */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={[styles.input, emailFocused && styles.inputFocused]}
                value={email}
                onChangeText={setEmail}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                placeholder="you@example.com"
                placeholderTextColor={AppColors.textGhost}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Password */}
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
                  placeholderTextColor={AppColors.textGhost}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <Pressable
                  onPress={() => setShowPassword((v) => !v)}
                  hitSlop={8}
                  style={styles.eyeBtn}
                >
                  <Ionicons
                    name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={20}
                    color={AppColors.textMuted}
                  />
                </Pressable>
              </View>
            </View>

            {/* Forgot password */}
            <Pressable style={styles.forgotRow} hitSlop={8}>
              <Text style={styles.forgotText}>Quên mật khẩu?</Text>
            </Pressable>
          </View>

          {/* Primary CTA */}
          <Pressable
            style={styles.loginBtn}
            onPress={handleLogin}
          >
            <Text style={styles.loginBtnText}>Đăng nhập</Text>
          </Pressable>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>hoặc</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Google button */}
          <Pressable style={styles.googleBtn}>
            <Text style={styles.googleIcon}>G</Text>
            <Text style={styles.googleBtnText}>Tiếp tục với Google</Text>
          </Pressable>

          {/* Sign up */}
          <View style={styles.signupRow}>
            <Text style={styles.signupText}>Chưa có tài khoản? </Text>
            <Pressable hitSlop={8}>
              <Text style={styles.signupLink}>Đăng ký</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: AppColors.bgApp,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 32,
    gap: 20,
  },

  // Branding
  brandSection: {
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  logoBox: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: AppColors.primarySurface,
    borderWidth: 1,
    borderColor: AppColors.primaryLight,
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
    color: AppColors.textPrimary,
    letterSpacing: -0.5,
  },
  tagline: {
    fontFamily: FontFamily.sans,
    fontSize: scale(14),
    color: AppColors.textMuted,
  },

  // Form card
  card: {
    backgroundColor: AppColors.bgSurface1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: AppColors.borderDefault,
    padding: 20,
    gap: 16,
  },
  cardTitle: {
    fontFamily: FontFamily.sansBold,
    fontSize: scale(18),
    color: AppColors.textPrimary,
    marginBottom: 4,
  },

  // Fields
  fieldGroup: {
    gap: 6,
  },
  label: {
    fontFamily: FontFamily.sansSemiBold,
    fontSize: scale(13),
    color: AppColors.textSecondary,
  },
  input: {
    backgroundColor: AppColors.bgSurface2,
    borderWidth: 1,
    borderColor: AppColors.borderDefault,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: FontFamily.sans,
    fontSize: scale(15),
    color: AppColors.textPrimary,
  },
  inputFocused: {
    borderColor: AppColors.primaryMain,
    backgroundColor: AppColors.bgSurface1,
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
    color: AppColors.textPrimary,
    paddingVertical: 12,
  },
  eyeBtn: {
    padding: 12,
  },

  // Forgot
  forgotRow: {
    alignSelf: 'flex-end',
  },
  forgotText: {
    fontFamily: FontFamily.sansSemiBold,
    fontSize: scale(13),
    color: AppColors.primaryMain,
  },

  // Login button
  loginBtn: {
    height: 52,
    backgroundColor: AppColors.primaryMain,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginBtnDisabled: {
    opacity: 0.45,
  },
  loginBtnText: {
    fontFamily: FontFamily.sansBold,
    fontSize: scale(15),
    color: '#ffffff',
  },

  // Divider
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: AppColors.borderDefault,
  },
  dividerText: {
    fontFamily: FontFamily.sans,
    fontSize: scale(13),
    color: AppColors.textMuted,
  },

  // Google button
  googleBtn: {
    height: 52,
    backgroundColor: AppColors.bgSurface1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: AppColors.borderDefault,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  googleIcon: {
    fontFamily: FontFamily.sansBold,
    fontSize: scale(16),
    color: AppColors.textPrimary,
  },
  googleBtnText: {
    fontFamily: FontFamily.sansSemiBold,
    fontSize: scale(14),
    color: AppColors.textPrimary,
  },

  // Sign up
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  signupText: {
    fontFamily: FontFamily.sans,
    fontSize: scale(14),
    color: AppColors.textMuted,
  },
  signupLink: {
    fontFamily: FontFamily.sansBold,
    fontSize: scale(14),
    color: AppColors.primaryMain,
  },
});
