import { Stack } from "expo-router";

export default function StackLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen
        name="promo/[slug]"
        options={{
          presentation: "card", // Используем "card" вместо "modal"
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