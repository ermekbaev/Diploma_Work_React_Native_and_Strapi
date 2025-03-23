import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "react-native";
import { useEffect } from "react";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/useColorScheme";

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
      <Stack
        screenOptions={{
          headerShown: false, // ✅ Убираем верхний заголовок
        }}
      >
        {/* ✅ Главный контейнер с `Tabs` */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

        {/* ✅ Отдельный `Stack`, но он не скрывает `Tabs` */}
        <Stack.Screen
          name="(stack)"
          options={{
            presentation: "modal", // ✅ Открываем `Stack` поверх `Tabs`
            headerShown: false,
          }}
        />

        {/* ✅ Страница 404 (по желанию) */}
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar
        translucent={false}
        backgroundColor={colorScheme === "dark" ? "#1C1C1E" : "#FFFFFF"}
        barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
      />
    </ThemeProvider>
  );
}
