import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { getColorBackground } from '@/utils/productHelpers';

interface Color {
  id: number;
  Name: string;
  colorCode?: string;
}

interface ColorSelectorProps {
  colors: Color[];
  selectedColorId: number | null;
  onColorSelect: (colorId: number) => void;
  label?: string;
}

const ColorSelector: React.FC<ColorSelectorProps> = ({
  colors,
  selectedColorId,
  onColorSelect,
  label = 'Select Color'
}) => {
  if (!colors || colors.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {label && <Text style={styles.sectionTitle}>{label}</Text>}
      
      <View style={styles.colorSelectionContainer}>
        {colors.map((color) => (
          <TouchableOpacity
            key={color.id}
            style={[
              styles.colorOption,
              { backgroundColor: getColorBackground(color) },
              selectedColorId === color.id && styles.selectedColorOption,
              color.Name === 'White' || color.Name === 'Белый' ? { borderWidth: 1, borderColor: '#E0E0E0' } : {}
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
    color: '#000000',
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
    borderColor: '#E0E0E0',
  },
  selectedColorOption: {
    borderWidth: 2,
    borderColor: '#000000',
  },
});

export default ColorSelector;