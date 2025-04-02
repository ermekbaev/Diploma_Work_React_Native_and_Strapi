import React from 'react';
import { 
  View, 
  Text, 
  FlatList,
  TouchableOpacity, 
  StyleSheet,
  Image,
  Dimensions
} from 'react-native';
import { Category } from '@/utils/productHelpers';
import { useAppTheme } from '@/hooks/useAppTheme';

interface CategoryListProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (categoryName: string) => void;
  layout?: 'horizontal' | 'grid';
  showImages?: boolean;
  isDark?: boolean;
  colors?: any;
}

// Временные изображения для категорий (в реальном приложении должны приходить с сервера)
const CATEGORY_IMAGES: {[key: string]: string} = {
  'all': 'https://via.placeholder.com/150?text=All',
  'sneakers': 'https://via.placeholder.com/150?text=Sneakers',
  'boots': 'https://via.placeholder.com/150?text=Boots',
  'sandals': 'https://via.placeholder.com/150?text=Sandals',
  'flats': 'https://via.placeholder.com/150?text=Flats',
  'heels': 'https://via.placeholder.com/150?text=Heels',
  'running': 'https://via.placeholder.com/150?text=Running',
  'basketball': 'https://via.placeholder.com/150?text=Basketball',
  'soccer': 'https://via.placeholder.com/150?text=Soccer',
  'tennis': 'https://via.placeholder.com/150?text=Tennis',
  'casual': 'https://via.placeholder.com/150?text=Casual',
  'formal': 'https://via.placeholder.com/150?text=Formal',
};

const { width } = Dimensions.get('window');
const GRID_COLUMN_COUNT = 3;
const ITEM_WIDTH = (width - 48) / GRID_COLUMN_COUNT;

const EnhancedCategoryList: React.FC<CategoryListProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  layout = 'horizontal',
  showImages = false,
  isDark: propIsDark,
  colors: propColors
}) => {
  // Получаем данные темы из контекста, если они не переданы через пропсы
  const { theme, colors: themeColors } = useAppTheme();
  const isDark = propIsDark !== undefined ? propIsDark : theme === 'dark';
  const colors = propColors || themeColors;

  // Определяем цвета в зависимости от темы
  const categoryColors = {
    background: isDark ? colors.cardBackground : '#F5F5F5',
    text: isDark ? colors.placeholder : '#555555',
    selectedBackground: isDark ? colors.tint : '#000000',
    selectedText: '#FFFFFF',
    gridBackground: isDark ? colors.card : '#F5F5F5',
    gridSelected: isDark ? colors.tint : '#E0E0E0',
    gridBorder: isDark ? colors.tint : '#000000',
    gridText: isDark ? colors.placeholder : '#555555',
  };

  // Рендеринг элемента категории в горизонтальном списке
  const renderHorizontalItem = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={[
        styles.horizontalItem,
        { backgroundColor: categoryColors.background },
        selectedCategory === item.name && {
          backgroundColor: categoryColors.selectedBackground
        }
      ]}
      onPress={() => onSelectCategory(item.name)}
    >
      {showImages && (
        <Image 
          source={{ uri: CATEGORY_IMAGES[item.slug.toLowerCase()] || CATEGORY_IMAGES.all }} 
          style={styles.horizontalItemImage}
        />
      )}
      <Text 
        style={[
          styles.horizontalItemText,
          { color: categoryColors.text },
          selectedCategory === item.name && {
            color: categoryColors.selectedText
          }
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );
  
  // Рендеринг элемента категории в сетке
  const renderGridItem = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={[
        styles.gridItem,
        { backgroundColor: categoryColors.gridBackground },
        selectedCategory === item.name && {
          backgroundColor: categoryColors.gridSelected,
          borderWidth: 1,
          borderColor: categoryColors.gridBorder
        }
      ]}
      onPress={() => onSelectCategory(item.name)}
    >
      <Image 
        source={{ uri: CATEGORY_IMAGES[item.slug.toLowerCase()] || CATEGORY_IMAGES.all }} 
        style={styles.gridItemImage}
      />
      <Text 
        style={[
          styles.gridItemText,
          { color: categoryColors.gridText },
          selectedCategory === item.name && {
            color: isDark ? '#FFFFFF' : '#000000',
            fontWeight: '600'
          }
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );
  
  // Горизонтальный список категорий
  if (layout === 'horizontal') {
    return (
      <View style={styles.horizontalContainer}>
        <FlatList
          key="horizontal" // Добавляем уникальный ключ
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categories}
          keyExtractor={(item) => item.id}
          renderItem={renderHorizontalItem}
          contentContainerStyle={styles.horizontalList}
        />
      </View>
    );
  }
  
  // Сетка категорий
  return (
    <View style={styles.gridContainer}>
      <FlatList
        key="grid" // Добавляем уникальный ключ
        data={categories}
        keyExtractor={(item) => item.id}
        renderItem={renderGridItem}
        numColumns={GRID_COLUMN_COUNT}
        contentContainerStyle={styles.gridList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  // Стили для горизонтального списка
  horizontalContainer: {
    marginBottom: 16,
  },
  horizontalList: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  horizontalItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  horizontalItemImage: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 6,
  },
  horizontalItemText: {
    fontSize: 14,
    fontWeight: '500',
  },
  
  // Стили для сетки
  gridContainer: {
    marginBottom: 16,
  },
  gridList: {
    paddingHorizontal: 16,
  },
  gridItem: {
    width: ITEM_WIDTH,
    margin: 4,
    alignItems: 'center',
    padding: 8,
    borderRadius: 12,
  },
  gridItemImage: {
    width: ITEM_WIDTH - 16,
    height: ITEM_WIDTH - 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  gridItemText: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default EnhancedCategoryList;