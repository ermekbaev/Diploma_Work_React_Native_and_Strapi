import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useAppTheme } from '@/hooks/useAppTheme';

interface Size {
  id: number;
  Size: number;
  isAvailable?: boolean;
}

interface SizeSelectorProps {
  sizes: Size[];
  selectedSize: number | null;
  onSizeSelect: (size: number) => void;
  label?: string;
  isDark?: boolean;
  colors?: any;
}

const SizeSelector: React.FC<SizeSelectorProps> = ({
  sizes,
  selectedSize,
  onSizeSelect,
  label = 'Select Size',
  isDark: propIsDark,
  colors: propColors
}) => {
  // Получаем данные темы из контекста, если они не переданы через пропсы
  const { theme, colors: themeColors } = useAppTheme();
  const isDark = propIsDark !== undefined ? propIsDark : theme === 'dark';
  const colors = propColors || themeColors;

  if (!sizes || sizes.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {label && <Text style={[styles.sectionTitle, { color: colors.text }]}>{label}</Text>}
      
      <View style={styles.sizeContainer}>
        {sizes.map((sizeObj) => {
          const isAvailable = sizeObj.isAvailable !== false; // По умолчанию доступен, если не указано обратное
          
          return (
            <TouchableOpacity
              key={sizeObj.id}
              style={[
                styles.sizeOption,
                { 
                  borderColor: isDark ? colors.border : '#E0E0E0',
                  backgroundColor: isDark ? colors.cardBackground : '#FFFFFF'
                },
                selectedSize === sizeObj.Size && [
                  styles.selectedSizeOption,
                  { 
                    borderColor: colors.tint,
                    backgroundColor: colors.tint 
                  }
                ],
                !isAvailable && [
                  styles.disabledSizeOption,
                  { 
                    backgroundColor: isDark ? '#333333' : '#F5F5F5',
                    borderColor: isDark ? '#444444' : '#E0E0E0' 
                  }
                ]
              ]}
              onPress={() => isAvailable && onSizeSelect(sizeObj.Size)}
              disabled={!isAvailable}
            >
              <Text 
                style={[
                  styles.sizeText,
                  { color: colors.text },
                  selectedSize === sizeObj.Size && styles.selectedSizeText,
                  !isAvailable && [
                    styles.disabledSizeText,
                    { color: isDark ? '#666666' : '#999999' }
                  ]
                ]}
              >
                {sizeObj.Size}
              </Text>
            </TouchableOpacity>
          );
        })}
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
  sizeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sizeOption: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    minWidth: 50,
    alignItems: 'center',
  },
  selectedSizeOption: {
    borderWidth: 1,
  },
  disabledSizeOption: {
  },
  sizeText: {
    fontSize: 12,
  },
  selectedSizeText: {
    color: '#FFFFFF',
  },
  disabledSizeText: {
  },
});

export default SizeSelector;