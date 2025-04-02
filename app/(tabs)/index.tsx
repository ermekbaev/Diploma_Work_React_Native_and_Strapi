import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  StatusBar,
  SafeAreaView,
  Modal,
  Image
} from 'react-native';
import { StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Импорт API и утилит
import { fetchProducts, fetchCategories, fetchModels } from "@/services/api";
import { searchProducts as searchProductsAPI } from '@/services/searchServices';
import { formatApiProduct, groupProductsByBrand } from '@/utils/apiHelpers';
import { BrandWithProducts, Category, filterProductsByCategory } from '@/utils/productHelpers';

// Импорт компонентов
import SearchComponent from '@/components/Search/SearchComponent';
import PromoSlider from '@/components/Promo/PromoSlider';
import CategoryList from '@/components/Categories/CategoryList';
import BrandSection from '@/components/Brands/BrandSection';

// Импорт хука темы
import { useAppTheme } from '@/hooks/useAppTheme';

// Данные для промо-слайдера (можно будет переместить в API в будущем)
const promoData = [
  {
    id: '1',
    title: 'Nike Festival Offers',
    subtitle: 'Up to 50% off',
    color: '#B3E5FC',
    image: 'https://static.nike.com/a/images/c_limit,w_400,f_auto/t_product_v1/19c2a6f0-acb4-41b9-9c46-8b61c067fb1e/air-jordan-1-mid-shoes-BpARGf.png'
  },
  {
    id: '2',
    title: 'Adidas Collection',
    subtitle: 'Starting from $99',
    color: '#FFECB3',
    image: 'https://assets.adidas.com/images/w_600,f_auto,q_auto/68ae7ea7849b43eca70aac1e00f5146d_9366/Stan_Smith_Shoes_White_FX5502_01_standard.jpg'
  },
  {
    id: '3',
    title: 'Puma Summer Sale',
    subtitle: 'Buy 1 Get 1 Free',
    color: '#E1BEE7',
    image: 'https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa,w_450,h_450/global/374915/01/sv01/fnd/IND/fmt/png'
  },
];

export default function HomeScreen() {
  const router = useRouter();
  // Получаем текущую тему
  const { theme, colors } = useAppTheme();
  const isDark = theme === 'dark';

  // Состояния данных
  const [products, setProducts] = useState<any[]>([]);
  const [brandProducts, setBrandProducts] = useState<BrandWithProducts[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  // Состояния интерфейса
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  
  // Состояние фильтров поиска
  const [searchFilters, setSearchFilters] = useState({
    brands: [] as string[],
    categories: [] as string[],
    minPrice: undefined as number | undefined,
    maxPrice: undefined as number | undefined,
    genders: [] as string[],
    colors: [] as string[]
  });

  // Загрузка данных при монтировании компонента
  useEffect(() => {
    loadProductsAndCategories();
  }, []);

  // Функция загрузки товаров и категорий
  const loadProductsAndCategories = async () => {
    try {
      setLoading(true);
      let allCategories = [{ id: 'all', name: 'All', slug: 'all', selected: true }];

      // Загрузка категорий
      try {
        const categoriesData = await fetchCategories();
        
        if (categoriesData && Array.isArray(categoriesData)) {
          // Создаем массив категорий из API
          const apiCategories = categoriesData.map((category: any) => ({
            id: category.id.toString(),
            slug: category.slug || `cat-${category.id}`,
            name: category.NameEngl || category.Name || 'Unnamed',
            selected: false
          }));
          
          // Добавляем категорию "Все" и устанавливаем ее как выбранную
          allCategories = [
            { id: 'all', name: 'All', slug: 'all', selected: true },
            ...apiCategories
          ];
          
          // Обновляем состояние категорий данными из API
          setCategories(allCategories);
        }
      } catch (catError) {
        console.error('Error loading categories:', catError);
      }

      // Загрузка товаров
      const data = await fetchProducts();

      if (!data || !Array.isArray(data)) {
        throw new Error('API response has invalid format');
      }

      // Карта категорий для обновления данных
      const categoryMap = new Map<string, Category>();
      allCategories.forEach(cat => {
        categoryMap.set(cat.slug, cat);
      });

      // Загрузка и форматирование товаров
      const formattedProducts = await Promise.all(data.map(async (item: any) => {
        const models = await fetchModels(item.slug);
        return await formatApiProduct(item, models);
      }));

      setProducts(formattedProducts);

      // Проверяем, нужно ли обновить категории
      if (categoryMap.size > allCategories.length) {
        const updatedCategories = Array.from(categoryMap.values());
        
        updatedCategories.sort((a, b) => {
          if (a.slug === 'all') return -1;
          if (b.slug === 'all') return 1;
          return a.name.localeCompare(b.name);
        });
        
        const finalCategories = updatedCategories.map(cat => ({
          ...cat,
          selected: cat.name === selectedCategory
        }));
        
        setCategories(finalCategories);
      }

      // Группировка товаров по брендам
      const brandsWithProducts = groupProductsByBrand(formattedProducts);
      setBrandProducts(brandsWithProducts);
      
      setError(null);
    } catch (err: any) {
      console.error('Error loading products:', err);
      setError('Failed to load data. Please check your connection.');
      
      // Если данные не загрузились, показываем пустой список
      setProducts([]);
      setBrandProducts([]);
      setCategories([{ id: 'all', name: 'All', slug: 'all', selected: true }]);
    } finally {
      setLoading(false);
    }
  };

  // Функция для обработки выбора категории
  const handleCategorySelect = (categoryName: string) => {
    setSelectedCategory(categoryName);
    
    // Обновляем массив категорий, чтобы отразить выбор
    const updatedCategories = categories.map(cat => ({
      ...cat,
      selected: cat.name === categoryName
    }));
    setCategories(updatedCategories);
  };

  // Функция для выполнения поиска
  const handleSearch = async (query: string) => {
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }
    
    setSearchQuery(query);
    setSearchLoading(true);
    
    try {
      // Используем настоящую функцию поиска из API
      const results = await searchProductsAPI(query, searchFilters);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching products:', error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Функция для открытия модального окна фильтров
  const handleOpenFilters = () => {
    setShowFilterModal(true);
  };

  // Функция для закрытия модального окна фильтров
  const handleCloseFilters = () => {
    setShowFilterModal(false);
  };

  // Функция для применения фильтров и обновления результатов поиска
  const applyFilters = (filters: any) => {
    setSearchFilters(filters);
    handleSearch(searchQuery); // Повторно выполняем поиск с новыми фильтрами
    setShowFilterModal(false);
  };

  // Функция для перехода на страницу товара
  const handleProductPress = (slug: string) => {
    router.push(`../promo/${slug}`);
  };

  // Функция для фильтрации продуктов по выбранной категории
  const getFilteredBrandProducts = () => {
    if (!selectedCategory || selectedCategory === 'All') {
      return brandProducts;
    }
    
    // Клонируем массив брендов и фильтруем продукты в каждом бренде
    return brandProducts.map(brand => {
      const filteredProducts = filterProductsByCategory(brand.products, selectedCategory);
      return {
        ...brand,
        products: filteredProducts
      };
    }).filter(brand => brand.products.length > 0); // Оставляем только бренды с продуктами
  };

  // Простой компонент модального окна фильтров
  const FilterModal = () => (
    <Modal
      visible={showFilterModal}
      animationType="slide"
      transparent={true}
      onRequestClose={handleCloseFilters}
    >
      <View style={styles.modalContainer}>
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Фильтры</Text>
            <TouchableOpacity onPress={handleCloseFilters}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <Text style={[styles.modalSectionTitle, { color: colors.text }]}>В будущем здесь будут фильтры</Text>
          
          <View style={[styles.modalFooter, { borderTopColor: colors.border }]}>
            <TouchableOpacity 
              style={[styles.resetButton, { borderColor: colors.text }]}
              onPress={() => setSearchFilters({
                brands: [],
                categories: [],
                minPrice: undefined,
                maxPrice: undefined,
                genders: [],
                colors: []
              })}
            >
              <Text style={[styles.resetButtonText, { color: colors.text }]}>Сбросить</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.applyButton, { backgroundColor: colors.tint }]}
              onPress={() => applyFilters(searchFilters)}
            >
              <Text style={styles.applyButtonText}>Применить</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.background} />

      {/* Верхняя панель с локацией */}
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <TouchableOpacity style={styles.locationContainer}>
          <Ionicons name="location-outline" size={16} color={colors.text} />
          <Text style={[styles.locationText, { color: colors.text }]}>Bishkek, KGZ</Text>
          <Ionicons name="chevron-down" size={16} color={colors.text} />
        </TouchableOpacity>
        
        <TouchableOpacity>
          <Ionicons name="notifications-outline" size={22} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Компонент поиска */}
      <View style={styles.searchBarContainer}>
        <SearchComponent
          onSearch={handleSearch}
          onFilter={handleOpenFilters}
          placeholder="Поиск товаров"
          loading={searchLoading}
          searchResults={searchResults}
          theme={theme}
          renderResultItem={(data) => {
            const item = data.item || data;
            
            return (
              <TouchableOpacity 
                style={[
                  styles.searchResultItem, 
                  { 
                    borderBottomColor: colors.border,
                    backgroundColor: colors.card
                  }
                ]}
                onPress={() => handleProductPress(item.slug)}
              >
                {item.imageUrl && (
                  <Image 
                    source={{ uri: item.imageUrl }} 
                    style={[
                      styles.searchResultImage,
                      { backgroundColor: isDark ? colors.cardBackground : '#F5F5F5' }
                    ]}
                    defaultSource={require('../../assets/images/bell_icon.png')}
                    resizeMode="cover"
                  />
                )}
                <View style={styles.searchResultInfo}>
                  <Text style={[styles.searchResultTitle, { color: colors.text }]}>
                    {item.Name || 'Без названия'}
                  </Text>
                  <View style={styles.searchResultMeta}>
                    <Text style={[styles.searchResultBrand, { color: colors.placeholder }]}>
                      {item.brandName}
                    </Text>
                    <Text style={[styles.searchResultPrice, { color: colors.text }]}>
                      ${item.Price?.toFixed(2)}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Промо-слайдер */}
        <PromoSlider items={promoData} />

        {/* Категории */}
        <CategoryList 
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={handleCategorySelect}
          isDark={isDark}
        />

        {/* Секции брендов */}
        {loading ? (
          <ActivityIndicator size="large" color={colors.tint} style={styles.loader} />
        ) : error ? (
          <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
        ) : (
          getFilteredBrandProducts().length > 0 
            ? getFilteredBrandProducts().map(brand => (
                <BrandSection 
                  key={brand.slug} 
                  brand={brand} 
                  colors={colors}
                  isDark={isDark}
                />
              ))
            : <Text style={[styles.emptyBrandText, { color: colors.placeholder }]}>
                Нет товаров в категории {selectedCategory}
              </Text>
        )}
        
        {/* Показываем сообщение, если нет брендов для отображения */}
        {!loading && !error && brandProducts.length === 0 && (
          <Text style={[styles.emptyBrandText, { color: colors.placeholder }]}>
            No brands available
          </Text>
        )}
      </ScrollView>
      
      {/* Модальное окно фильтров */}
      <FilterModal />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 16,
    fontWeight: '500',
    marginHorizontal: 5,
  },
  searchBarContainer: {
    marginVertical: 16,
    padding: 16,
    width: '100%',
    zIndex: 1000
  },
  searchResultItem: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  searchResultImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  searchResultInfo: {
    flex: 1,
  },
  searchResultTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  searchResultMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  searchResultBrand: {
    fontSize: 12,
  },
  searchResultPrice: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  loader: {
    marginVertical: 20,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
    marginVertical: 10,
  },
  emptyBrandText: {
    fontSize: 14,
    textAlign: 'center',
    marginVertical: 10,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    maxHeight: '80%',
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
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginVertical: 10,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  resetButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  applyButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});