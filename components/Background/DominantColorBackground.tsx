import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import ImageColors from "react-native-image-colors";

const DominantColorBackground = ({ imageSrc, children, style }:any) => {
    const [bgColor, setBgColor] = useState("#F8F8F8"); // Запасной цвет
    
    // Добавьте эту функцию в компонент
    const hexToRgba = (hex:any, alpha = 1) => {
      hex = hex.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };
    
    useEffect(() => {
      const getColor = async () => {
        const result = await ImageColors.getColors(imageSrc, {
          fallback: "#F8F8F8",
          cache: true,
          key: imageSrc,
        });
        //@ts-ignore
        // Берем `dominant`, но если он темный — используем `average`
        const color = result.dominant || result.average || "#F8F8F8";
        
        // Используем прозрачность 0.7 (можете изменить на любое значение от 0 до 1)
        const transparentColor = hexToRgba(color, 0.4);
        setBgColor(transparentColor);
      };
      
      getColor();
    }, [imageSrc]);
    
    return (
      <View style={[styles.container, { backgroundColor: bgColor }, style]}>
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

export default DominantColorBackground;
