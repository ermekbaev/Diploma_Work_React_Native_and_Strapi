import React, { useState, useEffect } from "react";
import { View, StyleSheet, ViewStyle } from "react-native";

interface SimpleDominantBackgroundProps {
  children: React.ReactNode;
  style?: ViewStyle;
  imageSrc?: string;
  color?: string; // Здесь мы будем принимать hex-код цвета из API
  defaultColor?: string;
  opacity?: number;
}

const SimpleDominantBackground: React.FC<SimpleDominantBackgroundProps> = ({ 
  children, 
  style, 
  color,
  defaultColor = "#f0f0f0",
  opacity = 0.4
}) => {
  // Если цвет не передан, используем значение по умолчанию
  const backgroundColor = color ? hexToRgba(color, opacity) : defaultColor;

  return (
    <View style={[styles.container, { backgroundColor }, style]}>
      {children}
    </View>
  );
};

const hexToRgba = (hex: string, alpha = 1) => {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    return `rgba(240, 240, 240, ${alpha})`; // Серый цвет по умолчанию
  }
  
  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);
  
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
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

export default SimpleDominantBackground;