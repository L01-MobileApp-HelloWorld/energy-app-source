import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ScreenBackTitle } from "@/components/ui/ScreenBackTitle";
import { FormMessage } from "@/components/ui/form-message";
import { PasswordField } from "@/components/ui/password-field";
import { createAuthBaseStyles, scaleAuth } from "@/constants/auth-form-styles";
import { AppColorsType, FontFamily } from "@/constants/theme";
import { useAuth } from "@/hooks/auth-context";
import { useAppColors, useAppTheme } from "@/hooks/use-app-theme";
import { ApiError } from "@/services/api-client";

const scale = scaleAuth;

function generateRegistrationUsername() {
  const randomPart = Math.random().toString(36).slice(2, 10).padEnd(8, "0");
  return `user_${Date.now().toString(36)}_${randomPart}`;
}

export default function RegisterScreen() {
  const colors = useAppColors();
  const { resolvedTheme } = useAppTheme();
  const { register } = useAuth();
  const styles = createStyles(colors);
  const primaryForeground =
    resolvedTheme === "dark" ? colors.textPrimary : "#ffffff";

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [displayNameFocused, setDisplayNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canSubmit =
    email.trim().length > 0 &&
    password.length >= 6 &&
    passwordConfirmation.length > 0;

  const handleRegister = async () => {
    if (!canSubmit || loading) return;

    if (password !== passwordConfirmation) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }
    if (!/[A-Z]/.test(password)) {
      setError("Mật khẩu phải chứa ít nhất 1 chữ hoa");
      return;
    }
    if (!/[0-9]/.test(password)) {
      setError("Mật khẩu phải chứa ít nhất 1 số");
      return;
    }

    setError("");
    setLoading(true);
    try {
      const generatedUsername = generateRegistrationUsername();
      await register(
        generatedUsername,
        displayName.trim() || undefined,
        email.trim(),
        password,
      );
      router.replace("/(tabs)");
    } catch (e) {
      console.log("e", e);
      if (e instanceof ApiError) {
        setError(e.message || "Đăng ký thất bại");
      } else {
        setError("Không thể kết nối đến server. Vui lòng thử lại.");
      }
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    if (error) setError("");
  };

  return (
    <SafeAreaView style={styles.screen} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <ScreenBackTitle title="Đăng ký" onPress={() => router.back()} />

          <View style={styles.brandSection}>
            <Text style={styles.tagline}>
              Tạo tài khoản để bắt đầu hành trình theo dõi năng lượng
            </Text>
          </View>

          <View style={styles.card}>
            <FormMessage error={error} />

            {/* Display Name */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Tên hiển thị</Text>
              <TextInput
                style={[
                  styles.input,
                  displayNameFocused && styles.inputFocused,
                ]}
                value={displayName}
                onChangeText={(v) => {
                  setDisplayName(v);
                  clearError();
                }}
                onFocus={() => setDisplayNameFocused(true)}
                onBlur={() => setDisplayNameFocused(false)}
                placeholder="Tên sẽ hiển thị trong ứng dụng"
                placeholderTextColor={colors.textGhost}
                autoCorrect={false}
                editable={!loading}
              />
            </View>

            {/* Email */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={[styles.input, emailFocused && styles.inputFocused]}
                value={email}
                onChangeText={(v) => {
                  setEmail(v);
                  clearError();
                }}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                placeholder="you@example.com"
                placeholderTextColor={colors.textGhost}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
            </View>

            <PasswordField
              label="Mật khẩu"
              value={password}
              onChangeText={(v) => {
                setPassword(v);
                clearError();
              }}
              placeholder="Ít nhất 6 ký tự, 1 chữ hoa, 1 số"
              editable={!loading}
            />

            <PasswordField
              label="Xác nhận mật khẩu"
              value={passwordConfirmation}
              onChangeText={(v) => {
                setPasswordConfirmation(v);
                clearError();
              }}
              editable={!loading}
            />
          </View>

          <Pressable
            style={[
              styles.registerBtn,
              (!canSubmit || loading) && styles.registerBtnDisabled,
            ]}
            onPress={handleRegister}
            disabled={!canSubmit || loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color={primaryForeground} />
            ) : (
              <Text
                style={[styles.registerBtnText, { color: primaryForeground }]}
              >
                Tạo tài khoản
              </Text>
            )}
          </Pressable>

          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Đã có tài khoản? </Text>
            <Pressable hitSlop={8} onPress={() => router.replace("/login")}>
              <Text style={styles.loginLink}>Đăng nhập</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (colors: AppColorsType) => {
  const base = createAuthBaseStyles(colors);
  return StyleSheet.create({
    ...base,
    // scrollContent uses default paddingTop (24) from base — matches
    scrollContent: { ...base.scrollContent, paddingTop: 24 },
    brandSection: {
      alignItems: "center",
      gap: 8,
      marginBottom: 4,
    },
    tagline: {
      fontFamily: FontFamily.sans,
      fontSize: scale(14),
      lineHeight: scale(22),
      color: colors.textMuted,
      textAlign: "center",
      paddingHorizontal: 20,
    },
    registerBtn: {
      height: 52,
      backgroundColor: colors.primaryMain,
      borderRadius: 4,
      alignItems: "center",
      justifyContent: "center",
    },
    registerBtnDisabled: {
      opacity: 0.45,
    },
    registerBtnText: {
      fontFamily: FontFamily.sansBold,
      fontSize: scale(15),
    },
    loginRow: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
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
};
