import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
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

import { FormMessage } from "@/components/ui/form-message";
import { PasswordField } from "@/components/ui/password-field";
import { createAuthBaseStyles, scaleAuth } from "@/constants/auth-form-styles";
import { AppColorsType, FontFamily } from "@/constants/theme";
import { useAuth } from "@/hooks/auth-context";
import { useAppColors, useAppTheme } from "@/hooks/use-app-theme";
import { ApiError } from "@/services/api-client";

const scale = scaleAuth;

export default function LoginScreen() {
  const colors = useAppColors();
  const { resolvedTheme } = useAppTheme();
  const { login } = useAuth();
  const styles = createStyles(colors);
  const primaryForeground =
    resolvedTheme === "dark" ? colors.textPrimary : "#ffffff";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailFocused, setEmailFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canSubmit = email.trim().length > 0 && password.length > 0;

  const handleLogin = async () => {
    if (!canSubmit || loading) return;
    setError("");
    setLoading(true);
    try {
      await login(email.trim(), password);
      router.replace("/(tabs)");
    } catch (e) {
      if (e instanceof ApiError) {
        setError(e.message || "Email hoặc mật khẩu không đúng");
      } else {
        setError("Không thể kết nối đến server. Vui lòng thử lại.");
      }
    } finally {
      setLoading(false);
    }
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
          {/* Branding */}
          <View style={styles.brandSection}>
            <Image
              source={require("@/assets/images/logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.tagline}>Hiểu rõ bản thân mỗi ngày</Text>
          </View>

          {/* Form card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Đăng nhập</Text>

            <FormMessage error={error} />

            {/* Email */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={[styles.input, emailFocused && styles.inputFocused]}
                value={email}
                onChangeText={(v) => {
                  setEmail(v);
                  setError("");
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
                setError("");
              }}
              editable={!loading}
            />
          </View>

          {/* Primary CTA */}
          <Pressable
            style={[
              styles.loginBtn,
              (!canSubmit || loading) && styles.loginBtnDisabled,
            ]}
            onPress={handleLogin}
            disabled={!canSubmit || loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color={primaryForeground} />
            ) : (
              <Text style={[styles.loginBtnText, { color: primaryForeground }]}>
                Đăng nhập
              </Text>
            )}
          </Pressable>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>hoặc</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Sign up */}
          <View style={styles.signupRow}>
            <Text style={styles.signupText}>Chưa có tài khoản? </Text>
            <Pressable hitSlop={8} onPress={() => router.push("/register")}>
              <Text style={styles.signupLink}>Đăng ký</Text>
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
    // login has more top padding for the logo
    scrollContent: { ...base.scrollContent, paddingTop: 40 },
    brandSection: {
      alignItems: "center",
      gap: 8,
      marginBottom: 4,
    },
    logo: {
      width: scale(80),
      height: scale(80),
      marginBottom: 4,
    },
    tagline: {
      fontFamily: FontFamily.sans,
      fontSize: scale(14),
      color: colors.textMuted,
    },
    cardTitle: {
      fontFamily: FontFamily.sansBold,
      fontSize: scale(18),
      color: colors.textPrimary,
      marginBottom: 4,
    },
    loginBtn: {
      height: 52,
      backgroundColor: colors.primaryMain,
      borderRadius: 4,
      alignItems: "center",
      justifyContent: "center",
    },
    loginBtnDisabled: {
      opacity: 0.45,
    },
    loginBtnText: {
      fontFamily: FontFamily.sansBold,
      fontSize: scale(15),
    },
    divider: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: colors.borderDefault,
    },
    dividerText: {
      fontFamily: FontFamily.sans,
      fontSize: scale(13),
      color: colors.textMuted,
    },
    signupRow: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      marginTop: 4,
    },
    signupText: {
      fontFamily: FontFamily.sans,
      fontSize: scale(14),
      color: colors.textMuted,
    },
    signupLink: {
      fontFamily: FontFamily.sansBold,
      fontSize: scale(14),
      color: colors.primaryMain,
    },
  });
};
