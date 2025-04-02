import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Dimensions,
  RefreshControl
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Импорт API и утилит
import { fetchProducts, fetchCategories, fetchModels } from "@/services/api";
import { formatApiProduct } from '@/utils/apiHelpers';
import { Product, Category } from '@/utils/productHelpers';

// Импорт компонентов
import FilterModal from '@/components/Filters/FilterModal';
import SortModal from '@/components/Filters/SortModal';
import EnhancedCategoryList from '@/components/Catalog/EnhancedCategoryList';
import ActiveFilters from '@/components/Catalog/ActiveFilters';
import EnhancedProductCard from '@/components/Products/EnhancedProductCard';

// Импорт хука темы
import { useAppTheme } from '@/hooks/useAppTheme';

const { width } = Dimensions.get('window');

export default function CatalogScreen() {
  const router = useRouter();
  
  // Получаем текущую тему и цвета
  const { theme, colors } = useAppTheme();
  const isDark = theme === 'dark';

  // Состояния для данных
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [favoriteProducts, setFavoriteProducts] = useState<string[]>([]);
  
  // Состояния UI
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedView, setSelectedView] = useState<'grid' | 'list'>('grid');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);
  const [categoryLayout, setCategoryLayout] = useState<'horizontal' | 'grid'>('horizontal');
  
  // Состояния сортировки и фильтрации
  const [sortOption, setSortOption] = useState<string>('popular');
  const [filters, setFilters] = useState({
    priceRange: [0, 5000],
    brands: [] as string[],
    colors: [] as string[],
    sizes: [] as number[],
    genders: [] as string[],
    brandsOptions: [] as string[],
    colorsOptions: [] as string[],
    sizesOptions: [] as number[],
    gendersOptions: [] as string[]
  });

  // Функция загрузки данных
  const loadProductsAndCategories = useCallback(async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      // Загрузка категорий
      const categoriesData = await fetchCategories();
      let allCategories = [{ id: 'all', name: 'All', slug: 'all', selected: true }];
      
      if (categoriesData && Array.isArray(categoriesData)) {
        const apiCategories = categoriesData.map((category: any) => ({
          id: category.id.toString(),
          slug: category.slug || `cat-${category.id}`,
          name: category.NameEngl || category.Name || 'Unnamed',
          selected: false
        }));
        
        allCategories = [
          { id: 'all', name: 'All', slug: 'all', selected: true },
          ...apiCategories
        ];
        
        setCategories(allCategories);
      }

      // Загрузка продуктов
      const productsData = await fetchProducts();
      
      if (!productsData || !Array.isArray(productsData)) {
        throw new Error('API response has invalid format');
      }
      
      // Форматирование данных продуктов с моделями для корректных изображений
      const formattedProducts = await Promise.all(productsData.map(async (item: any) => {
        // Загружаем модели для каждого продукта
        const models = await fetchModels(item.slug);
        // Форматируем продукт с учетом моделей для получения изображений
        return await formatApiProduct(item, models);
      }));
      
      setProducts(formattedProducts);
      
      // Сбор данных для фильтров
      collectFilterData(formattedProducts);
      
      setError(null);
    } catch (err: any) {
      console.error('Error loading data:', err);
      setError('Ошибка загрузки данных. Проверьте подключение к интернету.');
      setProducts([]);
      setFilteredProducts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Первичная загрузка данных
  useEffect(() => {
    loadProductsAndCategories();
  }, [loadProductsAndCategories]);

  // Применение фильтров при их изменении
  useEffect(() => {
    applyFiltersAndSort();
  }, [products, selectedCategory, sortOption, filters]);

  // Сбор данных для фильтров
  const collectFilterData = (products: Product[]) => {
    const brands = new Set<string>();
    const colors = new Set<string>();
    const sizes = new Set<number>();
    const genders = new Set<string>();
    let minPrice = Infinity;
    let maxPrice = 0;
    
    products.forEach(product => {
      // Бренды
      if (product.brandName) {
        brands.add(product.brandName);
      }
      
      // Цвета
      product.colors.forEach(color => colors.add(color));
      
      // Гендер
      product.genders.forEach(gender => genders.add(gender));
      
      // Размеры - получаем из свойства sizes продукта
      if (product.sizes && product.sizes.length > 0) {
        product.sizes.forEach((size: number) => sizes.add(size));
      }
      
      // Цены
      if (product.Price < minPrice) minPrice = product.Price;
      if (product.Price > maxPrice) maxPrice = product.Price;
    });
    
    // Обновление состояния фильтров с учетом возможных значений
    setFilters(prev => ({
      ...prev,
      priceRange: [minPrice || 0, maxPrice || 5000],
      brandsOptions: Array.from(brands),
      colorsOptions: Array.from(colors),
      gendersOptions: Array.from(genders),
      sizesOptions: Array.from(sizes).sort((a, b) => a - b), // Сортируем размеры по возрастанию
    }));
  };

  // Обработчик выбора категории
  const handleCategorySelect = (categoryName: string) => {
    setSelectedCategory(categoryName);
    
    // Обновляем массив категорий, чтобы отразить выбор
    const updatedCategories = categories.map(cat => ({
      ...cat,
      selected: cat.name === categoryName
    }));
    setCategories(updatedCategories);
  };

  // Применение фильтров и сортировки
  const applyFiltersAndSort = () => {
    // Сначала фильтрация по категории
    let result = [...products];
    
    if (selectedCategory !== 'All') {
      result = result.filter(product => 
        product.categoryNames.some(cat => cat === selectedCategory)
      );
    }
    
    // Фильтрация по цене
    result = result.filter(product => 
      product.Price >= filters.priceRange[0] && product.Price <= filters.priceRange[1]
    );
    
    // Фильтрация по брендам
    if (filters.brands.length > 0) {
      result = result.filter(product => 
        filters.brands.includes(product.brandName)
      );
    }
    
    // Фильтрация по цветам
    if (filters.colors.length > 0) {
      result = result.filter(product => 
        product.colors.some(color => filters.colors.includes(color))
      );
    }
    
    // Фильтрация по размерам (используя свойство sizes из продукта)
    if (filters.sizes.length > 0) {
      result = result.filter(product => 
        product.sizes.some((size: number) => filters.sizes.includes(size))
      );
    }
    
    // Фильтрация по гендеру
    if (filters.genders.length > 0) {
      result = result.filter(product => 
        product.genders.some(gender => filters.genders.includes(gender))
      );
    }
    
    // Сортировка
    switch(sortOption) {
      case 'price_asc':
        result.sort((a, b) => a.Price - b.Price);
        break;
      case 'price_desc':
        result.sort((a, b) => b.Price - a.Price);
        break;
      case 'name_asc':
        result.sort((a, b) => a.Name.localeCompare(b.Name));
        break;
      case 'name_desc':
        result.sort((a, b) => b.Name.localeCompare(a.Name));
        break;
      // По умолчанию показываем по популярности (популярность пока не реализована, так что не сортируем)
      case 'popular':
      default:
        break;
    }
    
    setFilteredProducts(result);
  };

  // Обработчики фильтров и сортировки
  const handleRemoveFilter = (filterType: string, value?: any) => {
    switch(filterType) {
      case 'priceRange':
        setFilters(prev => ({
          ...prev,
          priceRange: [0, 5000] // Сброс к значениям по умолчанию
        }));
        break;
      case 'brands':
        setFilters(prev => ({
          ...prev,
          brands: []
        }));
        break;
      case 'colors':
        setFilters(prev => ({
          ...prev,
          colors: []
        }));
        break;
      case 'sizes':
        setFilters(prev => ({
          ...prev,
          sizes: []
        }));
        break;
      case 'genders':
        setFilters(prev => ({
          ...prev,
          genders: []
        }));
        break;
      case 'sortOption':
        setSortOption('popular');
        break;
    }
  };

  const handleResetFilters = () => {
    setFilters(prev => ({
      ...prev,
      priceRange: [0, 5000],
      brands: [],
      colors: [],
      sizes: [],
      genders: []
    }));
    setSortOption('popular');
    setSelectedCategory('All');
    
    // Обновляем массив категорий
    const updatedCategories = categories.map(cat => ({
      ...cat,
      selected: cat.name === 'All'
    }));
    setCategories(updatedCategories);
  };

  // Функции для работы с избранным
  const toggleFavorite = (product: Product) => {
    setFavoriteProducts(prev => {
      if (prev.includes(product.slug)) {
        return prev.filter(slug => slug !== product.slug);
      } else {
        return [...prev, product.slug];
      }
    });
  };

  // Функции для UI
  const toggleView = () => {
    setSelectedView(prev => prev === 'grid' ? 'list' : 'grid');
  };

  const toggleCategoryLayout = () => {
    setCategoryLayout(prev => prev === 'horizontal' ? 'grid' : 'horizontal');
  };

  // Применение фильтров из модального окна
  const applyFilters = (newFilters: any) => {
    setFilters(newFilters);
    setShowFilterModal(false);
  };

  // Применение сортировки из модального окна
  const applySorting = (option: string) => {
    setSortOption(option);
    setShowSortModal(false);
  };

  // Добавление в корзину
  const addToCart = (product: Product) => {
    // Здесь должна быть логика добавления в корзину
    alert(`Товар "${product.Name}" добавлен в корзину`);
  };

  // Рендеринг элементов списка продуктов
  const renderProductItem = ({ item }: { item: Product }) => (
    <EnhancedProductCard 
      product={item}
      onPress={(slug:any) => router.push(`../promo/${slug}`)}
      onAddToFavorites={toggleFavorite}
      onAddToCart={addToCart}
      size={selectedView === 'grid' ? 'medium' : 'large'}
      viewType={selectedView}
      isFavorite={favoriteProducts.includes(item.slug)}
      isDark={isDark}
      colors={colors}
    />
  );

  // Для оптимизации сетки используем getItemLayout
  const getItemLayout = (data: any, index: number) => {
    const itemHeight = selectedView === 'grid' ? 300 : 150; // Примерная высота элементов
    return {
      length: itemHeight,
      offset: itemHeight * index,
      index,
    };
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.background} />
      
      {/* Заголовок */}
      <View style={[styles.header, { 
        backgroundColor: colors.card,
        borderBottomColor: colors.border 
      }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Каталог</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.actionButton} onPress={() => setShowSortModal(true)}>
            <Ionicons name="options-outline" size={22} color={colors.icon} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={toggleView}>
            <Ionicons name={selectedView === 'grid' ? 'list' : 'grid'} size={22} color={colors.icon} />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Фильтры */}
      <ActiveFilters 
        filters={filters}
        sortOption={sortOption}
        onRemoveFilter={handleRemoveFilter}
        onResetFilters={handleResetFilters}
        onOpenFilterModal={() => setShowFilterModal(true)}
        isDark={isDark}
        colors={colors}
      />
      
      {/* Категории */}
      <View style={[styles.categoryHeader, { backgroundColor: colors.background }]}>
        <Text style={[styles.categoryTitle, { color: colors.text }]}>Категории</Text>
        <TouchableOpacity onPress={toggleCategoryLayout}>
          <Ionicons 
            name={categoryLayout === 'horizontal' ? 'grid' : 'menu'} 
            size={22} 
            color={colors.icon} 
          />
        </TouchableOpacity>
      </View>
      
      <EnhancedCategoryList 
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={handleCategorySelect}
        layout={categoryLayout}
        showImages={categoryLayout === 'grid'}
        isDark={isDark}
      />
      
      {/* Счетчик результатов */}
      <View style={styles.resultsCountContainer}>
        <Text style={[styles.resultsCountText, { color: colors.placeholder }]}>
          Найдено: {filteredProducts.length} товаров
        </Text>
      </View>
      
      {/* Список продуктов */}
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.tint} />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
          <TouchableOpacity 
            style={[styles.retryButton, { backgroundColor: colors.tint }]}
            onPress={() => loadProductsAndCategories()}
          >
            <Text style={styles.retryButtonText}>Повторить</Text>
          </TouchableOpacity>
        </View>
      ) : filteredProducts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="search-outline" size={64} color={colors.placeholder} />
          <Text style={[styles.emptyText, { color: colors.text }]}>Товары не найдены</Text>
          <Text style={[styles.emptySubtext, { color: colors.placeholder }]}>
            Попробуйте изменить параметры фильтрации
          </Text>
          <TouchableOpacity 
            style={[styles.resetButton, { backgroundColor: colors.tint }]}
            onPress={handleResetFilters}
          >
            <Text style={styles.resetButtonText}>Сбросить фильтры</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.slug}
          renderItem={renderProductItem}
          numColumns={selectedView === 'grid' ? 2 : 1}
          key={selectedView} // Для корректного переключения между видами
          contentContainerStyle={[
            styles.productList,
            selectedView === 'list' && styles.productListAsList
          ]}
          showsVerticalScrollIndicator={false}
          getItemLayout={getItemLayout}
          columnWrapperStyle={selectedView === 'grid' ? styles.gridRow : undefined}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadProductsAndCategories(true)}
              colors={[colors.tint]}
              tintColor={colors.tint}
            />
          }
        />
      )}
      
      {/* Модальное окно фильтров */}
      <FilterModal
        visible={showFilterModal}
        initialFilters={filters}
        onApply={applyFilters}
        onClose={() => setShowFilterModal(false)}
        isDark={isDark}
        colors={colors}
      />
      
      {/* Модальное окно сортировки */}
      <SortModal
        visible={showSortModal}
        selectedOption={sortOption}
        onSelect={applySorting}
        onClose={() => setShowSortModal(false)}
        isDark={isDark}
        colors={colors}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    marginLeft: 16,
    padding: 4,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  resultsCountContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  resultsCountText: {
    fontSize: 12,
  },
  productList: {
    padding: 8,
  },
  productListAsList: {
    paddingHorizontal: 16,
  },
  gridRow: {
    justifyContent: 'space-between',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    marginTop: 16,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  resetButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  resetButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
});