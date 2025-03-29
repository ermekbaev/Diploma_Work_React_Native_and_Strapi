import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  ScrollView,
  Switch,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { getAvailableFilters, SearchFilters } from '@/services/searchServices';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: SearchFilters) => void;
  currentFilters: SearchFilters;
}

interface FilterData {
  brands: Array<{ slug: string; name: string }>;
  categories: Array<{ slug: string; name: string }>;
  genders: string[];
  colors: string[];
  priceRange: { min: number; max: number };
}

const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  onApply,
  currentFilters
}) => {
  // Состояния для фильтров
  const [filters, setFilters] = useState<SearchFilters>({
    brands: [],
    categories: [],
    minPrice: undefined,
    maxPrice: undefined,
    genders: [],
    colors: []
  });
  
  // Состояние для доступных значений фильтров
  const [filterData, setFilterData] = useState<FilterData>({
    brands: [],
    categories: [],
    genders: [],
    colors: [],
    priceRange: { min: 0, max: 100000 }
  });
  
  // Состояние для слайдера цен
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  
  // Состояние загрузки
  const [loading, setLoading] = useState(true);
  
  // Загрузка данных фильтров при открытии модального окна
  useEffect(() => {
    if (visible) {
      loadFilterData();
    }
  }, [visible]);
  
  // Инициализация фильтров
  useEffect(() => {
    setFilters(currentFilters);
    
    // Устанавливаем диапазон цен из текущих фильтров или из данных по умолчанию
    if (currentFilters.minPrice !== undefined || currentFilters.maxPrice !== undefined) {
      setPriceRange([
        currentFilters.minPrice !== undefined ? currentFilters.minPrice : filterData.priceRange.min,
        currentFilters.maxPrice !== undefined ? currentFilters.maxPrice : filterData.priceRange.max
      ]);
    } else if (filterData.priceRange.min !== Infinity && filterData.priceRange.max !== 0) {
      setPriceRange([filterData.priceRange.min, filterData.priceRange.max]);
    }
  }, [currentFilters, filterData]);
  
  // Загрузка данных фильтров
  const loadFilterData = async () => {
    try {
      setLoading(true);
      const data = await getAvailableFilters();
      setFilterData(data);
      
      // Если у нас нет ранее установленных цен, устанавливаем из полученных данных
      if (filters.minPrice === undefined && filters.maxPrice === undefined) {
        setPriceRange([data.priceRange.min, data.priceRange.max]);
      }
    } catch (error) {
      console.error('Ошибка при загрузке данных фильтров:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Обработчики изменения фильтров
  const handleToggleBrand = (slug: string) => {
    setFilters(prev => {
      const brands = prev.brands || [];
      if (brands.includes(slug)) {
        return { ...prev, brands: brands.filter(b => b !== slug) };
      } else {
        return { ...prev, brands: [...brands, slug] };
      }
    });
  };
  
  const handleToggleCategory = (slug: string) => {
    setFilters(prev => {
      const categories = prev.categories || [];
      if (categories.includes(slug)) {
        return { ...prev, categories: categories.filter(c => c !== slug) };
      } else {
        return { ...prev, categories: [...categories, slug] };
      }
    });
  };
  
  const handleToggleGender = (gender: string) => {
    setFilters(prev => {
      const genders = prev.genders || [];
      if (genders.includes(gender)) {
        return { ...prev, genders: genders.filter(g => g !== gender) };
      } else {
        return { ...prev, genders: [...genders, gender] };
      }
    });
  };
  
  const handleToggleColor = (color: string) => {
    setFilters(prev => {
      const colors = prev.colors || [];
      if (colors.includes(color)) {
        return { ...prev, colors: colors.filter(c => c !== color) };
      } else {
        return { ...prev, colors: [...colors, color] };
      }
    });
  };
  
  const handlePriceRangeChange = (type: 'min' | 'max', value: number) => {
    if (type === 'min') {
      setPriceRange([value, priceRange[1]]);
      setFilters(prev => ({
        ...prev,
        minPrice: value
      }));
    } else {
      setPriceRange([priceRange[0], value]);
      setFilters(prev => ({
        ...prev,
        maxPrice: value
      }));
    }
  };
  
  // Сброс фильтров
  const handleReset = () => {
    setFilters({
      brands: [],
      categories: [],
      minPrice: undefined,
      maxPrice: undefined,
      genders: [],
      colors: []
    });
    
    // Сброс диапазона цен
    if (filterData.priceRange.min !== Infinity && filterData.priceRange.max !== 0) {
      setPriceRange([filterData.priceRange.min, filterData.priceRange.max]);
    } else {
      setPriceRange([0, 100000]);
    }
  };
  
  // Применение фильтров
  const handleApply = () => {
    onApply(filters);
    onClose();
  };
  
  // Форматирование цены
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };
  
  // Получение количества активных фильтров
  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.brands && filters.brands.length > 0) count += filters.brands.length;
    if (filters.categories && filters.categories.length > 0) count += filters.categories.length;
    if (filters.genders && filters.genders.length > 0) count += filters.genders.length;
    if (filters.colors && filters.colors.length > 0) count += filters.colors.length;
    
    // Считаем диапазон цен как один фильтр, если он отличается от значений по умолчанию
    if (filters.minPrice !== undefined && filters.minPrice > filterData.priceRange.min) count++;
    if (filters.maxPrice !== undefined && filters.maxPrice < filterData.priceRange.max) count++;
    
    return count;
  };
  
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {/* Заголовок модального окна */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Фильтры</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#000000" />
            </TouchableOpacity>
          </View>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#000000" />
              <Text style={styles.loadingText}>Загрузка фильтров...</Text>
            </View>
          ) : (
            <ScrollView style={styles.filtersContainer}>
              {/* Фильтр по брендам */}
              {filterData.brands.length > 0 && (
                <View style={styles.filterSection}>
                  <Text style={styles.filterTitle}>Бренды</Text>
                  <View style={styles.filterOptionsContainer}>
                    {filterData.brands.map(brand => (
                      <TouchableOpacity
                        key={brand.slug}
                        style={[
                          styles.filterOption,
                          filters.brands?.includes(brand.slug) && styles.filterOptionSelected
                        ]}
                        onPress={() => handleToggleBrand(brand.slug)}
                      >
                        <Text
                          style={[
                            styles.filterOptionText,
                            filters.brands?.includes(brand.slug) && styles.filterOptionTextSelected
                          ]}
                        >
                          {brand.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
              
              {/* Фильтр по категориям */}
              {filterData.categories.length > 0 && (
                <View style={styles.filterSection}>
                  <Text style={styles.filterTitle}>Категории</Text>
                  <View style={styles.filterOptionsContainer}>
                    {filterData.categories.map(category => (
                      <TouchableOpacity
                        key={category.slug}
                        style={[
                          styles.filterOption,
                          filters.categories?.includes(category.slug) && styles.filterOptionSelected
                        ]}
                        onPress={() => handleToggleCategory(category.slug)}
                      >
                        <Text
                          style={[
                            styles.filterOptionText,
                            filters.categories?.includes(category.slug) && styles.filterOptionTextSelected
                          ]}
                        >
                          {category.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
              
              {/* Фильтр по полу */}
              {filterData.genders.length > 0 && (
                <View style={styles.filterSection}>
                  <Text style={styles.filterTitle}>Пол</Text>
                  <View style={styles.filterOptionsContainer}>
                    {filterData.genders.map(gender => (
                      <TouchableOpacity
                        key={gender}
                        style={[
                          styles.filterOption,
                          filters.genders?.includes(gender) && styles.filterOptionSelected
                        ]}
                        onPress={() => handleToggleGender(gender)}
                      >
                        <Text
                          style={[
                            styles.filterOptionText,
                            filters.genders?.includes(gender) && styles.filterOptionTextSelected
                          ]}
                        >
                          {gender}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
              
              {/* Фильтр по цене */}
              <View style={styles.filterSection}>
                <Text style={styles.filterTitle}>Диапазон цен</Text>
                <View style={styles.priceRangeContainer}>
                  <Text style={styles.priceValue}>
                    {formatPrice(priceRange[0])}
                  </Text>
                  <Text style={styles.priceValue}>
                    {formatPrice(priceRange[1])}
                  </Text>
                </View>
                
                <View style={styles.sliderContainer}>
                  <Slider
                    style={styles.priceSlider}
                    minimumValue={filterData.priceRange.min}
                    maximumValue={filterData.priceRange.max}
                    value={priceRange[0]}
                    minimumTrackTintColor="#CCCCCC"
                    maximumTrackTintColor="#000000"
                    thumbTintColor="#000000"
                    onValueChange={(value) => handlePriceRangeChange('min', value)}
                  />
                  
                  <Slider
                    style={styles.priceSlider}
                    minimumValue={filterData.priceRange.min}
                    maximumValue={filterData.priceRange.max}
                    value={priceRange[1]}
                    minimumTrackTintColor="#000000"
                    maximumTrackTintColor="#CCCCCC"
                    thumbTintColor="#000000"
                    onValueChange={(value) => handlePriceRangeChange('max', value)}
                  />
                </View>
              </View>
              
              {/* Фильтр по цветам */}
              {filterData.colors.length > 0 && (
                <View style={styles.filterSection}>
                  <Text style={styles.filterTitle}>Цвета</Text>
                  <View style={styles.filterOptionsContainer}>
                    {filterData.colors.map(color => (
                      <TouchableOpacity
                        key={color}
                        style={[
                          styles.filterOption,
                          filters.colors?.includes(color) && styles.filterOptionSelected
                        ]}
                        onPress={() => handleToggleColor(color)}
                      >
                        <Text
                          style={[
                            styles.filterOptionText,
                            filters.colors?.includes(color) && styles.filterOptionTextSelected
                          ]}
                        >
                          {color}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </ScrollView>
          )}
          
          {/* Нижняя панель с кнопками */}
          <View style={styles.modalFooter}>
            <View style={styles.activeFiltersContainer}>
              <Text style={styles.activeFiltersText}>
                Активные фильтры: {getActiveFiltersCount()}
              </Text>
            </View>
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={styles.resetButton}
                onPress={handleReset}
              >
                <Text style={styles.resetButtonText}>Сбросить</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.applyButton}
                onPress={handleApply}
              >
                <Text style={styles.applyButtonText}>Применить</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 30,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  loadingContainer: {
    padding: 30,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666666',
  },
  filtersContainer: {
    marginBottom: 16,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  filterOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  filterOption: {
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    margin: 4,
    borderWidth: 1,
    borderColor: '#F5F5F5',
  },
  filterOptionSelected: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  filterOptionText: {
    fontSize: 14,
    color: '#333333',
  },
  filterOptionTextSelected: {
    color: '#FFFFFF',
  },
  priceRangeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  priceValue: {
    fontSize: 14,
    color: '#333333',
  },
  sliderContainer: {
    marginTop: 8,
  },
  priceSlider: {
    width: '100%',
    height: 40,
  },
  modalFooter: {
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingTop: 16,
  },
  activeFiltersContainer: {
    marginBottom: 12,
  },
  activeFiltersText: {
    fontSize: 14,
    color: '#666666',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  resetButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 8,
    paddingVertical: 12,
    marginRight: 8,
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  applyButton: {
    flex: 1,
    backgroundColor: '#000000',
    borderRadius: 8,
    paddingVertical: 12,
    marginLeft: 8,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default FilterModal;