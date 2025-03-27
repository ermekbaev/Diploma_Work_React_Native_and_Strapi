import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  ActivityIndicator,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { fetchModels, fetchProducts } from '@/services/api';

// Импорт компонентов
import ProductCard from '@/components/Products/ProductCard';
import SectionHeader from '@/components/ui/SectionHeader';

// Импорт утилит
import { formatApiProduct } from '@/utils/apiHelpers';
import { Product } from '@/utils/productHelpers';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // 2 карточки в ширину с учетом padding

export default function BrandProductsScreen() {
  const router = useRouter();
  const { slug } = useLocalSearchParams();
  const brandSlug = Array.isArray(slug) ? slug[0] : slug;

  // Состояние данных
  const [products, setProducts] = useState<Product[]>([]);
  const [brandName, setBrandName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Загрузка данных о продуктах бренда
  useEffect(() => {
    const loadBrandProducts = async () => {
      try {
        setLoading(true);
        
        // Получаем все продукты
        const allProducts = await fetchProducts();
        
        if (!allProducts || !Array.isArray(allProducts)) {
          throw new Error('API response has invalid format');
        }
        
        // Фильтруем продукты по бренду
        const brandProductsFiltered = allProducts.filter(product => product.brand?.slug === brandSlug);
        
        // Если есть хотя бы один продукт, устанавливаем имя бренда
        if (brandProductsFiltered.length > 0 && brandProductsFiltered[0].brand?.Brand_Name) {
          setBrandName(brandProductsFiltered[0].brand.Brand_Name);
        }
        
        // Трансформируем данные в нужный формат
        const brandProducts = await Promise.all(brandProductsFiltered.map(async (item) => {
          // Получаем модели для продукта
          const models = await fetchModels(item.slug);
          return await formatApiProduct(item, models);
        }));
        
        setProducts(brandProducts);
        setError(null);
      } catch (err: any) {
        console.error('Error loading brand products:', err);
        setError('Не удалось загрузить товары. Пожалуйста, проверьте подключение к интернету.');
      } finally {
        setLoading(false);
      }
    };
    
    loadBrandProducts();
  }, [brandSlug]);

  // Функция для отображения сетки товаров
  const renderProductGrid = () => {
    return (
      <FlatList
        data={products}
        keyExtractor={(item) => item.slug}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            size="medium"
            onPress={(slug) => router.push(`../promo/${slug}`)}
          />
        )}
        numColumns={2}
        contentContainerStyle={styles.productGrid}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={styles.productRow}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Заголовок страницы */}
      <SectionHeader
        title={brandName}
        showBackButton
        onBackPress={() => router.back()}
      />
      
      {/* Содержимое страницы */}
      {loading ? (
        <ActivityIndicator size="large" color="#000000" style={styles.loader} />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : products.length > 0 ? (
        renderProductGrid()
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
    marginBottom: 16,
  },
});