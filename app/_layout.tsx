import 'react-native-gesture-handler';

import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "react-native";
import { useEffect } from "react";
import "react-native-reanimated";

import { AppProvider } from "@/context/AppContext";
import { ThemeProvider, useTheme } from "@/context/ThemeContext";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Компонент для рендеринга содержимого с применением текущей темы
const AppContent = () => {
  const { currentTheme } = useTheme();
  const isDarkTheme = currentTheme === 'dark';

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
    <NavigationThemeProvider value={isDarkTheme ? DarkTheme : DefaultTheme}>
      <AppProvider>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="(stack)"
            options={{
              presentation: "modal",
              headerShown: false,
            }}
          />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar
          translucent={false}
          backgroundColor={isDarkTheme ? "#1C1C1E" : "#FFFFFF"}
          barStyle={isDarkTheme ? "light-content" : "dark-content"}
        />
      </AppProvider>
    </NavigationThemeProvider>
  );
};

// Основной компонент с провайдером темы
export default function RootLayout() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}