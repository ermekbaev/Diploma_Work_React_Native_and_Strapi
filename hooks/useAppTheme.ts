import { useTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/Colors';

/**
 * Хук для получения текущей темы приложения и цветов для компонентов
 * Заменяет useColorScheme для всего приложения
 */
export function useAppTheme() {
  // Получаем текущую тему из контекста
  const { currentTheme } = useTheme();
  
  // Возвращаем текущую тему и объект с цветами
  return {
    theme: currentTheme, // 'light' или 'dark'
    colors: Colors[currentTheme], // объект с цветами для текущей темы
  };
}

/**
 * Хук для получения цвета для компонента в зависимости от текущей темы
 * Замена для существующего useThemeColor
 */
export function useAppThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const { theme } = useAppTheme();
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
}