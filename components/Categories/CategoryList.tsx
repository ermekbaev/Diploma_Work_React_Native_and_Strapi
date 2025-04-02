import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Category } from '@/utils/productHelpers';
import { useAppTheme } from '@/hooks/useAppTheme';

interface CategoryListProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (categoryName: string) => void;
  isDark?: boolean;
}

const CategoryList: React.FC<CategoryListProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  isDark: propIsDark
}) => {
  // Получаем данные темы из контекста, если они не переданы через пропсы
  const { theme, colors: themeColors } = useAppTheme();
  const isDark = propIsDark !== undefined ? propIsDark : theme === 'dark';
  
  // Определяем цвета в зависимости от темы
  const categoryColors = {
    background: isDark ? '#2C2C2C' : '#F5F5F5',
    text: isDark ? '#BBBBBB' : '#555555',
    selectedBackground: isDark ? themeColors.tint : '#000000',
    selectedText: '#FFFFFF',
  };

  // Рендеринг элемента категории
  const renderCategoryItem = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        { backgroundColor: categoryColors.background },
        selectedCategory === item.name && 
        { backgroundColor: categoryColors.selectedBackground }
      ]}
      onPress={() => onSelectCategory(item.name)}
    >
      <Text 
        style={[
          styles.categoryText,
          { color: categoryColors.text },
          selectedCategory === item.name && 
          { color: categoryColors.selectedText }
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );
  
  return (
    <View style={styles.categoriesContainer}>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={categories}
        keyExtractor={(item) => item.id}
        renderItem={renderCategoryItem}
        contentContainerStyle={styles.categoriesList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  categoriesContainer: {
    marginBottom: 20,
  },
  categoriesList: {
    paddingVertical: 5,
  },
  categoryItem: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default CategoryList;