import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
} from "@/components/ui/actionsheet";
import { ScreenBackTitle } from "@/components/ui/ScreenBackTitle";
import { AppColorsType, AppTheme, FontFamily } from "@/constants/theme";
import { useAuth } from "@/hooks/auth-context";
import { useAppColors, useAppTheme } from "@/hooks/use-app-theme";
import { ApiError } from "@/services/api-client";

const { width } = Dimensions.get("window");
const scale = (size: number) => (width / 390) * size;

const CHIP_GAP = 8;
const CHIPS_PER_ROW = 5;
const CHIP_SIZE = Math.floor(
  (width - 40 - (CHIPS_PER_ROW - 1) * CHIP_GAP) / CHIPS_PER_ROW,
);

const DEFAULT_REMINDER_TIME = "22:00";

const DAYS = [
  { value: 2, label: "T2" },
  { value: 3, label: "T3" },
  { value: 4, label: "T4" },
  { value: 5, label: "T5" },
  { value: 6, label: "T6" },
  { value: 7, label: "T7" },
  { value: 1, label: "CN" },
];

type FrequencyKey = "daily" | "twice" | "custom";

const FREQ_OPTIONS: { key: FrequencyKey; label: string }[] = [
  { key: "daily", label: "Hàng ngày" },
  { key: "twice", label: "2 lần / ngày" },
  { key: "custom", label: "Tùy chỉnh" },
];

function parseReminderTime(value?: string) {
  const [hourRaw = "22", minuteRaw = "00"] = (value ?? DEFAULT_REMINDER_TIME)
    .split(":")
    .slice(0, 2);
  const hour = Number(hourRaw);
  const minute = Number(minuteRaw);
  const date = new Date();

  date.setHours(Number.isFinite(hour) ? hour : 22);
  date.setMinutes(Number.isFinite(minute) ? minute : 0);
  date.setSeconds(0);
  date.setMilliseconds(0);

  return date;
}

function formatReminderTime(date: Date) {
  return `${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes(),
  ).padStart(2, "0")}`;
}

