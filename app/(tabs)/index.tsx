import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Text } from "@/components/ui/text";
import { AppColorsType } from "@/constants/theme";
import { useAuth } from "@/hooks/auth-context";
import { useAppColors } from "@/hooks/use-app-theme";
import { apiClient } from "@/services/api-client";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import React, { useCallback, useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type HistoryApiItem = {
  _id: string;
  state: string;
  stateDetails?: {
    name?: string;
    emoji?: string;
  };
  createdAt: string;
};

const BACKEND_STATE_LABEL_MAP: Record<string, string> = {
  exhausted: "Kiệt sức",
  tired: "Mệt mỏi",
  lazy_with_deadline: "Trì hoãn",
  ready: "Sẵn sàng",
  focused: "Tập trung",
  unmotivated: "Mất động lực",
};

function getCurrentDateTime() {
  const now = new Date();
  const days = ["CN", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
  const day = days[now.getDay()];
  const h = now.getHours().toString().padStart(2, "0");
  const m = now.getMinutes().toString().padStart(2, "0");
  return `${day}, ${h}:${m}`;
}

function formatHistoryTimestamp(isoString: string) {
  const date = new Date(isoString);
  const now = new Date();
  const isSameDay =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();
  const weekdayLabelMap = ["CN", "Th2", "Th3", "Th4", "Th5", "Th6", "Th7"];
  const weekdayLabel = weekdayLabelMap[date.getDay()];
  const timeLabel = date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  if (isSameDay) {
    return `Hôm nay, ${timeLabel}`;
  }

  return `${weekdayLabel}, ${date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
  })}, ${timeLabel}`;
}

export default function HomeScreen() {
  const colors = useAppColors();
  const { user } = useAuth();
  const styles = createStyles(colors);
  const displayName = user?.displayName || user?.username || "bạn";
  const [latestHistory, setLatestHistory] = useState<HistoryApiItem | null>(
    null,
  );
  const cardStyle = {
    backgroundColor: colors.bgSurface1,
    borderRadius: 16,
    padding: 20,
    shadowColor: colors.black,
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  } as const;

  const fetchLatestHistory = useCallback(async () => {
    try {
      const res = await apiClient.get<{
        success: boolean;
        data: { histories: HistoryApiItem[] };
      }>("/histories", {
        query: {
          page: 1,
          limit: 1,
          sort: "createdAt:desc",
        },
      });

      setLatestHistory(res.data.histories[0] ?? null);
    } catch (error) {
      console.warn("[Home] fetch latest history failed:", error);
      setLatestHistory(null);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void fetchLatestHistory();
    }, [fetchLatestHistory]),
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgApp }}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 32,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <View>
            <Heading size="2xl" style={{ color: colors.textPrimary }}>
              Chào {displayName}! 👋
            </Heading>
            <Text
              size="sm"
              style={{ color: colors.textDisabled, marginTop: 4 }}
            >
              {getCurrentDateTime()}
            </Text>
          </View>
        </View>

        {/* Check-in Card */}
        <View style={{ ...cardStyle, alignItems: "center", marginBottom: 16 }}>
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: colors.primarySurface,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
            }}
          >
            <Text style={{ fontSize: 36, lineHeight: 50 }}>😊</Text>
          </View>
          <Heading
            size="lg"
            style={{
              color: colors.textPrimary,
              textAlign: "center",
              marginBottom: 8,
            }}
          >
            Hôm nay bạn cảm thấy thế nào?
          </Heading>
          <Text
            size="sm"
            style={{
              color: colors.textDisabled,
              textAlign: "center",
              marginBottom: 20,
            }}
          >
            Dành 1 phút để thấu hiểm cảm xúc của mình
          </Text>
          <Button
            size="lg"
            className="w-full"
            onPress={() => router.push("/survey")}
          >
            <ButtonText>Bắt đầu kiểm tra</ButtonText>
          </Button>
        </View>

        {/* Previous Result Card */}
        {latestHistory ? (
          <View
            style={{
              backgroundColor: colors.bgSurface1,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: colors.primaryMain,
              borderLeftWidth: 3,
              borderLeftColor: colors.primaryMain,
              paddingVertical: 16,
              paddingHorizontal: 16,
              marginBottom: 16,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 8,
                backgroundColor: colors.primaryMain,
                alignItems: "center",
                justifyContent: "center",
                marginRight: 12,
              }}
            >
              <Text style={{ fontSize: 20, paddingTop: 8 }}>
                {latestHistory.stateDetails?.emoji ?? "💪"}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text size="xs" style={{ color: colors.textDisabled }}>
                Lần trước,
              </Text>
              <Text
                size="lg"
                bold
                style={{ color: colors.primaryMain, marginTop: 2 }}
              >
                {latestHistory.stateDetails?.name ??
                  BACKEND_STATE_LABEL_MAP[latestHistory.state] ??
                  "Đã hoàn thành khảo sát"}
              </Text>
              <Text
                size="xs"
                style={{ color: colors.textDisabled, marginTop: 2 }}
              >
                {formatHistoryTimestamp(latestHistory.createdAt)}
              </Text>
            </View>
          </View>
        ) : null}

        {/* Kiểm tra lịch sử */}
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.menuCard}
          onPress={() => router.push("/(tabs)/history")}
        >
          <View style={styles.menuIconBox}>
            <IconSymbol
              name="clock.arrow.circlepath"
              size={20}
              color={colors.textMuted}
            />
          </View>
          <Text size="md" bold style={styles.menuLabel}>
            Kiểm tra lịch sử
          </Text>
          <IconSymbol name="chevron.right" size={20} color={colors.textGhost} />
        </TouchableOpacity>

        {/* Xem nhắc nhở */}
        <TouchableOpacity
          activeOpacity={0.7}
          style={[styles.menuCard, { marginBottom: 0 }]}
          onPress={() => {
            console.log("[Dashboard] navigate to reminder");
            router.push("/reminder");
          }}
        >
          <View style={styles.menuIconBox}>
            <IconSymbol name="alarm" size={20} color={colors.textMuted} />
          </View>
          <Text size="md" bold style={styles.menuLabel}>
            Xem nhắc nhở
          </Text>
          <IconSymbol name="chevron.right" size={20} color={colors.textGhost} />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: AppColorsType) =>
  StyleSheet.create({
    menuCard: {
      backgroundColor: colors.bgSurface1,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.borderDefault,
      paddingVertical: 12,
      paddingHorizontal: 16,
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
    },
    menuIconBox: {
      width: 40,
      height: 40,
      borderRadius: 8,
      backgroundColor: colors.bgSurface2,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },
    menuLabel: {
      flex: 1,
      color: colors.textPrimary,
    },
  });
