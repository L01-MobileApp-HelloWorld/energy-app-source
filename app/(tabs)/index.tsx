import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Text } from "@/components/ui/text";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function getCurrentDateTime() {
  const now = new Date();
  const days = ["CN", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
  const day = days[now.getDay()];
  const h = now.getHours().toString().padStart(2, "0");
  const m = now.getMinutes().toString().padStart(2, "0");
  return `${day}, ${h}:${m}`;
}

const CARD_STYLE = {
  backgroundColor: "#fff",
  borderRadius: 16,
  padding: 20,
  shadowColor: "#000",
  shadowOpacity: 0.06,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 2 },
  elevation: 2,
};

export default function HomeScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
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
            <Heading size="2xl" style={{ color: "#000" }}>
              Chào Huy! 👋
            </Heading>
            <Text size="sm" style={{ color: "#94A3B8", marginTop: 4 }}>
              {getCurrentDateTime()}
            </Text>
          </View>
          <View
            style={{
              width: 46,
              height: 46,
              borderRadius: 23,
              backgroundColor: "#E2E8F0",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            <Text size="xl">🧑</Text>
          </View>
        </View>

        {/* Check-in Card */}
        <View style={{ ...CARD_STYLE, alignItems: "center", marginBottom: 16 }}>
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: "#EEF2FF",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
            }}
          >
            <Text style={{ fontSize: 36, lineHeight: 50 }}>😊</Text>
          </View>
          <Heading
            size="lg"
            style={{ color: "#000", textAlign: "center", marginBottom: 8 }}
          >
            Hôm nay bạn cảm thấy thế nào?
          </Heading>
          <Text
            size="sm"
            style={{ color: "#94A3B8", textAlign: "center", marginBottom: 20 }}
          >
            Dành 1 phút để thấu hiểm cảm xúc của mình
          </Text>
          <Button size="lg" className="w-full rounded-xl">
            <ButtonText>Bắt đầu kiểm tra</ButtonText>
          </Button>
        </View>

        {/* Previous Result Card */}
        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 8,
            borderWidth: 1,
            borderColor: "#508DF7",
            borderLeftWidth: 3,
            borderLeftColor: "#508DF7",
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
              backgroundColor: "#508DF7",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 12,
            }}
          >
            <Text style={{ fontSize: 20 }}>💪</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text size="xs" style={{ color: "#94A3B8" }}>
              Lần trước,
            </Text>
            <Text size="lg" bold style={{ color: "#508DF7", marginTop: 2 }}>
              Tỉnh táo, sẵn sàng
            </Text>
            <Text size="xs" style={{ color: "#94A3B8", marginTop: 2 }}>
              Hôm nay, 12:00
            </Text>
          </View>
        </View>

        {/* Kiểm tra lịch sử */}
        <View style={styles.menuCard}>
          <View style={styles.menuIconBox}>
            <IconSymbol
              name="clock.arrow.circlepath"
              size={20}
              color="#64748B"
            />
          </View>
          <Text size="md" bold style={styles.menuLabel}>
            Kiểm tra lịch sử
          </Text>
          <IconSymbol name="chevron.right" size={20} color="#CBD5E1" />
        </View>

        {/* Xem nhắc nhở */}
        <View style={[styles.menuCard, { marginBottom: 0 }]}>
          <View style={styles.menuIconBox}>
            <IconSymbol name="alarm" size={20} color="#64748B" />
          </View>
          <Text size="md" bold style={styles.menuLabel}>
            Xem nhắc nhở
          </Text>
          <IconSymbol name="chevron.right" size={20} color="#CBD5E1" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  menuCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E6E6E6",
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
    backgroundColor: "#F5F6F8",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  menuLabel: {
    flex: 1,
    color: "#0F172A",
  },
});
