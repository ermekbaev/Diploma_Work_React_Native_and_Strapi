import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  StatusBar,
  SafeAreaView,
  Modal
} from 'react-native';
import recommendationsData from '../../recommendationsData.json';
import { useRouter } from 'expo-router';
import { fetchProducts, fetchCategories, fetchModels  } from "../../services/api";
import { Ionicons } from '@expo/vector-icons';
import { searchProducts } from '@/services/searchServices';
import SearchResultItem from '@/components/Search/SearchResult';
import SearchComponent from '@/components/Search/SearchComponent';

const { width } = Dimensions.get('window');

// Начальные категории (будут заменены данными из API)
const initialCategories = [
  { id: 'all', name: 'All', slug: 'all', selected: true }, // All category is first and selected by default
  { id: '1', name: 'Sports', slug: 'sports' },
  { id: '2', name: 'Fashion', slug: 'fashion' },
  { id: '3', name: 'Running', slug: 'running' },
  { id: '4', name: 'Gym', slug: 'gym' },
];

// Данные для промо-слайдера
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

// Интерфейс для категории
interface Category {
  id: string;
  slug: string;
  name: string;
  selected?: boolean;
}
// Интерфейс для данных API
interface ProductApiResponse {
  slug: string;
  Name: string;
  Description: string;
  Price: number;
  Image: any; 
  brand?: {
    slug: string;
    Brand_Name: string;  
  };
  category?: { // Изменено с categories на category
    slug: string;
    Name: string;  // Добавлено Name
    NameEngl?: string; // Сделано необязательным
    id: string;
  };
  genders: Array<{ Geander_Name: string }>;
  colors: Array<{ Name: string }>;
}

// Интерфейс для преобразованных данных
interface Product {
  slug: string;
  Name: string;
  Description: string;
  Price: number;
  imageUrl: string;
  imageUrls: string[];
  brandName: string;
  brandSlug: string;
  categoryNames: string[];
  categoryIds: string[];
  categorySlugs: string[];
  genders: string[];
  colors: string[];
}

// Интерфейс для бренда с продуктами
interface BrandWithProducts {
  name: string;
  slug: string;
  products: Product[];
}


