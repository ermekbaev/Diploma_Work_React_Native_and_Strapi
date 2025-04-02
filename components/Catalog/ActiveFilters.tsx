import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/useAppTheme';

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
  isDark?: boolean;
  colors?: any;
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
  onOpenFilterModal,
  isDark: propIsDark,
  colors: propColors
}) => {
  // Получаем данные темы из контекста, если они не переданы через пропсы
  const { theme, colors: themeColors } = useAppTheme();
  const isDark = propIsDark !== undefined ? propIsDark : theme === 'dark';
  const colors = propColors || themeColors;
  
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
      <View style={[
        styles.container, 
        { 
          borderBottomColor: colors.border,
          backgroundColor: colors.card
        }
      ]}>
        <TouchableOpacity 
          style={[
            styles.filterButton,
            { borderColor: isDark ? colors.border : '#ddd' }
          ]}
          onPress={onOpenFilterModal}
        >
          <Ionicons name="funnel-outline" size={16} color={colors.icon} />
          <Text style={[styles.filterButtonText, { color: colors.text }]}>Фильтры</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  return (
    <View style={[
      styles.container, 
      { 
        borderBottomColor: colors.border,
        backgroundColor: colors.card
      }
    ]}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Основная кнопка открытия фильтров */}
        <TouchableOpacity 
          style={[
            styles.filterButton,
            { borderColor: isDark ? colors.border : '#ddd' }
          ]}
          onPress={onOpenFilterModal}
        >
          <Ionicons name="funnel-outline" size={16} color={colors.icon} />
          <Text style={[styles.filterButtonText, { color: colors.text }]}>Фильтры</Text>
        </TouchableOpacity>
        
        {/* Фильтр по цене */}
        {(filters.priceRange[0] !== 0 || filters.priceRange[1] !== 5000) && (
          <TouchableOpacity 
            style={[
              styles.activeFilter,
              { backgroundColor: isDark ? colors.cardBackground : '#f0f0f0' }
            ]}
            onPress={() => onRemoveFilter('priceRange')}
          >
            <Text style={[styles.activeFilterText, { color: colors.text }]}>
              Цена: ${Math.round(filters.priceRange[0])} - ${Math.round(filters.priceRange[1])}
            </Text>
            <Ionicons name="close-circle" size={16} color={colors.icon} />
          </TouchableOpacity>
        )}
        
        {/* Фильтр по брендам */}
        {filters.brands.length > 0 && (
          <TouchableOpacity 
            style={[
              styles.activeFilter,
              { backgroundColor: isDark ? colors.cardBackground : '#f0f0f0' }
            ]}
            onPress={() => onRemoveFilter('brands')}
          >
            <Text style={[styles.activeFilterText, { color: colors.text }]}>
              Бренды: {filters.brands.length}
            </Text>
            <Ionicons name="close-circle" size={16} color={colors.icon} />
          </TouchableOpacity>
        )}
        
        {/* Фильтр по цветам */}
        {filters.colors.length > 0 && (
          <TouchableOpacity 
            style={[
              styles.activeFilter,
              { backgroundColor: isDark ? colors.cardBackground : '#f0f0f0' }
            ]}
            onPress={() => onRemoveFilter('colors')}
          >
            <Text style={[styles.activeFilterText, { color: colors.text }]}>
              Цвета: {filters.colors.length}
            </Text>
            <Ionicons name="close-circle" size={16} color={colors.icon} />
          </TouchableOpacity>
        )}
        
        {/* Фильтр по размерам */}
        {filters.sizes.length > 0 && (
          <TouchableOpacity 
            style={[
              styles.activeFilter,
              { backgroundColor: isDark ? colors.cardBackground : '#f0f0f0' }
            ]}
            onPress={() => onRemoveFilter('sizes')}
          >
            <Text style={[styles.activeFilterText, { color: colors.text }]}>
              Размеры: {filters.sizes.length}
            </Text>
            <Ionicons name="close-circle" size={16} color={colors.icon} />
          </TouchableOpacity>
        )}
        
        {/* Фильтр по гендеру */}
        {filters.genders.length > 0 && (
          <TouchableOpacity 
            style={[
              styles.activeFilter,
              { backgroundColor: isDark ? colors.cardBackground : '#f0f0f0' }
            ]}
            onPress={() => onRemoveFilter('genders')}
          >
            <Text style={[styles.activeFilterText, { color: colors.text }]}>
              Пол: {filters.genders.length}
            </Text>
            <Ionicons name="close-circle" size={16} color={colors.icon} />
          </TouchableOpacity>
        )}
        
        {/* Сортировка */}
        {sortOption !== 'popular' && (
          <TouchableOpacity 
            style={[
              styles.activeFilter,
              { backgroundColor: isDark ? colors.cardBackground : '#f0f0f0' }
            ]}
            onPress={() => onRemoveFilter('sortOption')}
          >
            <Text style={[styles.activeFilterText, { color: colors.text }]}>
              {SORT_DESCRIPTIONS[sortOption] || 'Сортировка'}
            </Text>
            <Ionicons name="close-circle" size={16} color={colors.icon} />
          </TouchableOpacity>
        )}
        
        {/* Кнопка сброса всех фильтров */}
        {hasActiveFilters && (
          <TouchableOpacity 
            style={[
              styles.resetButton,
              { backgroundColor: colors.tint }
            ]}
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
    marginRight: 8,
  },
  resetButtonText: {
    fontSize: 12,
    color: '#fff',
  },
});

export default ActiveFilters;