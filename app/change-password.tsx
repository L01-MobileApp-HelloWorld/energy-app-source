import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
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
import { AppColorsType, FontFamily } from "@/constants/theme";
import { useAuth } from "@/hooks/auth-context";
import { useAppColors, useAppTheme } from "@/hooks/use-app-theme";
import { ApiError } from "@/services/api-client";

const { width } = Dimensions.get("window");
const scale = (size: number) => (width / 390) * size;

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
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [currentPasswordFocused, setCurrentPasswordFocused] = useState(false);
  const [newPasswordFocused, setNewPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);
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
      await changePassword({
        currentPassword,
        newPassword,
      });
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

            {(error || success) && (
              <View
                style={[
                  styles.messageBox,
                  error ? styles.errorBox : styles.successBox,
                ]}
              >
                <Ionicons
                  name={error ? "alert-circle" : "checkmark-circle"}
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
            )}

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Mật khẩu hiện tại</Text>
              <View
                style={[
                  styles.input,
                  styles.inputRow,
                  currentPasswordFocused && styles.inputFocused,
                ]}
              >
                <TextInput
                  style={styles.passwordInput}
                  value={currentPassword}
                  onChangeText={(value) => {
                    setCurrentPassword(value);
                    clearMessages();
                  }}
                  onFocus={() => setCurrentPasswordFocused(true)}
                  onBlur={() => setCurrentPasswordFocused(false)}
                  placeholder="••••••••"
                  placeholderTextColor={colors.textGhost}
                  secureTextEntry={!showCurrentPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                />
                <Pressable
                  onPress={() => setShowCurrentPassword((value) => !value)}
                  hitSlop={8}
                  style={styles.eyeBtn}
                >
                  <Ionicons
                    name={showCurrentPassword ? "eye-outline" : "eye-off-outline"}
                    size={20}
                    color={colors.textMuted}
                  />
                </Pressable>
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Mật khẩu mới</Text>
              <View
                style={[
                  styles.input,
                  styles.inputRow,
                  newPasswordFocused && styles.inputFocused,
                ]}
              >
                <TextInput
                  style={styles.passwordInput}
                  value={newPassword}
                  onChangeText={(value) => {
                    setNewPassword(value);
                    clearMessages();
                  }}
                  onFocus={() => setNewPasswordFocused(true)}
                  onBlur={() => setNewPasswordFocused(false)}
                  placeholder="Ít nhất 6 ký tự, 1 chữ hoa, 1 số"
                  placeholderTextColor={colors.textGhost}
                  secureTextEntry={!showNewPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                />
                <Pressable
                  onPress={() => setShowNewPassword((value) => !value)}
                  hitSlop={8}
                  style={styles.eyeBtn}
                >
                  <Ionicons
                    name={showNewPassword ? "eye-outline" : "eye-off-outline"}
                    size={20}
                    color={colors.textMuted}
                  />
                </Pressable>
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Xác nhận mật khẩu mới</Text>
              <View
                style={[
                  styles.input,
                  styles.inputRow,
                  confirmPasswordFocused && styles.inputFocused,
                ]}
              >
                <TextInput
                  style={styles.passwordInput}
                  value={confirmNewPassword}
                  onChangeText={(value) => {
                    setConfirmNewPassword(value);
                    clearMessages();
                  }}
                  onFocus={() => setConfirmPasswordFocused(true)}
                  onBlur={() => setConfirmPasswordFocused(false)}
                  placeholder="••••••••"
                  placeholderTextColor={colors.textGhost}
                  secureTextEntry={!showConfirmNewPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                />
                <Pressable
                  onPress={() =>
                    setShowConfirmNewPassword((value) => !value)
                  }
                  hitSlop={8}
                  style={styles.eyeBtn}
                >
                  <Ionicons
                    name={
                      showConfirmNewPassword
                        ? "eye-outline"
                        : "eye-off-outline"
                    }
                    size={20}
                    color={colors.textMuted}
                  />
                </Pressable>
              </View>
            </View>
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
    },
    cardSubtitle: {
      fontFamily: FontFamily.sans,
      fontSize: scale(14),
      lineHeight: scale(21),
      color: colors.textMuted,
    },
    messageBox: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: colors.bgSurface2,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderWidth: 1,
    },
    errorBox: {
      borderColor: colors.stateExhaustedText + "33",
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
      flexDirection: "row",
      alignItems: "center",
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
    submitBtn: {
      height: 52,
      backgroundColor: colors.primaryMain,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
    },
    submitBtnDisabled: {
      opacity: 0.45,
    },
    submitBtnText: {
      fontFamily: FontFamily.sansBold,
      fontSize: scale(15),
    },
  });
