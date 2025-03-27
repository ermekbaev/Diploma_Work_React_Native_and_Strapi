import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';

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
}

const SizeSelector: React.FC<SizeSelectorProps> = ({
  sizes,
  selectedSize,
  onSizeSelect,
  label = 'Select Size'
}) => {
  if (!sizes || sizes.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {label && <Text style={styles.sectionTitle}>{label}</Text>}
      
      <View style={styles.sizeContainer}>
        {sizes.map((sizeObj) => {
          const isAvailable = sizeObj.isAvailable !== false; // По умолчанию доступен, если не указано обратное
          
          return (
            <TouchableOpacity
              key={sizeObj.id}
              style={[
                styles.sizeOption,
                selectedSize === sizeObj.Size && styles.selectedSizeOption,
                !isAvailable && styles.disabledSizeOption
              ]}
              onPress={() => isAvailable && onSizeSelect(sizeObj.Size)}
              disabled={!isAvailable}
            >
              <Text 
                style={[
                  styles.sizeText,
                  selectedSize === sizeObj.Size && styles.selectedSizeText,
                  !isAvailable && styles.disabledSizeText
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
    color: '#000000',
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
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    minWidth: 50,
    alignItems: 'center',
  },
  selectedSizeOption: {
    borderColor: '#000000',
    backgroundColor: '#000000',
  },
  disabledSizeOption: {
    backgroundColor: '#F5F5F5',
    borderColor: '#E0E0E0',
  },
  sizeText: {
    fontSize: 12,
    color: '#000000',
  },
  selectedSizeText: {
    color: '#FFFFFF',
  },
  disabledSizeText: {
    color: '#999999',
  },
});

export default SizeSelector;