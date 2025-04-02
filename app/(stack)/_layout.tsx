import { Stack } from "expo-router";
import { useAppTheme } from "@/hooks/useAppTheme";

export default function StackLayout() {
  // Получаем данные темы
  const { theme, colors } = useAppTheme();
  const isDark = theme === 'dark';

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        contentStyle: {
          backgroundColor: colors.background
        },
        headerStyle: {
          backgroundColor: colors.card
        },
        headerTintColor: colors.text
      }}
    >
      <Stack.Screen
        name="promo/[slug]"
        options={{
          presentation: "card",
          gestureEnabled: true,
          animation: "slide_from_right",
        }}
      />
      <Stack.Screen
        name="brands/[slug]"
        options={{
          presentation: "card",
          gestureEnabled: true,
          animation: "slide_from_right",
        }}
      />
    </Stack>
  );
}