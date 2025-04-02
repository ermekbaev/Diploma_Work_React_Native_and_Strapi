import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { getColorBackground } from '@/utils/productHelpers';
import { useAppTheme } from '@/hooks/useAppTheme';

interface Color {
  id: number;
  Name: string;
  colorCode?: string;
}

interface ColorSelectorProps {
  color: Color[];
  selectedColorId: number | null;
  onColorSelect: (colorId: number) => void;
  label?: string;
  isDark?: boolean;
  colors?: any;
}

const ColorSelector: React.FC<ColorSelectorProps> = ({
  color: colorOptions,
  selectedColorId,
  onColorSelect,
  label = 'Select Color',
  isDark: propIsDark,
  colors: propColors
}) => {
  // Получаем данные темы из контекста, если они не переданы через пропсы
  const { theme, colors: themeColors } = useAppTheme();
  const isDark = propIsDark !== undefined ? propIsDark : theme === 'dark';
  const colors = propColors || themeColors;

  if (!colorOptions || colorOptions.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {label}
        </Text>
      )}
      
      <View style={styles.colorSelectionContainer}>
        {colorOptions.map((color) => (
          <TouchableOpacity
            key={color.id}
            style={[
              styles.colorOption,
              { backgroundColor: getColorBackground(color) },
              { borderColor: isDark ? colors.border : '#E0E0E0' },
              selectedColorId === color.id && [
                styles.selectedColorOption,
                { borderColor: colors.tint }
              ],
              (color.Name === 'White' || color.Name === 'Белый') && 
                { borderWidth: 1, borderColor: isDark ? colors.border : '#E0E0E0' }
            ]}
            onPress={() => onColorSelect(color.id)}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  colorSelectionContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 10,
  },
  colorOption: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
  },
  selectedColorOption: {
    borderWidth: 2,
  },
});

export default ColorSelector;