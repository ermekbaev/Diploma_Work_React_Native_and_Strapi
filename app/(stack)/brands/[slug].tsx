import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { fetchModels, fetchProducts } from '../../../services/api';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // 2 карточки в ширину с учетом padding

// Интерфейс для продукта
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

export default function BrandProductsScreen() {
  const router = useRouter();
  const { slug } = useLocalSearchParams();
  const brandSlug = Array.isArray(slug) ? slug[0] : slug;

  const [products, setProducts] = useState<Product[]>([]);
  const [brandName, setBrandName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBrandProducts = async () => {
        try {
          setLoading(true);
          const allProducts = await fetchProducts();
          
          if (!allProducts || !Array.isArray(allProducts)) {
            throw new Error('API response has invalid format');
          }
          
          // Функция для получения полного URL изображения
          const getFullImageUrl = (relativePath: any) => {
            if (!relativePath) return null;
            
            if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
              return relativePath;
            }
            
            const path = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
            return `http://192.168.0.103:1337${path}`;
          };
          
          // Фильтруем продукты по бренду
          const brandProductsFiltered = allProducts.filter(product => product.brand?.slug === brandSlug);
          
          // Если есть хотя бы один продукт, устанавливаем имя бренда
          if (brandProductsFiltered.length > 0 && brandProductsFiltered[0].brand?.Brand_Name) {
            setBrandName(brandProductsFiltered[0].brand.Brand_Name);
          }
          
          // Трансформируем данные
          const brandProducts = await Promise.all(brandProductsFiltered.map(async (item) => {
            // Получаем модели для продукта - ключевой момент!
            const models = await fetchModels(item.slug);
            
            let imageUrls: string[] = [];
            
            // Проверяем, есть ли у моделей изображения
            if (models && models.length > 0) {
              // Фильтруем модели, относящиеся к текущему продукту
              const matchingModels = models.filter((model: any) => model.product?.slug === item.slug);
              
              if (matchingModels.length > 0) {
                // Получаем изображения из первой подходящей модели
                const firstModel = matchingModels[0];
                
                if (firstModel.images && firstModel.images.length > 0) {
                  imageUrls = firstModel.images.map((image: any) => {
                    // Проверяем формат изображения
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
            
            // Если изображений из моделей нет, используем плейсхолдер
            if (imageUrls.length === 0) {
              imageUrls = ['https://placehold.co/150x105/3E4246/FFFFFF?text=No+image'];
            }
            
            return {
              slug: item.slug || 'no-slug',
              Name: item.Name || 'No name',
              Description: item.Description || '',
              Price: item.Price || 0,
              imageUrl: imageUrls[0], // Первое изображение для превью
              imageUrls: imageUrls,   // Все изображения
              brandName: item.brand?.Brand_Name || 'Unknown Brand',
              brandSlug: item.brand?.slug || 'unknown-brand',
              categoryNames: item.category ? [item.category.NameEngl || item.category.Name] : [],
              categoryIds: item.category ? [item.category.id] : [],
              categorySlugs: item.category ? [item.category.slug] : [],
              genders: item.genders && Array.isArray(item.genders) 
                ? item.genders.map((g: any) => g?.Geander_Name || '').filter(Boolean)
                : [],
              colors: item.colors && Array.isArray(item.colors) 
                ? item.colors.map((c: any) => c?.Name || '').filter(Boolean)
                : [],
            };
          }));
          
          setProducts(brandProducts);
          setError(null);
        } catch (err) {
          console.error('Error loading brand products:', err);
          setError('Не удалось загрузить товары. Пожалуйста, проверьте подключение к интернету.');
        } finally {
          setLoading(false);
        }
      };
    
    loadBrandProducts();
  }, [brandSlug]);

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
    
    // Если ничего не найдено, возвращаем первый элемент
    const nonKids = genders.filter(g => 
      !g.toLowerCase().includes('детский') && 
      !g.toLowerCase().includes('kids') && 
      !g.toLowerCase().includes('child'));
    
    return nonKids.length > 0 ? nonKids[0] : 'Универсальные';
  };

  // Рендер карточки товара для сетки
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
            // defaultSource={require('../../assets/images/bell_icon.png')}
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Верхняя панель с кнопкой назад и названием бренда */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{brandName}</Text>
        <View style={styles.placeholder} />
      </View>
      
      {/* Содержимое страницы */}
      {loading ? (
        <ActivityIndicator size="large" color="#000000" style={styles.loader} />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : products.length > 0 ? (
        <FlatList
          data={products}
          keyExtractor={(item) => item.slug}
          renderItem={renderProductCard}
          numColumns={2}
          contentContainerStyle={styles.productGrid}
          showsVerticalScrollIndicator={false}
          columnWrapperStyle={styles.productRow}
        />
      ) : (
        <Text style={styles.emptyText}>Товары не найдены</Text>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  placeholder: {
    width: 24,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    flex: 1,
    textAlign: 'center',
    marginTop: 20,
    color: '#FF6B6B',
    fontSize: 16,
  },
  emptyText: {
    flex: 1,
    textAlign: 'center',
    marginTop: 20,
    color: '#666666',
    fontSize: 16,
  },
  productGrid: {
    padding: 16,
  },
  productRow: {
    justifyContent: 'space-between',
  },
  productCard: {
    width: CARD_WIDTH,
    marginBottom: 16,
  },
  productImageContainer: {
    width: '100%',
    height: CARD_WIDTH, // Квадратное изображение
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
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  productMetaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  productBrand: {
    fontSize: 12,
    color: '#666666',
    flex: 1,
  },
  productCategory: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'right',
    flex: 1,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000000',
    marginTop: 4,
  },
});