export default function HomeScreen() {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [brandProducts, setBrandProducts] = useState<BrandWithProducts[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('All'); 


    // Состояния для поиска
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [searchFilters, setSearchFilters] = useState({
    brands: [] as string[],
    categories: [] as string[],
    minPrice: undefined as number | undefined,
    maxPrice: undefined as number | undefined,
    genders: [] as string[],
    colors: [] as string[]
  });

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        let allCategories = [{ id: 'all', name: 'All', slug: 'all', selected: true }];

        // First, load categories from API
        try {
          const categoriesData = await fetchCategories();
          
          if (categoriesData && Array.isArray(categoriesData)) {
            // Create array of categories from API
            const apiCategories = categoriesData.map((category: any) => ({
              id: category.id.toString(),
              slug: category.slug || `cat-${category.id}`,
              name: category.NameEngl || category.Name || 'Unnamed',
              selected: false
            }));
            
            // Add "All" category and set it as selected
            allCategories = [
              { id: 'all', name: 'All', slug: 'all', selected: true },
              ...apiCategories
            ];
            
            // Update categories state with API data
            setCategories(allCategories);
          }
        } catch (catError) {
          console.error('Error loading categories:', catError);
          // Use default categories if API fails
          setCategories(initialCategories);
          console.log('Categories set from initialCategories due to error:', initialCategories);
        }

        // Load products
        const data = await fetchProducts();
        // console.log(data, "==============data===============");
        

        if (!data || !Array.isArray(data)) {
          throw new Error('API response has invalid format');
        }

        // Function to get full image URL
        const getFullImageUrl = (relativePath: any) => {
          if (!relativePath) return null;
          
          if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
            return relativePath;
          }
          
          const path = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
          return `http://192.168.0.103:1337${path}`;
        };

        const categoryMap = new Map<string, Category>();
        
        // Add existing categories to the map
        allCategories.forEach(cat => {
          categoryMap.set(cat.slug, cat);
        });

        // Transform data from API
        const formattedProducts = await Promise.all(data.map(async (item: ProductApiResponse) => {
          const models = await fetchModels(item.slug);
          
          let imageUrls: string[] = [];
          
        // Проверяем, есть ли у моделей изображения
        if (models && models.length > 0) {
          // Получаем изображения из первой модели
          
          const matchingModels = models.filter((model:any) => model.product?.slug === item.slug);
          if (matchingModels.length > 0) {
            // Get images from the first matching model
            const firstModel = matchingModels[0];
            if (firstModel.images && firstModel.images.length > 0) {
              imageUrls = firstModel.images.map((image: any) => {
                // Check if image has URL or formats
                if (image.url) {
                  return getFullImageUrl(image.url);
                } else if (image.formats && image.formats.small && image.formats.small.url) {
                  return getFullImageUrl(image.formats.small.url);
                }
                return null;
              }).filter(Boolean);
            }
          }
        }
          
          // if (imageUrls.length === 0 && item.Image?.data?.url) {
          //   const mainImageUrl = getFullImageUrl(item.Image.data.url);
          //   if (mainImageUrl) {
          //     imageUrls.push(mainImageUrl);
          //   }
          // }
          
          // if (imageUrls.length === 0) {
          //   const imageUrl = item.Image && typeof item.Image === 'object' && item.Image.ModelName 
          //     ? getFullImageUrl(item.Image.ModelName) 
          //     : typeof item.Image === 'string' 
          //       ? getFullImageUrl(item.Image) 
          //       : 'https://placehold.co/150x105/3E4246/FFFFFF?text=No+image';
            
          //   imageUrls.push(imageUrl);
          // }

          // Извлекаем категории из правильного свойства
          const categoryNames: string[] = [];
          const categoryIds: string[] = [];
          const categorySlugs: string[] = [];

          // Проверяем, есть ли у товара свойство category (единственное число)
          if (item.category) {
            const category = item.category;
            if (category.slug) {
              // Используем либо NameEngl, либо Name, в зависимости от того, что доступно
              const categoryName = category.NameEngl || category.Name;
              
              if (categoryName) {
                categoryNames.push(categoryName);
                categoryIds.push(category.id);
                categorySlugs.push(category.slug);
                
                // Добавляем в map, если еще не добавлено
                if (!categoryMap.has(category.slug)) {
                  categoryMap.set(category.slug, {
                    id: category.id,
                    slug: category.slug,
                    name: categoryName,
                    selected: false // Новые категории не выбраны по умолчанию
                  });
                }
              }
            }
          }
          
          return {
            slug: item.slug || 'no-slug',
            Name: item.Name || 'No name',
            Description: item.Description || '',
            Price: item.Price || 0,
            imageUrl: imageUrls.length > 0 ? imageUrls[0] : 'https://placehold.co/150x105/3E4246/FFFFFF?text=No+image',
            imageUrls: imageUrls.length > 0 ? imageUrls : ['https://placehold.co/150x105/3E4246/FFFFFF?text=No+image'],
            brandName: item.brand?.Brand_Name || 'Unknown Brand',
            brandSlug: item.brand?.slug || 'unknown-brand',
            models: models,
            categoryNames,
            categoryIds,
            categorySlugs,
            genders: item.genders && Array.isArray(item.genders) 
              ? item.genders.map(g => g?.Geander_Name || '').filter(Boolean)
              : [],
            colors: item.colors && Array.isArray(item.colors) 
              ? item.colors.map(c => c?.Name || '').filter(Boolean)
              : [],
          };
        }));

        setProducts(formattedProducts);

        // Update categories from map ONLY if we found new categories from products
        if (categoryMap.size > allCategories.length) {
          // Convert the Map to an array
          const updatedCategories = Array.from(categoryMap.values());
          
          // Sort so 'All' is always first
          updatedCategories.sort((a, b) => {
            if (a.slug === 'all') return -1;
            if (b.slug === 'all') return 1;
            return a.name.localeCompare(b.name);
          });
          
          // Preserve the selected state from the current selectedCategory
          const finalCategories = updatedCategories.map(cat => ({
            ...cat,
            selected: cat.name === selectedCategory
          }));
          
          console.log('Updated categories with product data:', finalCategories);
          setCategories(finalCategories);
        }

        // Group products by brands
        const brandMap = new Map<string, BrandWithProducts>();
        
        formattedProducts.forEach(product => {
          if (!brandMap.has(product.brandSlug)) {
            brandMap.set(product.brandSlug, {
              name: product.brandName,
              slug: product.brandSlug,
              products: []
            });
          }
          
          brandMap.get(product.brandSlug)?.products.push(product);
        });
        
        // Convert Map to array
        const brandsWithProducts = Array.from(brandMap.values());
        
        // Use fallback data if no brands or error occurred
        if (brandsWithProducts.length === 0) {
          const demoProducts = recommendationsData.map(item => ({
            slug: item.id,
            Name: item.title,
            Description: '',
            Price: parseFloat(item.price.replace(/[^\d.]/g, '')),
            imageUrl: item.image,
            imageUrls: [item.image],
            brandName: item.title.includes('Nike') ? 'Nike' : 
                      item.title.includes('Adidas') ? 'Adidas' : 'Other Brand',
            brandSlug: item.title.includes('Nike') ? 'nike' : 
                      item.title.includes('Adidas') ? 'adidas' : 'other-brand',
            categoryNames: ['Fashion'],
            categoryIds: ['1'],
            categorySlugs: ['fashion'],
            genders: [],
            colors: [],
          }));
          
          const demoBrandMap = new Map<string, BrandWithProducts>();
          
          demoProducts.forEach(product => {
            if (!demoBrandMap.has(product.brandSlug)) {
              demoBrandMap.set(product.brandSlug, {
                name: product.brandName,
                slug: product.brandSlug,
                products: []
              });
            }
            
            demoBrandMap.get(product.brandSlug)?.products.push(product);
          });
          
          setBrandProducts(Array.from(demoBrandMap.values()));
        } else {
          setBrandProducts(brandsWithProducts);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error loading products:', err);
        setError('Failed to load data. Please check your connection.');
        
        // Use demo data on error
        const demoProducts = recommendationsData.map(item => ({
          slug: item.id,
          Name: item.title,
          Description: '',
          Price: parseFloat(item.price.replace(/[^\d.]/g, '')),
          imageUrl: item.image,
          imageUrls: [item.image],
          brandName: item.title.includes('Nike') ? 'Nike' : 
                    item.title.includes('Adidas') ? 'Adidas' : 'Other Brand',
          brandSlug: item.title.includes('Nike') ? 'nike' : 
                    item.title.includes('Adidas') ? 'adidas' : 'other-brand',
          categoryNames: ['Fashion'],
          categoryIds: ['1'],
          categorySlugs: ['fashion'],
          genders: [],
          colors: [],
        }));
        
        setProducts(demoProducts);
        
        // Group demo data by brands
        const demoBrandMap = new Map<string, BrandWithProducts>();
        
        demoProducts.forEach(product => {
          if (!demoBrandMap.has(product.brandSlug)) {
            demoBrandMap.set(product.brandSlug, {
              name: product.brandName,
              slug: product.brandSlug,
              products: []
            });
          }
          
          demoBrandMap.get(product.brandSlug)?.products.push(product);
        });
        
        setBrandProducts(Array.from(demoBrandMap.values()));
        
        // Make sure initialCategories has 'All' first
        setCategories(initialCategories);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

        // Функция для выполнения поиска
  const handleSearch = async (query: string) => {
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }
    
    setSearchQuery(query);
    setSearchLoading(true);
    
    try {
      const results = await searchProducts(query, searchFilters);
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

      // Функция для рендеринга элемента результата поиска
  const renderSearchResult = (item: Product) => (
    <SearchResultItem item={item} onPress={handleProductPress} />
  );


  // Функция для фильтрации продуктов по выбранной категории
  const getFilteredBrandProducts = () => {
    if (!selectedCategory || selectedCategory === 'All') {
      return brandProducts;
    }
    
    // Клонируем массив брендов и фильтруем продукты в каждом бренде
    return brandProducts.map(brand => {
      
      const filteredProducts = brand.products.filter(product => {
        
        // Проверяем соответствие с учетом регистра
        return product.categoryNames.some(cat => 
          cat.toLowerCase() === selectedCategory.toLowerCase()
        );
      });
      
      return {
        ...brand,
        products: filteredProducts
      };
    }).filter(brand => brand.products.length > 0); // Оставляем только бренды с продуктами
  };

  // Функция определения приоритетного гендера для отображения
  const getPriorityGender = (genders: string[]): string => {
    if (!genders || genders.length === 0) return 'Универсальные';
    
    // Проверяем наличие "Унисекс" с учетом регистра
    const unisex = genders.find(g => 
      g.toLowerCase() === 'унисекс' || 
      g.toLowerCase() === 'unisex');
    if (unisex) return unisex;
    
    // Проверяем наличие "Мужской"
    const male = genders.find(g => 
      g.toLowerCase() === 'мужской' || 
      g.toLowerCase() === 'men' || 
      g.toLowerCase() === 'male');
    if (male) return male;
    
    // Проверяем наличие "Женский"
    const female = genders.find(g => 
      g.toLowerCase() === 'женский' || 
      g.toLowerCase() === 'women' || 
      g.toLowerCase() === 'female');
    if (female) return female;
    
    // Если ничего не найдено, возвращаем первый элемент (исключая "Детский")
    const nonKids = genders.filter(g => 
      !g.toLowerCase().includes('детский') && 
      !g.toLowerCase().includes('kids') && 
      !g.toLowerCase().includes('child'));
    
    return nonKids.length > 0 ? nonKids[0] : 'Универсальные';
  };

  // console.log(products);
  

  // Рендер элемента промо-слайдера
  const renderPromoSlide = ({ item } : {item : any}) => (
    <View style={[styles.promoSlide, { backgroundColor: item.color }]}>
      <View style={styles.promoContent}>
        <Text style={styles.promoTitle}>{item.title}</Text>
        <Text style={styles.promoSubtitle}>{item.subtitle}</Text>
        <TouchableOpacity style={styles.shopNowButton}>
          <Text style={styles.shopNowText}>Shop Now</Text>
        </TouchableOpacity>
      </View>
      <Image 
        source={{ uri: item.image }} 
        style={styles.promoImage} 
        resizeMode="contain"
      />
    </View>
  );

  // Рендер карточки товара для горизонтального слайдера
  const renderProductCard = ({ item }: { item: Product }) => {
    const displayGender = getPriorityGender(item.genders);
    
    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => router.push(`../promo/${item.slug}`)}
      >
        <View style={styles.productImageContainer}>
          <Image 
            source={{ uri: item.imageUrl }} 
            style={styles.productImage} 
            defaultSource={require('../../assets/images/bell_icon.png')}
            resizeMode="cover"
          />
        </View>
        <View style={styles.productInfoContainer}>
          <Text style={styles.productTitle} numberOfLines={1} ellipsizeMode="tail">
            {item.Name}
          </Text>
          <View style={styles.productMetaContainer}>
            <Text style={styles.productBrand} numberOfLines={1} ellipsizeMode="tail">
              {item.brandName}
            </Text>
            <Text style={styles.productCategory} numberOfLines={1} ellipsizeMode="tail">
              {displayGender}
            </Text>
          </View>
          <Text style={styles.productPrice}>${item.Price.toFixed(2)}</Text>
        </View>
      </TouchableOpacity>
    );
  };
  
  // onPress={() => router.push(`../promo/${item.slug}`)}
// Рендер секции с товарами определенного бренда
const renderBrandSection = (brand: BrandWithProducts) => (
  <View style={styles.productSection} key={brand.slug}>
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{brand.name}</Text>
      <TouchableOpacity onPress={() => router.push(`../brands/${brand.slug}`)}>
        <Text style={styles.seeAllText}>See All</Text>
      </TouchableOpacity>
    </View>

    {brand.products.length > 0 ? (
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={brand.products.slice(0, 5)}
        keyExtractor={(item) => item.slug}
        renderItem={renderProductCard}
        contentContainerStyle={styles.productList}
      />
    ) : (
      <Text style={styles.emptyBrandText}>No products available for this brand</Text>
    )}
  </View>
);

// Обновленная функция для рендеринга элемента категории
const renderCategoryItem = ({ item }: { item: Category }) => (
  <TouchableOpacity
    style={[
      styles.categoryItem,
      selectedCategory === item.name && styles.selectedCategoryItem
    ]}
    onPress={() => {
      setSelectedCategory(item.name);
      
      // Обновляем массив категорий, чтобы отразить выбор
      const updatedCategories = categories.map(cat => ({
        ...cat,
        selected: cat.name === item.name
      }));
      setCategories(updatedCategories);
    }}
  >
    <Text 
      style={[
        styles.categoryText,
        selectedCategory === item.name && styles.selectedCategoryText
      ]}
    >
      {item.name}
    </Text>
  </TouchableOpacity>
);

 // Простой компонент модального окна фильтров
  const FilterModal = () => (
    <Modal
      visible={showFilterModal}
      animationType="slide"
      transparent={true}
      onRequestClose={handleCloseFilters}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Фильтры</Text>
            <TouchableOpacity onPress={handleCloseFilters}>
              <Ionicons name="close" size={24} color="#000000" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.modalSectionTitle}>В будущем здесь будут фильтры</Text>
          
          <View style={styles.modalFooter}>
            <TouchableOpacity 
              style={styles.resetButton}
              onPress={() => setSearchFilters({
                brands: [],
                categories: [],
                minPrice: undefined,
                maxPrice: undefined,
                genders: [],
                colors: []
              })}
            >
              <Text style={styles.resetButtonText}>Сбросить</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.applyButton}
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
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Верхняя панель с локацией */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.locationContainer}>
          <Ionicons name="location-outline" size={16} color="#000000" />
          <Text style={styles.locationText}>Bishkek, KGZ</Text>
          <Ionicons name="chevron-down" size={16} color="#000000" />
        </TouchableOpacity>
        
        <TouchableOpacity>
          <Ionicons name="notifications-outline" size={22} color="#000000" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
      {/* Компонент поиска */}
      <View style={styles.searchBarContainer}>
        <SearchComponent
          onSearch={handleSearch}
          onFilter={handleOpenFilters}
          placeholder="Поиск товаров"
          loading={searchLoading}
          searchResults={searchResults}
          renderResultItem={renderSearchResult}
        />
      </View>

        {/* Промо-слайдер */}
        <View style={styles.promoSliderContainer}>
          <FlatList
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            snapToInterval={width - 32}
            decelerationRate="fast"
            data={promoData}
            keyExtractor={(item) => item.id}
            renderItem={renderPromoSlide}
          />
        </View>

        {/* Категории */}
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

        {/* Секции брендов */}
        {loading ? (
          <ActivityIndicator size="large" color="#000000" style={styles.loader} />
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          getFilteredBrandProducts().length > 0 
            ? getFilteredBrandProducts().map(brand => renderBrandSection(brand))
            : <Text style={styles.emptyBrandText}>Нет товаров в категории {selectedCategory}</Text>
          
        )}
        
        {/* Показываем сообщение, если нет брендов для отображения */}
        {!loading && !error && brandProducts.length === 0 && (
          <Text style={styles.emptyBrandText}>No brands available</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
    color: '#000000',
    marginHorizontal: 5,
  },
  searchBarContainer: {
    marginVertical: 16,
    width: '100%',
    zIndex: 1000
  },
  loader: {
    marginVertical: 20,
  },
  filterButton: {
    width: 45,
    height: 45,
    backgroundColor: '#000000',
    borderRadius: 12,
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
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
    color: '#000000',
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginVertical: 10,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  resetButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#000000',
  },
  resetButtonText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '600',
  },
  applyButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#000000',
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  promoSliderContainer: {
    marginBottom: 20,
  },
  promoSlide: {
    width: width - 32,
    height: 160,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  promoContent: {
    flex: 1,
    justifyContent: 'center',
  },
  promoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  promoSubtitle: {
    fontSize: 14,
    color: '#333333',
    marginBottom: 16,
  },
  shopNowButton: {
    backgroundColor: '#000000',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  shopNowText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  promoImage: {
    width: 120,
    height: 120,
    transform: [{ rotate: '-15deg' }],
  },
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
    backgroundColor: '#F5F5F5',
  },
  selectedCategoryItem: {
    backgroundColor: '#000000',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555555',
  },
  selectedCategoryText: {
    color: '#FFFFFF',
  },
  productSection: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  seeAllText: {
    fontSize: 14,
    color: '#666666',
  },
  productList: {
    paddingRight: 16,
  },
  productCard: {
    width: 170,
    marginRight: 15,
  },
  productImageContainer: {
    width: '100%',
    height: 170,
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  productInfoContainer: {
    paddingHorizontal: 4,
  },
  productTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  productSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    marginTop: 4,
  },
  productMetaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  productBrand: {
    fontSize: 14,
    color: '#666666',
    flex: 1,
  },
  productCategory: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'right',
    flex: 1,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 14,
    textAlign: 'center',
    marginVertical: 10,
  },
  emptyBrandText: {
    color: '#666666',
    fontSize: 14,
    textAlign: 'center',
    marginVertical: 10,
  },
});