import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { useAppTheme } from '@/hooks/useAppTheme';

interface FilterModalProps {
  visible: boolean;
  initialFilters: {
    priceRange: number[];
    brands: string[];
    colors: string[];
    sizes: number[];
    genders: string[];
    brandsOptions?: string[];
    colorsOptions?: string[];
    gendersOptions?: string[];
    sizesOptions?: number[];
  };
  onApply: (filters: any) => void;
  onClose: () => void;
  isDark?: boolean;
  colors?: any;
}

const { width } = Dimensions.get('window');

const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  initialFilters,
  onApply,
  onClose,
  isDark: propIsDark,
  colors: propColors
}) => {
  // Получаем данные темы из контекста, если они не переданы через пропсы
  const { theme, colors: themeColors } = useAppTheme();
  const isDark = propIsDark !== undefined ? propIsDark : theme === 'dark';
  const colors = propColors || themeColors;

  // Копируем начальные фильтры, чтобы не изменять оригинал
  const [filters, setFilters] = useState({ ...initialFilters });
  const [priceRange, setPriceRange] = useState(initialFilters.priceRange);
  
  // Используем эти значения для слайдеров, чтобы избежать проблемы с позицией
  const [minPrice, setMinPrice] = useState(initialFilters.priceRange[0]);
  const [maxPrice, setMaxPrice] = useState(initialFilters.priceRange[1]);
  
  // Флаг для отслеживания первой загрузки
  const mountedRef = useRef(false);
  
  // Синхронизация фильтров при изменении props или открытии модального окна
  useEffect(() => {
    if (visible) {
      setFilters({ ...initialFilters });
      setPriceRange([...initialFilters.priceRange]);
      
      // Важно: обновляем отдельные значения для слайдеров
      setMinPrice(initialFilters.priceRange[0]);
      setMaxPrice(initialFilters.priceRange[1]);
      
      // Отмечаем, что компонент смонтирован
      mountedRef.current = true;
    }
  }, [initialFilters, visible]);
  
  // Обработчики фильтров
  const toggleBrand = (brand: string) => {
    if (filters.brands.includes(brand)) {
      setFilters({
        ...filters,
        brands: filters.brands.filter(b => b !== brand)
      });
    } else {
      setFilters({
        ...filters,
        brands: [...filters.brands, brand]
      });
    }
  };
  
  const toggleColor = (color: string) => {
    if (filters.colors.includes(color)) {
      setFilters({
        ...filters,
        colors: filters.colors.filter(c => c !== color)
      });
    } else {
      setFilters({
        ...filters,
        colors: [...filters.colors, color]
      });
    }
  };
  
  const toggleSize = (size: number) => {
    if (filters.sizes.includes(size)) {
      setFilters({
        ...filters,
        sizes: filters.sizes.filter(s => s !== size)
      });
    } else {
      setFilters({
        ...filters,
        sizes: [...filters.sizes, size]
      });
    }
  };
  
  const toggleGender = (gender: string) => {
    if (filters.genders.includes(gender)) {
      setFilters({
        ...filters,
        genders: filters.genders.filter(g => g !== gender)
      });
    } else {
      setFilters({
        ...filters,
        genders: [...filters.genders, gender]
      });
    }
  };
  
  // Обработчик изменения минимальной цены
  const handleMinPriceChange = (value: number) => {
    const newMinPrice = value > maxPrice ? maxPrice : value;
    setMinPrice(newMinPrice);
    setPriceRange([newMinPrice, maxPrice]);
  };
  
  // Обработчик изменения максимальной цены
  const handleMaxPriceChange = (value: number) => {
    const newMaxPrice = value < minPrice ? minPrice : value;
    setMaxPrice(newMaxPrice);
    setPriceRange([minPrice, newMaxPrice]);
  };
  
  // Обработчик применения фильтров
  const handleApply = () => {
    onApply({
      ...filters,
      priceRange: [minPrice, maxPrice] // Используем актуальные значения
    });
  };
  
  // Сброс всех фильтров
  const handleReset = () => {
    const resetFilters = {
      ...initialFilters,
      priceRange: [initialFilters.priceRange[0], initialFilters.priceRange[1]],
      brands: [],
      colors: [],
      sizes: [],
      genders: []
    };
    setFilters(resetFilters);
    setPriceRange([initialFilters.priceRange[0], initialFilters.priceRange[1]]);
    
    // Обновляем значения для слайдеров
    setMinPrice(initialFilters.priceRange[0]);
    setMaxPrice(initialFilters.priceRange[1]);
  };

  // Определяем активность кнопки Reset
  const isResetActive = 
    filters.brands.length > 0 || 
    filters.colors.length > 0 || 
    filters.sizes.length > 0 || 
    filters.genders.length > 0 ||
    minPrice !== initialFilters.priceRange[0] ||
    maxPrice !== initialFilters.priceRange[1];
  
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { backgroundColor: colors.card }]}>
          {/* Заголовок модального окна */}
          <View style={[
            styles.modalHeader, 
            { 
              borderBottomColor: colors.border 
            }
          ]}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close-outline" size={24} color={colors.icon} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Фильтры</Text>
            <TouchableOpacity 
              onPress={handleReset}
              disabled={!isResetActive}
              style={[styles.resetButton, !isResetActive && styles.resetButtonDisabled]}
            >
              <Text 
                style={[
                  styles.resetButtonText, 
                  { color: colors.error },
                  !isResetActive && { color: isDark ? '#666666' : '#999999' }
                ]}
              >
                Сбросить
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Содержимое фильтров */}
          <ScrollView style={styles.modalContent}>
            {/* Диапазон цен */}
            <View style={styles.filterSection}>
              <Text style={[styles.filterTitle, { color: colors.text }]}>Цена</Text>
              <View style={styles.priceRangeContainer}>
                <Text style={[styles.priceValue, { color: colors.text }]}>
                  ${Math.round(minPrice)}
                </Text>
                <View style={styles.sliderContainer}>
                  <Slider
                    style={styles.slider}
                    minimumValue={initialFilters.priceRange[0]}
                    maximumValue={initialFilters.priceRange[1]}
                    value={minPrice}
                    maximumTrackTintColor={isDark ? "#555555" : "#D3D3D3"}
                    minimumTrackTintColor={colors.tint}
                    thumbTintColor={colors.tint}
                    onValueChange={handleMinPriceChange}
                  />
                </View>
                <Text style={[styles.priceValue, { color: colors.text }]}>
                  ${Math.round(initialFilters.priceRange[1])}
                </Text>
              </View>
              <View style={styles.sliderContainer}>
                <Slider
                  style={styles.slider}
                  minimumValue={initialFilters.priceRange[0]}
                  maximumValue={initialFilters.priceRange[1]}
                  value={maxPrice}
                  maximumTrackTintColor={isDark ? "#555555" : "#D3D3D3"}
                  minimumTrackTintColor={colors.tint}
                  thumbTintColor={colors.tint}
                  onValueChange={handleMaxPriceChange}
                />
              </View>
              <View style={styles.priceLabelsContainer}>
                <Text style={[styles.priceRangeLabel, { color: colors.placeholder }]}>
                  Выбрано: ${Math.round(minPrice)} - ${Math.round(maxPrice)}
                </Text>
              </View>
            </View>
            
            {/* Бренды */}
            {filters.brandsOptions && filters.brandsOptions.length > 0 && (
              <View style={styles.filterSection}>
                <Text style={[styles.filterTitle, { color: colors.text }]}>Бренды</Text>
                <View style={styles.optionsContainer}>
                  {filters.brandsOptions.map((brand) => (
                    <TouchableOpacity 
                      key={brand}
                      style={[
                        styles.optionButton,
                        { 
                          borderColor: isDark ? colors.border : '#ddd',
                          backgroundColor: isDark ? colors.cardBackground : '#fff' 
                        },
                        filters.brands.includes(brand) && [
                          styles.optionButtonSelected,
                          { backgroundColor: colors.tint, borderColor: colors.tint }
                        ]
                      ]}
                      onPress={() => toggleBrand(brand)}
                    >
                      <Text 
                        style={[
                          styles.optionButtonText,
                          { color: colors.text },
                          filters.brands.includes(brand) && styles.optionButtonTextSelected
                        ]}
                      >
                        {brand}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
            
            {/* Цвета */}
            {filters.colorsOptions && filters.colorsOptions.length > 0 && (
              <View style={styles.filterSection}>
                <Text style={[styles.filterTitle, { color: colors.text }]}>Цвета</Text>
                <View style={styles.optionsContainer}>
                  {filters.colorsOptions.map((color) => (
                    <TouchableOpacity 
                      key={color}
                      style={[
                        styles.optionButton,
                        { 
                          borderColor: isDark ? colors.border : '#ddd',
                          backgroundColor: isDark ? colors.cardBackground : '#fff' 
                        },
                        filters.colors.includes(color) && [
                          styles.optionButtonSelected,
                          { backgroundColor: colors.tint, borderColor: colors.tint }
                        ]
                      ]}
                      onPress={() => toggleColor(color)}
                    >
                      <Text 
                        style={[
                          styles.optionButtonText,
                          { color: colors.text },
                          filters.colors.includes(color) && styles.optionButtonTextSelected
                        ]}
                      >
                        {color}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
            
            {/* Размеры */}
            {filters.sizesOptions && filters.sizesOptions.length > 0 && (
              <View style={styles.filterSection}>
                <Text style={[styles.filterTitle, { color: colors.text }]}>Размеры</Text>
                <View style={styles.optionsContainer}>
                  {filters.sizesOptions.map((size) => (
                    <TouchableOpacity 
                      key={size}
                      style={[
                        styles.sizeButton,
                        { 
                          borderColor: isDark ? colors.border : '#ddd',
                          backgroundColor: isDark ? colors.cardBackground : '#fff' 
                        },
                        filters.sizes.includes(size) && [
                          styles.sizeButtonSelected,
                          { backgroundColor: colors.tint, borderColor: colors.tint }
                        ]
                      ]}
                      onPress={() => toggleSize(size)}
                    >
                      <Text 
                        style={[
                          styles.sizeButtonText,
                          { color: colors.text },
                          filters.sizes.includes(size) && styles.sizeButtonTextSelected
                        ]}
                      >
                        {size}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
            
            {/* Гендер/пол */}
            {filters.gendersOptions && filters.gendersOptions.length > 0 && (
              <View style={styles.filterSection}>
                <Text style={[styles.filterTitle, { color: colors.text }]}>Пол</Text>
                <View style={styles.optionsContainer}>
                  {filters.gendersOptions.map((gender) => (
                    <TouchableOpacity 
                      key={gender}
                      style={[
                        styles.optionButton,
                        { 
                          borderColor: isDark ? colors.border : '#ddd',
                          backgroundColor: isDark ? colors.cardBackground : '#fff' 
                        },
                        filters.genders.includes(gender) && [
                          styles.optionButtonSelected,
                          { backgroundColor: colors.tint, borderColor: colors.tint }
                        ]
                      ]}
                      onPress={() => toggleGender(gender)}
                    >
                      <Text 
                        style={[
                          styles.optionButtonText,
                          { color: colors.text },
                          filters.genders.includes(gender) && styles.optionButtonTextSelected
                        ]}
                      >
                        {gender}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </ScrollView>
          
          {/* Нижние кнопки */}
          <View style={[
            styles.buttonContainer, 
            { borderTopColor: colors.border }
          ]}>
            <TouchableOpacity 
              style={[
                styles.cancelButton,
                { borderColor: colors.text }
              ]}
              onPress={onClose}
            >
              <Text style={[styles.cancelButtonText, { color: colors.text }]}>Отменить</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.applyButton,
                { backgroundColor: colors.tint }
              ]}
              onPress={handleApply}
            >
              <Text style={styles.applyButtonText}>Применить</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  resetButton: {
    padding: 4,
  },
  resetButtonDisabled: {
    opacity: 0.5,
  },
  resetButtonText: {
    fontSize: 14,
  },
  resetButtonTextDisabled: {
    color: '#999',
  },
  modalContent: {
    paddingHorizontal: 16,
    maxHeight: '70%',
  },
  filterSection: {
    marginVertical: 12,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  priceRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sliderContainer: {
    flex: 1,
    marginHorizontal: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  priceValue: {
    fontSize: 14,
    fontWeight: '500',
    minWidth: 40,
    textAlign: 'center',
  },
  priceLabelsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 4,
  },
  priceRangeLabel: {
    fontSize: 14,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  optionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  optionButtonSelected: {
    borderColor: '#000',
  },
  optionButtonText: {
    fontSize: 14,
  },
  optionButtonTextSelected: {
    color: '#fff',
  },
  sizeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  sizeButtonSelected: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  sizeButtonText: {
    fontSize: 14,
  },
  sizeButtonTextSelected: {
    color: '#fff',
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 8,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  applyButton: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 8,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
  },
});

export default FilterModal;