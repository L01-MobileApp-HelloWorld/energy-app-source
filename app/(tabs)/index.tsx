import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Text } from "@/components/ui/text";
import { AppColorsType } from "@/constants/theme";
import { useAppColors } from "@/hooks/use-app-theme";
import { router } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function getCurrentDateTime() {
  const now = new Date();
  const days = ["CN", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
  const day = days[now.getDay()];
  const h = now.getHours().toString().padStart(2, "0");
  const m = now.getMinutes().toString().padStart(2, "0");
  return `${day}, ${h}:${m}`;
}

export default function HomeScreen() {
  const colors = useAppColors();
  const styles = createStyles(colors);
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
              Chào Huy! 👋
            </Heading>
            <Text size="sm" style={{ color: colors.textDisabled, marginTop: 4 }}>
              {getCurrentDateTime()}
            </Text>
          </View>
          <View
            style={{
              width: 46,
              height: 46,
              borderRadius: 23,
              backgroundColor: colors.bgSurface3,
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            <Text size="xl">🧑</Text>
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
            style={{ color: colors.textPrimary, textAlign: "center", marginBottom: 8 }}
          >
            Hôm nay bạn cảm thấy thế nào?
          </Heading>
          <Text
            size="sm"
            style={{ color: colors.textDisabled, textAlign: "center", marginBottom: 20 }}
          >
            Dành 1 phút để thấu hiểm cảm xúc của mình
          </Text>
          <Button size="lg" className="w-full" onPress={() => router.push('/survey')}>
            <ButtonText>Bắt đầu kiểm tra</ButtonText>
          </Button>
        </View>

        {/* Previous Result Card */}
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
            <Text style={{ fontSize: 20 }}>💪</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text size="xs" style={{ color: colors.textDisabled }}>
              Lần trước,
            </Text>
            <Text size="lg" bold style={{ color: colors.primaryMain, marginTop: 2 }}>
              Tỉnh táo, sẵn sàng
            </Text>
            <Text size="xs" style={{ color: colors.textDisabled, marginTop: 2 }}>
              Hôm nay, 12:00
            </Text>
          </View>
        </View>

        {/* Kiểm tra lịch sử */}
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.menuCard}
          onPress={() => router.push('/(tabs)/history')}
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
            console.log('[Dashboard] navigate to reminder');
            router.push('/reminder');
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
