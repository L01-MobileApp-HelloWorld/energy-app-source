import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
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

export default function ProfileUpdateScreen() {
  const colors = useAppColors();
  const { resolvedTheme } = useAppTheme();
  const { user, updateProfile } = useAuth();
  const styles = createStyles(colors);
  const primaryForeground =
    resolvedTheme === "dark" ? colors.textPrimary : "#ffffff";

  // const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [displayNameFocused, setDisplayNameFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!user) return;

    // setUsername(user.username ?? "");
    setDisplayName(user.displayName ?? "");
  }, [user]);

  const canSubmit = displayName.trim().length > 0;

  const clearMessages = () => {
    if (error) setError("");
    if (success) setSuccess("");
  };

  const handleSave = async () => {
    if (!user || !canSubmit || loading) return;

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await updateProfile({
        displayName: displayName.trim(),
      });
      setSuccess("Cập nhật hồ sơ thành công");
    } catch (e) {
      if (e instanceof ApiError) {
        setError(e.message || "Cập nhật hồ sơ thất bại");
      } else {
        setError("Không thể kết nối đến server. Vui lòng thử lại.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.screen} edges={["top", "bottom"]}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>
            Không tìm thấy thông tin tài khoản
          </Text>
          <Pressable
            style={styles.secondaryBtn}
            onPress={() => router.replace("/login")}
          >
            <Text style={styles.secondaryBtnText}>Về đăng nhập</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

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
          <ScreenBackTitle
            title="Cập nhật hồ sơ"
            onPress={() => router.back()}
          />

          <View style={styles.heroCard}>
            <View style={styles.avatarBox}>
              <Text style={styles.avatarEmoji}>🧑</Text>
            </View>
            <Text style={styles.heroTitle}>
              {user.displayName || user.username}
            </Text>
            <Text style={styles.heroSubtitle}>
              Chỉnh sửa thông tin hiển thị tài khoản của bạn
            </Text>
          </View>

          <View style={styles.card}>
            {Boolean(error || success) && (
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

            {/* <View style={styles.fieldGroup}>
              <Text style={styles.label}>Tên người dùng</Text>
              <View style={[styles.input, styles.readOnlyInput]}>
                <Text style={styles.readOnlyText}>{username}</Text>
              </View>
              <Text style={styles.helperText}>
                Username hiện chỉ xem, chưa hỗ trợ chỉnh sửa.
              </Text>
            </View> */}

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Tên hiển thị</Text>
              <TextInput
                style={[
                  styles.input,
                  displayNameFocused && styles.inputFocused,
                ]}
                value={displayName}
                onChangeText={(value) => {
                  setDisplayName(value);
                  clearMessages();
                }}
                onFocus={() => setDisplayNameFocused(true)}
                onBlur={() => setDisplayNameFocused(false)}
                placeholder="Tên sẽ hiển thị trong ứng dụng"
                placeholderTextColor={colors.textGhost}
                autoCorrect={false}
                editable={!loading}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={[styles.input, styles.readOnlyInput]}>
                <Text style={styles.readOnlyText}>{user.email}</Text>
              </View>
            </View>
          </View>

          <Pressable
            style={[
              styles.saveBtn,
              (!canSubmit || loading) && styles.saveBtnDisabled,
            ]}
            onPress={handleSave}
            disabled={!canSubmit || loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color={primaryForeground} />
            ) : (
              <Text style={[styles.saveBtnText, { color: primaryForeground }]}>
                Lưu thay đổi
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
      paddingTop: 12,
      paddingBottom: 32,
      gap: 20,
    },
    heroCard: {
      backgroundColor: colors.bgSurface1,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: colors.borderDefault,
      alignItems: "center",
      paddingHorizontal: 24,
      paddingVertical: 28,
      gap: 10,
    },
    avatarBox: {
      width: 72,
      height: 72,
      borderRadius: 24,
      backgroundColor: colors.primarySurface,
      alignItems: "center",
      justifyContent: "center",
    },
    avatarEmoji: {
      fontSize: scale(34),
    },
    heroTitle: {
      fontFamily: FontFamily.sansExtraBold,
      fontSize: scale(24),
      lineHeight: scale(30),
      color: colors.textPrimary,
      textAlign: "center",
    },
    heroSubtitle: {
      fontFamily: FontFamily.sans,
      fontSize: scale(14),
      lineHeight: scale(21),
      color: colors.textMuted,
      textAlign: "center",
    },
    card: {
      backgroundColor: colors.bgSurface1,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: colors.borderDefault,
      paddingHorizontal: 20,
      paddingVertical: 22,
      gap: 18,
    },
    messageBox: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      borderRadius: 14,
      borderWidth: 1,
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    errorBox: {
      backgroundColor: colors.bgSurface2,
      borderColor: colors.stateExhaustedText,
    },
    successBox: {
      backgroundColor: colors.primarySurface,
      borderColor: colors.primaryLight,
    },
    messageText: {
      flex: 1,
      fontFamily: FontFamily.sansSemiBold,
      fontSize: scale(13),
      lineHeight: scale(18),
    },
    errorText: {
      color: colors.stateExhaustedText,
    },
    successText: {
      color: colors.primaryMain,
    },
    fieldGroup: {
      gap: 8,
    },
    label: {
      fontFamily: FontFamily.sansSemiBold,
      fontSize: scale(13),
      color: colors.textMuted,
      letterSpacing: 0.3,
    },
    input: {
      minHeight: 54,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.borderDefault,
      backgroundColor: colors.bgSurface2,
      paddingHorizontal: 16,
      fontFamily: FontFamily.sans,
      fontSize: scale(15),
      color: colors.textPrimary,
    },
    inputFocused: {
      borderColor: colors.primaryMain,
      backgroundColor: colors.bgSurface1,
    },
    readOnlyInput: {
      justifyContent: "center",
      opacity: 0.72,
    },
    readOnlyText: {
      fontFamily: FontFamily.sans,
      fontSize: scale(15),
      color: colors.textPrimary,
    },
    helperText: {
      fontFamily: FontFamily.sans,
      fontSize: scale(12),
      color: colors.textGhost,
      lineHeight: scale(18),
    },
    saveBtn: {
      minHeight: 54,
      borderRadius: 8,
      backgroundColor: colors.primaryMain,
      alignItems: "center",
      justifyContent: "center",
    },
    saveBtnDisabled: {
      opacity: 0.5,
    },
    saveBtnText: {
      fontFamily: FontFamily.sansBold,
      fontSize: scale(16),
    },
    emptyState: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 24,
      gap: 16,
    },
    emptyTitle: {
      fontFamily: FontFamily.sansBold,
      fontSize: scale(18),
      color: colors.textPrimary,
      textAlign: "center",
    },
    secondaryBtn: {
      minHeight: 48,
      borderRadius: 16,
      paddingHorizontal: 18,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.borderDefault,
      backgroundColor: colors.bgSurface1,
    },
    secondaryBtnText: {
      fontFamily: FontFamily.sansSemiBold,
      fontSize: scale(14),
      color: colors.textPrimary,
    },
  });
