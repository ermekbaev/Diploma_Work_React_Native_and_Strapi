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

interface CategoryListProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (categoryName: string) => void;
  layout?: 'horizontal' | 'grid';
  showImages?: boolean;
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
  showImages = false
}) => {
  // Рендеринг элемента категории в горизонтальном списке
  const renderHorizontalItem = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={[
        styles.horizontalItem,
        selectedCategory === item.name && styles.selectedHorizontalItem
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
          selectedCategory === item.name && styles.selectedItemText
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
        selectedCategory === item.name && styles.selectedGridItem
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
          selectedCategory === item.name && styles.selectedItemText
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
    backgroundColor: '#F5F5F5',
    marginRight: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedHorizontalItem: {
    backgroundColor: '#000000',
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
    color: '#555555',
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
    backgroundColor: '#F5F5F5',
  },
  selectedGridItem: {
    backgroundColor: '#E0E0E0',
    borderWidth: 1,
    borderColor: '#000000',
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
    color: '#555555',
  },
  
  // Общие стили
  selectedItemText: {
    color: '#ffffff',
    fontWeight: '600',
  },
});

export default EnhancedCategoryList;