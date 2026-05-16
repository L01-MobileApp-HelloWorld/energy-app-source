import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ScreenBackTitle } from "@/components/ui/ScreenBackTitle";
import { AppColorsType, FontFamily } from "@/constants/theme";
import { useAuth } from "@/hooks/auth-context";
import { useAppColors, useAppTheme } from "@/hooks/use-app-theme";

const { width } = Dimensions.get("window");
const scale = (size: number) => (width / 390) * size;

export default function SettingsScreen() {
  const colors = useAppColors();
  const styles = createStyles(colors);
  const { resolvedTheme, setThemePreference } = useAppTheme();
  const { user, logout } = useAuth();
  const isDarkModeEnabled = resolvedTheme === "dark";
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = () => {
    Alert.alert("Đăng xuất", "Bạn có chắc chắn muốn đăng xuất?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Đăng xuất",
        style: "destructive",
        onPress: async () => {
          setLoggingOut(true);
          try {
            await logout();
            router.replace("/login");
          } catch {
            setLoggingOut(false);
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.screen} edges={["top", "bottom"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <ScreenBackTitle
            title="Cài đặt"
            onPress={() => router.replace("/(tabs)")}
          />
        </View>

        {/* User info */}
        {user && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>TÀI KHOẢN</Text>
            <Pressable
              style={styles.card}
              onPress={() => router.push("/profile-update")}
              accessibilityRole="button"
              accessibilityLabel="Mở trang cập nhật hồ sơ"
            >
              <View style={styles.row}>
                <View style={styles.rowLeft}>
                  <View
                    style={[
                      styles.iconWrap,
                      { backgroundColor: colors.primarySurface },
                    ]}
                  >
                    <Text style={{ fontSize: 22 }}>👤</Text>
                  </View>
                  <View style={styles.textWrap}>
                    <Text style={styles.itemTitle}>
                      {user.displayName || user.username}
                    </Text>
                    <Text style={styles.itemSubtitle}>{user.email}</Text>
                  </View>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={colors.textGhost}
                />
              </View>
            </Pressable>
          </View>
        )}

        <View style={{ height: 16 }} />

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>HIỂN THỊ</Text>

          <View style={styles.card}>
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <View style={styles.iconWrap}>
                  <Ionicons
                    name="moon-outline"
                    size={24}
                    color={colors.primaryMain}
                  />
                </View>

                <View style={styles.textWrap}>
                  <Text style={styles.itemTitle}>Chế độ tối</Text>
                  <Text style={styles.itemSubtitle}>
                    Tối ưu hóa cho ban đêm
                  </Text>
                </View>
              </View>

              <Switch
                value={isDarkModeEnabled}
                onValueChange={(value) =>
                  setThemePreference(value ? "dark" : "light")
                }
                trackColor={{
                  false: colors.bgSurface3,
                  true: colors.primaryLight,
                }}
                thumbColor={colors.bgSurface1}
                ios_backgroundColor={colors.bgSurface3}
              />
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.accountRow}
            activeOpacity={0.7}
            onPress={() => router.push("/change-password")}
          >
            <Ionicons
              name="key-outline"
              size={20}
              color={colors.primaryMain}
            />
            <Text
              style={[
                styles.accountRowText,
                { color: colors.textPrimary },
              ]}
            >
              Đổi mật khẩu
            </Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.accountRow}
            activeOpacity={0.7}
            onPress={handleLogout}
            disabled={loggingOut}
          >
            {loggingOut ? (
              <ActivityIndicator
                size="small"
                color={colors.stateExhaustedText}
              />
            ) : (
              <Ionicons
                name="log-out-outline"
                size={20}
                color={colors.stateExhaustedText}
              />
            )}
            <Text
              style={[
                styles.accountRowText,
                { color: colors.stateExhaustedText },
              ]}
            >
              Đăng xuất
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (colors: AppColorsType) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.bgApp,
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 32,
    },
    header: {
      marginBottom: 28,
    },
    section: {
      gap: 16,
    },
    sectionLabel: {
      fontFamily: FontFamily.sansSemiBold,
      fontSize: scale(13),
      color: colors.textMuted,
      letterSpacing: 0.6,
    },
    card: {
      backgroundColor: colors.bgSurface1,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.borderDefault,
      paddingHorizontal: 16,
      paddingVertical: 18,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 16,
    },
    rowLeft: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
    },
    iconWrap: {
      width: 48,
      height: 48,
      borderRadius: 14,
      backgroundColor: colors.bgSurface2,
      alignItems: "center",
      justifyContent: "center",
    },
    textWrap: {
      flex: 1,
      gap: 4,
    },
    itemTitle: {
      fontFamily: FontFamily.sansBold,
      fontSize: scale(17),
      color: colors.textPrimary,
    },
    itemSubtitle: {
      fontFamily: FontFamily.sans,
      fontSize: scale(13),
      color: colors.textMuted,
      lineHeight: scale(19),
    },
    footer: {
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 12,
      gap: 16,
    },
    accountRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingVertical: 4,
    },
    accountRowText: {
      fontFamily: FontFamily.sansMedium,
      fontSize: scale(15),
      color: colors.textSecondary,
    },
    divider: {
      height: 1,
      backgroundColor: colors.borderDefault,
      marginVertical: 12,
    },
  });
