import DateTimePicker from "@react-native-community/datetimepicker";
import { router } from "expo-router";
import React, { useState } from "react";
import {
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
import { useAppColors, useAppTheme } from "@/hooks/use-app-theme";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");
const scale = (size: number) => (width / 390) * size;

// 5 chips per row, 4 gaps of 8px, 40px Actionsheet padding
const CHIP_GAP = 8;
const CHIPS_PER_ROW = 5;
const CHIP_SIZE = Math.floor(
  (width - 40 - (CHIPS_PER_ROW - 1) * CHIP_GAP) / CHIPS_PER_ROW,
);

const DAYS = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "CN"];

type FrequencyKey = "daily" | "twice" | "custom";
const FREQ_OPTIONS: { key: FrequencyKey; label: string }[] = [
  { key: "daily", label: "Hàng ngày" },
  { key: "twice", label: "2 lần / Ngày" },
  { key: "custom", label: "Tùy chỉnh" },
];

export default function ReminderScreen() {
  const colors = useAppColors();
  const { resolvedTheme } = useAppTheme();
  const styles = createStyles(colors, resolvedTheme);
  const primaryForeground =
    resolvedTheme === "dark" ? colors.textPrimary : "#ffffff";
  const [isEnabled, setIsEnabled] = useState(true);
  const [time, setTime] = useState(() => new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [frequency, setFrequency] = useState<FrequencyKey>("daily");
  const [customDays, setCustomDays] = useState<Set<number>>(new Set([2, 5, 6]));
  const [showFreqSheet, setShowFreqSheet] = useState(false);

  const hour = time.getHours();
  const minute = time.getMinutes();
  const timeLabel = `${String(hour).padStart(2, "0")} : ${String(minute).padStart(2, "0")}`;

  const handleTimeChange = (_: unknown, selected: Date) => {
    if (selected) setTime(selected);
    if (Platform.OS === "android") setShowTimePicker(false);
  };

  const toggleDay = (idx: number) =>
    setCustomDays((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });

  const handleFrequencyPress = (key: FrequencyKey) => {
    if (key === "custom") setShowFreqSheet(true);
    else setFrequency(key);
  };

  const handleSaveCustom = () => {
    setFrequency("custom");
    setShowFreqSheet(false);
  };

  return (
    <SafeAreaView style={styles.screen} edges={["top", "bottom"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <ScreenBackTitle
            title="Nhắc nhở thông minh"
            onPress={() => router.back()}
          />
        </View>

        {/* Toggle Card */}
        <View style={styles.card}>
          <View style={styles.toggleRow}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={styles.cardLabel}>Bật nhắc nhở</Text>
              <Text style={styles.cardSub}>
                Nhắc bạn kiểm tra trạng thái mỗi tối trước khi ngủ
              </Text>
            </View>
            <Switch
              value={isEnabled}
              onValueChange={setIsEnabled}
              trackColor={{
                false: colors.bgSurface3,
                true: colors.primaryMain,
              }}
              thumbColor={colors.bgSurface1}
              ios_backgroundColor={colors.bgSurface3}
            />
          </View>
        </View>

        {/* Time Card */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Giờ nhắc nhở</Text>
          <Pressable
            style={styles.timeRow}
            onPress={() => setShowTimePicker(true)}
          >
            <Text style={styles.timeValue}>{timeLabel}</Text>
          </Pressable>
        </View>

        {/* Frequency Card */}
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
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Pressable style={styles.saveBtn} onPress={() => router.back()}>
          <Text style={[styles.saveBtnText, { color: primaryForeground }]}>
            Lưu nhắc nhở
          </Text>
          <Ionicons name="checkmark" size={18} color={primaryForeground} />
        </Pressable>
      </View>

      {/* Time Picker — Android native dialog */}
      {Platform.OS === "android" && showTimePicker && (
        <DateTimePicker
          value={time}
          mode="time"
          display="default"
          onValueChange={handleTimeChange}
          onDismiss={() => setShowTimePicker(false)}
          is24Hour
        />
      )}

      {/* Time Picker — iOS bottom sheet */}
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
                onValueChange={handleTimeChange}
                onDismiss={() => setShowTimePicker(false)}
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

      {/* Custom Frequency Bottom Sheet */}
      <Actionsheet
        isOpen={showFreqSheet}
        onClose={() => setShowFreqSheet(false)}
      >
        <ActionsheetBackdrop onPress={() => setShowFreqSheet(false)} />
        <ActionsheetContent style={{ backgroundColor: colors.bgSurface1 }}>
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>
          <View style={styles.sheetInner}>
            <Text style={styles.sheetTitle}>Tùy chỉnh tần suất nhắc nhở</Text>
            <View style={styles.daysGrid}>
              {DAYS.map((day, idx) => {
                const selected = customDays.has(idx);
                return (
                  <Pressable
                    key={day}
                    style={[styles.dayChip, selected && styles.dayChipActive]}
                    onPress={() => toggleDay(idx)}
                  >
                    <Text
                      style={[
                        styles.dayChipText,
                        selected && styles.dayChipTextActive,
                      ]}
                    >
                      {day}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <Pressable style={styles.saveBtn} onPress={handleSaveCustom}>
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
    scrollContent: { padding: 20, gap: 16 },

    header: {
      marginBottom: 4,
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

    toggleRow: {
      flexDirection: "row",
      alignItems: "center",
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
      // fontFamily: FontFamily.sansSemiBold,
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
