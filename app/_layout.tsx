import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import {
  DMMono_400Regular,
  DMMono_500Medium,
} from "@expo-google-fonts/dm-mono";
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from "@expo-google-fonts/plus-jakarta-sans";
import { useFonts } from "expo-font";
import { router, Stack, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";

import { Text } from "react-native";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import { ThemePreferencesProvider, useAppTheme } from "@/hooks/use-app-theme";
import { AuthProvider, useAuth } from "@/hooks/auth-context";
import "@/global.css";

SplashScreen.preventAutoHideAsync();

const TextWithDefaults = Text as typeof Text & {
  defaultProps?: {
    style?: unknown;
  };
};

TextWithDefaults.defaultProps = {
  ...TextWithDefaults.defaultProps,
  style: [{ fontFamily: "PlusJakartaSans_400Regular" }, TextWithDefaults.defaultProps?.style],
};

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
    DMMono_400Regular,
    DMMono_500Medium,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <ThemePreferencesProvider>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </ThemePreferencesProvider>
  );
}

function RootNavigator() {
  const { resolvedTheme } = useAppTheme();
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const segment = segments[0];

  useEffect(() => {
    if (isLoading) return;

    const inProtectedRoute = segment === "(tabs)";

    if (isAuthenticated && !inProtectedRoute) {
      router.replace("/(tabs)");
    } else if (!isAuthenticated && inProtectedRoute) {
      router.replace("/onboarding");
    }
  }, [isAuthenticated, isLoading, segment]);

  return (
    <GluestackUIProvider mode={resolvedTheme}>
      <ThemeProvider value={resolvedTheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: "slide_from_right",
            gestureEnabled: true,
            fullScreenGestureEnabled: true,
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="survey" />
          <Stack.Screen name="analystic" />
          <Stack.Screen name="result" />
          <Stack.Screen name="reminder" />
          <Stack.Screen name="profile-update" />
          <Stack.Screen name="change-password" />
          <Stack.Screen name="login" />
          <Stack.Screen name="register" />
          <Stack.Screen
            name="modal"
            options={{
              presentation: "modal",
              title: "Modal",
              headerShown: true,
            }}
          />
        </Stack>
        <StatusBar style={resolvedTheme === "dark" ? "light" : "dark"} />
      </ThemeProvider>
    </GluestackUIProvider>
  );
}
