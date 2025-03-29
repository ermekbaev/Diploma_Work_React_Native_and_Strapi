import React, { useEffect, useState } from "react";
import { View, StyleSheet, ViewStyle } from "react-native";

interface ExpoSafeBackgroundProps {
  children: React.ReactNode;
  style?: ViewStyle;
  color?: string;
  opacity?: number;
  imageSrc?: string; // Оставляем для совместимости API
}

/**
 * Безопасная альтернатива DominantColorBackground, которая работает в Expo Go
 * без использования нативных модулей
 */
const ExpoSafeBackground: React.FC<ExpoSafeBackgroundProps> = ({ 
  children, 
  style, 
  color,
  opacity = 1,
  imageSrc // Не используется, оставлен для совместимости API
}) => {
  // Предустановленные цвета для популярных брендов
  const brandColors: Record<string, string> = {
    'nike': '#F5F5F5',
    'adidas': '#EFEFEF',
    'puma': '#E1BEE7',
    'reebok': '#B3E5FC',
    'new balance': '#FFECB3',
    'converse': '#D7CCC8',
    'vans': '#CFD8DC',
    'asics': '#C8E6C9',
    'under armour': '#BBDEFB',
    'jordan': '#FFCCBC',
    'default': '#F8F8F8'
  };

  // Определяем цвет фона
  const [backgroundColor, setBackgroundColor] = useState<string>(brandColors.default);

  useEffect(() => {
    // Если цвет передан напрямую, используем его
    if (color) {
      setBackgroundColor(hexToRgba(color, opacity));
      return;
    }

    // Иначе пытаемся найти подходящий цвет бренда из imageSrc URL
    if (imageSrc) {
      // Пытаемся определить бренд по URL
      const brandName = detectBrandFromUrl(imageSrc);
      if (brandName && brandColors[brandName]) {
        setBackgroundColor(hexToRgba(brandColors[brandName], opacity));
        return;
      }
    }

    // Если не смогли определить бренд, используем случайный мягкий цвет
    setBackgroundColor(getRandomSoftColor(opacity));
  }, [color, imageSrc, opacity]);

  // Определяет бренд по URL изображения
  const detectBrandFromUrl = (url: string): string | null => {
    url = url.toLowerCase();
    
    for (const brand of Object.keys(brandColors)) {
      if (url.includes(brand)) {
        return brand;
      }
    }
    return null;
  };

  // Генерирует случайный мягкий цвет
  const getRandomSoftColor = (alpha: number): string => {
    // Мягкие цвета имеют высокую яркость и низкую насыщенность
    const r = Math.floor(Math.random() * 40) + 215; // от 215 до 255
    const g = Math.floor(Math.random() * 40) + 215; // от 215 до 255
    const b = Math.floor(Math.random() * 40) + 215; // от 215 до 255
    
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  // Преобразует HEX цвет в RGBA
  const hexToRgba = (hex: string, alpha = 1): string => {
    // Удаляем # из начала, если есть
    hex = hex.replace('#', '');
    
    // Преобразуем 3-значный hex в 6-значный
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    
    // Проверяем корректность hex
    if (hex.length !== 6) {
      return `rgba(240, 240, 240, ${alpha})`;
    }
    
    // Парсим RGB значения
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  return (
    <View style={[styles.container, { backgroundColor }, style]}>
      {children}
    </View>
  );
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

export default ExpoSafeBackground;