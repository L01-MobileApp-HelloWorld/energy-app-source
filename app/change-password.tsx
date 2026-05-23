import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
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

export default function ChangePasswordScreen() {
  const colors = useAppColors();
  const { resolvedTheme } = useAppTheme();
  const { changePassword } = useAuth();
  const styles = createStyles(colors);
  const primaryForeground =
    resolvedTheme === "dark" ? colors.textPrimary : "#ffffff";
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    return () => {
      if (successTimerRef.current) {
        clearTimeout(successTimerRef.current);
      }
    };
  }, []);

  const clearMessages = () => {
    if (error) setError("");
    if (success) setSuccess("");
  };

  const canSubmit =
    currentPassword.length > 0 &&
    newPassword.length >= 6 &&
    confirmNewPassword.length > 0;

  const handleSubmit = async () => {
    if (!canSubmit || loading) return;

    if (!/[A-Z]/.test(newPassword)) {
      setError("Mật khẩu mới phải chứa ít nhất 1 chữ hoa");
      return;
    }
    if (!/[0-9]/.test(newPassword)) {
      setError("Mật khẩu mới phải chứa ít nhất 1 số");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }
    if (currentPassword === newPassword) {
      setError("Mật khẩu mới phải khác mật khẩu hiện tại");
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await changePassword({ currentPassword, newPassword });
      setSuccess("Đổi mật khẩu thành công");
      successTimerRef.current = setTimeout(() => {
        router.back();
      }, 900);
    } catch (e) {
      if (e instanceof ApiError) {
        setError(e.message || "Đổi mật khẩu thất bại");
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
          <ScreenBackTitle title="Đổi mật khẩu" onPress={() => router.back()} />

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Bảo mật tài khoản</Text>
            <Text style={styles.cardSubtitle}>
              Nhập mật khẩu hiện tại và đặt mật khẩu mới cho tài khoản của bạn.
            </Text>

            <FormMessage error={error} success={success} />

            <PasswordField
              label="Mật khẩu hiện tại"
              value={currentPassword}
              onChangeText={(v) => {
                setCurrentPassword(v);
                clearMessages();
              }}
              editable={!loading}
            />

            <PasswordField
              label="Mật khẩu mới"
              value={newPassword}
              onChangeText={(v) => {
                setNewPassword(v);
                clearMessages();
              }}
              placeholder="Ít nhất 6 ký tự, 1 chữ hoa, 1 số"
              editable={!loading}
            />

            <PasswordField
              label="Xác nhận mật khẩu mới"
              value={confirmNewPassword}
              onChangeText={(v) => {
                setConfirmNewPassword(v);
                clearMessages();
              }}
              editable={!loading}
            />
          </View>

          <Pressable
            style={[
              styles.submitBtn,
              (!canSubmit || loading) && styles.submitBtnDisabled,
            ]}
            onPress={handleSubmit}
            disabled={!canSubmit || loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color={primaryForeground} />
            ) : (
              <Text style={[styles.submitBtnText, { color: primaryForeground }]}>
                Đổi mật khẩu
              </Text>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (colors: AppColorsType) => {
  const base = createAuthBaseStyles(colors);
  return StyleSheet.create({
    ...base,
    scrollContent: { ...base.scrollContent, paddingTop: 24 },
    cardTitle: {
      fontFamily: FontFamily.sansBold,
      fontSize: scale(18),
      color: colors.textPrimary,
    },
    cardSubtitle: {
      fontFamily: FontFamily.sans,
      fontSize: scale(14),
      lineHeight: scale(21),
      color: colors.textMuted,
    },
  });
};
