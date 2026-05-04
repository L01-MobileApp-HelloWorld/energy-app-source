import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native";

import { AppColorsType, FontFamily } from "@/constants/theme";
import { useAppColors } from "@/hooks/use-app-theme";

const { width } = Dimensions.get("window");
const scale = (size: number) => (width / 390) * size;

const BTN_SIZE = 36;

type ScreenBackTitleProps = {
  title: string;
  onPress: () => void;
  rightElement?: React.ReactNode;
};

export function ScreenBackTitle({ title, onPress, rightElement }: ScreenBackTitleProps) {
  const colors = useAppColors();
  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <Pressable
        onPress={onPress}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={`Quay lại từ màn ${title}`}
        style={styles.iconButton}
      >
        <Ionicons name="arrow-back" size={scale(28)} color={colors.textPrimary} />
      </Pressable>

      <Text style={styles.title} numberOfLines={1}>{title}</Text>

      <View style={styles.iconButton}>
        {rightElement ?? null}
      </View>
    </View>
  );
}

const createStyles = (colors: AppColorsType) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
    },
    iconButton: {
      width: BTN_SIZE,
      height: BTN_SIZE,
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    title: {
      flex: 1,
      textAlign: "center",
      fontFamily: FontFamily.sansExtraBold,
      fontSize: scale(20),
      lineHeight: scale(30),
      color: colors.textPrimary,
      letterSpacing: -0.5,
    },
  });