export default function ReminderScreen() {
  const colors = useAppColors();
  const { resolvedTheme } = useAppTheme();
  const { user, updateProfile } = useAuth();
  const styles = createStyles(colors, resolvedTheme);
  const primaryForeground =
    resolvedTheme === "dark" ? colors.textPrimary : "#ffffff";
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isEnabled, setIsEnabled] = useState(false);
  const [time, setTime] = useState(() => parseReminderTime());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [frequency, setFrequency] = useState<FrequencyKey>("daily");
  const [customDays, setCustomDays] = useState<number[]>([]);
  const [draftCustomDays, setDraftCustomDays] = useState<number[]>([]);
  const [showFreqSheet, setShowFreqSheet] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!user) return;

    const prefs = user.preferences;
    const nextFrequency =
      prefs?.reminderFrequency === "daily" ||
      prefs?.reminderFrequency === "twice" ||
      prefs?.reminderFrequency === "custom"
        ? prefs.reminderFrequency
        : "daily";
    const nextCustomDays = Array.isArray(prefs?.customReminderDays)
      ? prefs.customReminderDays
          .filter((day): day is number => Number.isInteger(day) && day >= 1 && day <= 7)
          .sort((a, b) => a - b)
      : [];

    setIsEnabled(Boolean(prefs?.notificationsEnabled));
    setTime(parseReminderTime(prefs?.reminderTime));
    setFrequency(nextFrequency);
    setCustomDays(nextCustomDays);
    setDraftCustomDays(nextCustomDays);
  }, [user]);

  useEffect(() => {
    return () => {
      if (successTimerRef.current) {
        clearTimeout(successTimerRef.current);
      }
    };
  }, []);

  const timeLabel = useMemo(() => formatReminderTime(time), [time]);
  const isCustomFrequency = frequency === "custom";
  const canSaveCustomFrequency = draftCustomDays.length > 0;
  const canSubmit = !loading && (!isCustomFrequency || customDays.length > 0);

  const clearMessages = () => {
    if (error) setError("");
    if (success) {
      setSuccess("");
    }
    if (successTimerRef.current) {
      clearTimeout(successTimerRef.current);
      successTimerRef.current = null;
    }
  };

  const toggleDraftDay = (dayValue: number) => {
    clearMessages();
    setDraftCustomDays((prev) => {
      const exists = prev.includes(dayValue);
      const next = exists
        ? prev.filter((day) => day !== dayValue)
        : [...prev, dayValue];

      return next.sort((a, b) => a - b);
    });
  };

  const handleTimeChange = (event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === "android") {
      setShowTimePicker(false);
    }

    if (event.type === "dismissed" || !selected) {
      return;
    }

    clearMessages();
    setTime(selected);
  };

  const handleFrequencyPress = (key: FrequencyKey) => {
    clearMessages();

    if (key === "custom") {
      setDraftCustomDays(customDays);
      setShowFreqSheet(true);
      return;
    }

    setFrequency(key);
  };

  const handleCloseFrequencySheet = () => {
    setDraftCustomDays(customDays);
    setShowFreqSheet(false);
  };

  const handleSaveCustom = () => {
    if (!canSaveCustomFrequency) {
      return;
    }

    clearMessages();
    setCustomDays(draftCustomDays);
    setFrequency("custom");
    setShowFreqSheet(false);
  };

  const handleSaveReminder = async () => {
    if (!user || !canSubmit) {
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await updateProfile({
        preferences: {
          notificationsEnabled: isEnabled,
          reminderTime: formatReminderTime(time),
          reminderFrequency: frequency,
          customReminderDays: frequency === "custom" ? customDays : [],
        },
      });
      setSuccess("Đã lưu cài đặt nhắc nhở");
      successTimerRef.current = setTimeout(() => {
        setSuccess("");
        successTimerRef.current = null;
      }, 2200);
    } catch (e) {
      if (e instanceof ApiError) {
        setError(e.message || "Lưu nhắc nhở thất bại");
      } else {
        setError("Không thể kết nối đến server. Vui lòng thử lại.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen} edges={["top", "bottom"]}>
      {success ? (
        <View pointerEvents="none" style={styles.flashWrap}>
          <View style={styles.flashMessage}>
            <Ionicons
              name="checkmark-circle"
              size={16}
              color={colors.primaryMain}
            />
            <Text style={styles.flashMessageText}>{success}</Text>
          </View>
        </View>
      ) : null}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <ScreenBackTitle
            title="Nhắc nhở thông minh"
            onPress={() => router.back()}
          />
        </View>

        {error ? (
          <View
            style={[
              styles.messageBox,
              styles.errorBox,
            ]}
          >
            <Ionicons
              name="alert-circle"
              size={16}
              color={colors.stateExhaustedText}
            />
            <Text
              style={[
                styles.messageText,
                styles.errorText,
              ]}
            >
              {error}
            </Text>
          </View>
        ) : null}

        <View style={styles.card}>
          <View style={styles.toggleRow}>
            <View style={styles.toggleContent}>
              <Text style={styles.cardLabel}>Bật nhắc nhở</Text>
              <Text style={styles.cardSub}>
                Nhắc bạn kiểm tra trạng thái mỗi tối trước khi ngủ
              </Text>
            </View>
            <Switch
              value={isEnabled}
              onValueChange={(value) => {
                clearMessages();
                setIsEnabled(value);
              }}
              trackColor={{
                false: colors.bgSurface3,
                true: colors.primaryMain,
              }}
              thumbColor={colors.bgSurface1}
              ios_backgroundColor={colors.bgSurface3}
            />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Giờ nhắc nhở</Text>
          <Pressable
            style={styles.timeRow}
            onPress={() => setShowTimePicker(true)}
          >
            <Text style={styles.timeValue}>{timeLabel}</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Tần suất</Text>
          <View style={styles.freqRow}>
            {FREQ_OPTIONS.map(({ key, label }) => {
              const active = frequency === key;

              return (
                <Pressable
                  key={key}
                  style={[styles.freqChip, active && styles.freqChipActive]}
                  onPress={() => handleFrequencyPress(key)}
                >
                  <Text
                    style={[
                      styles.freqChipText,
                      active && styles.freqChipTextActive,
                    ]}
                  >
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {isCustomFrequency && (
            <Text style={styles.helperText}>
              {customDays.length > 0
                ? `Ngày đã chọn: ${DAYS.filter((day) =>
                    customDays.includes(day.value),
                  )
                    .map((day) => day.label)
                    .join(", ")}`
                : "Chọn ít nhất 1 ngày để lưu tần suất tùy chỉnh."}
            </Text>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          style={[styles.saveBtn, !canSubmit && styles.saveBtnDisabled]}
          onPress={handleSaveReminder}
          disabled={!canSubmit}
        >
          {loading ? (
            <ActivityIndicator size="small" color={primaryForeground} />
          ) : (
            <>
              <Text style={[styles.saveBtnText, { color: primaryForeground }]}>
                Lưu nhắc nhở
              </Text>
              <Ionicons name="checkmark" size={18} color={primaryForeground} />
            </>
          )}
        </Pressable>
      </View>

      {Platform.OS === "android" && showTimePicker && (
        <DateTimePicker
          value={time}
          mode="time"
          display="default"
          onChange={handleTimeChange}
          is24Hour
        />
      )}

      {Platform.OS === "ios" && (
        <Actionsheet
          isOpen={showTimePicker}
          onClose={() => setShowTimePicker(false)}
        >
          <ActionsheetBackdrop onPress={() => setShowTimePicker(false)} />
          <ActionsheetContent style={{ backgroundColor: colors.bgSurface1 }}>
            <ActionsheetDragIndicatorWrapper>
              <ActionsheetDragIndicator />
            </ActionsheetDragIndicatorWrapper>
            <View style={styles.sheetInner}>
              <Text style={styles.sheetTitle}>Chọn giờ nhắc nhở</Text>
              <DateTimePicker
                value={time}
                mode="time"
                display="spinner"
                onChange={handleTimeChange}
                is24Hour
                style={{ width: "100%" }}
                textColor={colors.textPrimary}
              />
              <Pressable
                style={styles.saveBtn}
                onPress={() => setShowTimePicker(false)}
              >
                <Text
                  style={[styles.saveBtnText, { color: primaryForeground }]}
                >
                  Xác nhận
                </Text>
              </Pressable>
            </View>
          </ActionsheetContent>
        </Actionsheet>
      )}

      <Actionsheet
        isOpen={showFreqSheet}
        onClose={handleCloseFrequencySheet}
      >
        <ActionsheetBackdrop onPress={handleCloseFrequencySheet} />
        <ActionsheetContent style={{ backgroundColor: colors.bgSurface1 }}>
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>
          <View style={styles.sheetInner}>
            <Text style={styles.sheetTitle}>Chọn ngày nhắc nhở</Text>
            <View style={styles.daysGrid}>
              {DAYS.map((day) => {
                const selected = draftCustomDays.includes(day.value);

                return (
                  <Pressable
                    key={day.value}
                    style={[styles.dayChip, selected && styles.dayChipActive]}
                    onPress={() => toggleDraftDay(day.value)}
                  >
                    <Text
                      style={[
                        styles.dayChipText,
                        selected && styles.dayChipTextActive,
                      ]}
                    >
                      {day.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <Text style={styles.sheetHelperText}>
              Cần chọn ít nhất 1 ngày để lưu tần suất tùy chỉnh.
            </Text>
            <Pressable
              style={[
                styles.saveBtn,
                !canSaveCustomFrequency && styles.saveBtnDisabled,
              ]}
              onPress={handleSaveCustom}
              disabled={!canSaveCustomFrequency}
            >
              <Text style={[styles.saveBtnText, { color: primaryForeground }]}>
                Lưu tần suất
              </Text>
              <Ionicons name="checkmark" size={18} color={primaryForeground} />
            </Pressable>
          </View>
        </ActionsheetContent>
      </Actionsheet>
    </SafeAreaView>
  );
}

const createStyles = (colors: AppColorsType, theme: AppTheme) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.bgApp },
    scroll: { flex: 1 },
    scrollContent: { padding: 20, gap: 16, paddingBottom: 24 },

    header: {
      marginBottom: 4,
    },

    flashWrap: {
      position: "absolute",
      top: 12,
      left: 20,
      right: 20,
      zIndex: 20,
    },
    flashMessage: {
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.primaryLight,
      backgroundColor: colors.primarySurface,
      paddingHorizontal: 14,
      paddingVertical: 12,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      shadowColor: colors.black,
      shadowOpacity: theme === "dark" ? 0.28 : 0.08,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
      elevation: 5,
    },
    flashMessageText: {
      flex: 1,
      fontFamily: FontFamily.sansMedium,
      fontSize: scale(13),
      color: colors.primaryMain,
    },

    messageBox: {
      borderRadius: 12,
      borderWidth: 1,
      paddingHorizontal: 14,
      paddingVertical: 12,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    errorBox: {
      backgroundColor: colors.stateExhaustedText + "14",
      borderColor: colors.stateExhaustedText + "33",
    },
    messageText: {
      flex: 1,
      fontFamily: FontFamily.sans,
      fontSize: scale(13),
    },
    errorText: {
      color: colors.stateExhaustedText,
    },
    card: {
      backgroundColor: colors.bgSurface1,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.borderDefault,
      padding: 16,
      gap: 12,
    },
    cardLabel: {
      fontFamily: FontFamily.sansBold,
      fontSize: scale(15),
      color: colors.textPrimary,
    },
    cardSub: {
      fontFamily: FontFamily.sans,
      fontSize: scale(13),
      color: colors.textMuted,
      lineHeight: scale(18),
    },
    helperText: {
      fontFamily: FontFamily.sans,
      fontSize: scale(12),
      color: colors.textMuted,
      lineHeight: scale(17),
    },

    toggleRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    toggleContent: {
      flex: 1,
      marginRight: 12,
    },

    timeRow: {
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.bgSurface1,
      borderRadius: 8,
      paddingVertical: 16,
    },
    timeValue: {
      fontFamily: FontFamily.monoMedium,
      fontSize: scale(44),
      color: colors.primaryMain,
      letterSpacing: 4,
    },

    freqRow: {
      flexDirection: "row",
      gap: 8,
      flexWrap: "wrap",
    },
    freqChip: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.borderDefault,
      backgroundColor: colors.bgSurface2,
    },
    freqChipActive: {
      backgroundColor: colors.primaryMain,
      borderColor: colors.primaryMain,
    },
    freqChipText: {
      fontFamily: FontFamily.sansSemiBold,
      fontSize: scale(13),
      color: colors.textSecondary,
    },
    freqChipTextActive: {
      color: theme === "dark" ? colors.textPrimary : "#ffffff",
    },

    footer: {
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 16,
    },
    saveBtn: {
      height: 52,
      borderRadius: 8,
      backgroundColor: colors.primaryMain,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    saveBtnDisabled: {
      opacity: 0.5,
    },
    saveBtnText: {
      fontFamily: FontFamily.sansBold,
      fontSize: scale(15),
    },

    sheetInner: {
      width: "100%",
      gap: 20,
      paddingTop: 8,
      paddingBottom: 8,
    },
    sheetTitle: {
      fontFamily: FontFamily.sansBold,
      fontSize: scale(16),
      color: colors.textPrimary,
    },
    sheetHelperText: {
      fontFamily: FontFamily.sans,
      fontSize: scale(12),
      color: colors.textMuted,
      lineHeight: scale(17),
    },
    daysGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: CHIP_GAP,
    },
    dayChip: {
      width: CHIP_SIZE,
      height: CHIP_SIZE,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.borderDefault,
      backgroundColor: colors.bgSurface2,
      alignItems: "center",
      justifyContent: "center",
    },
    dayChipActive: {
      backgroundColor: colors.primaryMain,
      borderColor: colors.primaryMain,
    },
    dayChipText: {
      fontFamily: FontFamily.sansSemiBold,
      fontSize: scale(12),
      color: colors.textSecondary,
      textAlign: "center",
    },
    dayChipTextActive: {
      color: colors.textPrimary,
    },
  });
