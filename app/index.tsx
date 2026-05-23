import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";

import { useAuth } from "@/hooks/auth-context";
import { useAppColors } from "@/hooks/use-app-theme";

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();
  const colors = useAppColors();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.bgApp }}>
        <ActivityIndicator size="large" color={colors.primaryMain} />
      </View>
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/onboarding" />;
}
