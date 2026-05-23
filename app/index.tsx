import { ActivityIndicator, View } from "react-native";
import { useAppColors } from "@/hooks/use-app-theme";

export default function Index() {
  const colors = useAppColors();

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.bgApp }}>
      <ActivityIndicator size="large" color={colors.primaryMain} />
    </View>
  );
}
