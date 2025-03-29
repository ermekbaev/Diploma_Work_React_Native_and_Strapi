import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

// Интерфейс для пропсов компонента
interface BackgroundProps {
  children: React.ReactNode;
  style?: ViewStyle;
  color?: string;
  opacity?: number;
  imageSrc?: string; // Оставлен для совместимости API
}

/**
 * Простой фоновый компонент, заменяющий DominantColorBackground
 * Используется временно, пока не будет найдено лучшее решение для
 * автоматического определения цветов.
 */
const Background: React.FC<BackgroundProps> = ({ 
  children, 
  style, 
  color = '#f0f0f0',
  opacity = 1,
  imageSrc // Не используется, оставлен для совместимости API
}) => {
  // Определяем цвет фона с учетом прозрачности
  const backgroundColor = color ? getColorWithOpacity(color, opacity) : '#f0f0f0';

  return (
    <View style={[styles.container, { backgroundColor }, style]}>
      {children}
    </View>
  );
};

/**
 * Функция для добавления прозрачности к цвету
 */
const getColorWithOpacity = (hex: string, opacity = 1): string => {
  // Если opacity = 1, просто возвращаем исходный цвет
  if (opacity >= 1) return hex;

  // Проверяем наличие hex значения
  if (!hex || !hex.startsWith('#')) return `rgba(240, 240, 240, ${opacity})`;
  
  // Удаляем # из начала
  hex = hex.replace('#', '');
  
  // Преобразуем 3-значный hex в 6-значный
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  
  // Проверяем корректность hex
  if (hex.length !== 6) {
    return `rgba(240, 240, 240, ${opacity})`;
  }
  
  // Парсим RGB значения
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default Background;