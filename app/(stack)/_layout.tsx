import { Stack } from "expo-router";

export default function StackLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // ✅ Убираем верхний заголовок
      }}
    >
      <Stack.Screen
        name="promo/[slug]"
        options={{
          presentation: "modal", // ✅ Делаем `Stack` открываться как модальное окно
          gestureEnabled: true,  // ✅ Включаем свайп вниз для закрытия
          animation: "slide_from_bottom", // ✅ Анимация появления снизу
        }}
      />
    </Stack>
  );
}
