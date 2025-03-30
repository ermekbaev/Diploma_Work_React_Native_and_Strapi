import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ActiveFilterProps {
  filters: {
    priceRange: number[];
    brands: string[];
    colors: string[];
    sizes: number[];
    genders: string[];
  };
  sortOption: string;
  onRemoveFilter: (filterType: string, value?: any) => void;
  onResetFilters: () => void;
  onOpenFilterModal: () => void;
}

// Описание различных типов сортировки
const SORT_DESCRIPTIONS: {[key: string]: string} = {
  'popular': 'По популярности',
  'price_asc': 'Цена: по возрастанию',
  'price_desc': 'Цена: по убыванию',
  'name_asc': 'Название: А-Я',
  'name_desc': 'Название: Я-А',
};

const ActiveFilters: React.FC<ActiveFilterProps> = ({
  filters,
  sortOption,
  onRemoveFilter,
  onResetFilters,
  onOpenFilterModal
}) => {
  // Проверяем, есть ли активные фильтры
  const hasActiveFilters = 
    filters.brands.length > 0 || 
    filters.colors.length > 0 || 
    filters.sizes.length > 0 || 
    filters.genders.length > 0 ||
    sortOption !== 'popular' ||
    filters.priceRange[0] !== 0 ||
    filters.priceRange[1] !== 5000;
  
  // Если нет активных фильтров, показываем только кнопку открытия фильтров
  if (!hasActiveFilters) {
    return (
      <View style={styles.container}>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={onOpenFilterModal}
        >
          <Ionicons name="funnel-outline" size={16} color="#000" />
          <Text style={styles.filterButtonText}>Фильтры</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Основная кнопка открытия фильтров */}
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={onOpenFilterModal}
        >
          <Ionicons name="funnel-outline" size={16} color="#000" />
          <Text style={styles.filterButtonText}>Фильтры</Text>
        </TouchableOpacity>
        
        {/* Фильтр по цене */}
        {(filters.priceRange[0] !== 0 || filters.priceRange[1] !== 5000) && (
          <TouchableOpacity 
            style={styles.activeFilter}
            onPress={() => onRemoveFilter('priceRange')}
          >
            <Text style={styles.activeFilterText}>
              Цена: ${Math.round(filters.priceRange[0])} - ${Math.round(filters.priceRange[1])}
            </Text>
            <Ionicons name="close-circle" size={16} color="#000" />
          </TouchableOpacity>
        )}
        
        {/* Фильтр по брендам */}
        {filters.brands.length > 0 && (
          <TouchableOpacity 
            style={styles.activeFilter}
            onPress={() => onRemoveFilter('brands')}
          >
            <Text style={styles.activeFilterText}>
              Бренды: {filters.brands.length}
            </Text>
            <Ionicons name="close-circle" size={16} color="#000" />
          </TouchableOpacity>
        )}
        
        {/* Фильтр по цветам */}
        {filters.colors.length > 0 && (
          <TouchableOpacity 
            style={styles.activeFilter}
            onPress={() => onRemoveFilter('colors')}
          >
            <Text style={styles.activeFilterText}>
              Цвета: {filters.colors.length}
            </Text>
            <Ionicons name="close-circle" size={16} color="#000" />
          </TouchableOpacity>
        )}
        
        {/* Фильтр по размерам */}
        {filters.sizes.length > 0 && (
          <TouchableOpacity 
            style={styles.activeFilter}
            onPress={() => onRemoveFilter('sizes')}
          >
            <Text style={styles.activeFilterText}>
              Размеры: {filters.sizes.length}
            </Text>
            <Ionicons name="close-circle" size={16} color="#000" />
          </TouchableOpacity>
        )}
        
        {/* Фильтр по гендеру */}
        {filters.genders.length > 0 && (
          <TouchableOpacity 
            style={styles.activeFilter}
            onPress={() => onRemoveFilter('genders')}
          >
            <Text style={styles.activeFilterText}>
              Пол: {filters.genders.length}
            </Text>
            <Ionicons name="close-circle" size={16} color="#000" />
          </TouchableOpacity>
        )}
        
        {/* Сортировка */}
        {sortOption !== 'popular' && (
          <TouchableOpacity 
            style={styles.activeFilter}
            onPress={() => onRemoveFilter('sortOption')}
          >
            <Text style={styles.activeFilterText}>
              {SORT_DESCRIPTIONS[sortOption] || 'Сортировка'}
            </Text>
            <Ionicons name="close-circle" size={16} color="#000" />
          </TouchableOpacity>
        )}
        
        {/* Кнопка сброса всех фильтров */}
        {hasActiveFilters && (
          <TouchableOpacity 
            style={styles.resetButton}
            onPress={onResetFilters}
          >
            <Text style={styles.resetButtonText}>Сбросить все</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  scrollContent: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 8,
  },
  filterButtonText: {
    fontSize: 12,
    marginLeft: 4,
  },
  activeFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  activeFilterText: {
    fontSize: 12,
    marginRight: 4,
  },
  resetButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#000',
    marginRight: 8,
  },
  resetButtonText: {
    fontSize: 12,
    color: '#fff',
  },
});

export default ActiveFilters;