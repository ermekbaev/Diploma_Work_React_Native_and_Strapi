import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "react-native";
import { useEffect } from "react";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/useColorScheme";
import { AppProvider } from "@/context/AppContext";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <AppProvider>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        >
          {/* Главный контейнер с Tabs */}
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

          {/* Отдельный Stack для модальных экранов */}
          <Stack.Screen
            name="(stack)"
            options={{
              presentation: "card", // Вместо "modal" используем "card"
              headerShown: false,
              animation: "slide_from_right", // Анимация справа налево
            }}
          />

          {/* Страница 404 (по желанию) */}
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar
          translucent={false}
          backgroundColor={colorScheme === "dark" ? "#1C1C1E" : "#FFFFFF"}
          barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
        />
      </AppProvider>
    </ThemeProvider>
  );
}