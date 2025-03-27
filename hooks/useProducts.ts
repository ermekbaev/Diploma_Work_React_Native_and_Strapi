import { useState, useEffect, useCallback } from 'react';
import { fetchProducts, fetchModels } from '@/services/api';
import { getFullImageUrl } from '@/utils/imageHelpers';

// Интерфейсы для типизации
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

interface BrandWithProducts {
  name: string;
  slug: string;
  products: Product[];
}

/**
 * Хук для работы с продуктами
 */
export const useProducts = () => {
  // Состояния
  const [products, setProducts] = useState<Product[]>([]);
  const [brandProducts, setBrandProducts] = useState<BrandWithProducts[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Функция для форматирования данных продукта из API
  const formatProduct = useCallback(async (item: any, models: any[]): Promise<Product> => {
    // Извлечение URL изображений из моделей
    const imageUrls: string[] = [];
    let modelColors: string[] = [];
    
    if (models && models.length > 0) {
      const matchingModels = models.filter((model: any) => model.product?.slug === item.slug);
      
      if (matchingModels.length > 0) {
        matchingModels.forEach((model: any) => {
          // Добавляем цвета
          if (model.color && model.color.Name) {
            if (!modelColors.includes(model.color.Name)) {
              modelColors.push(model.color.Name);
            }
          }
          
          // Добавляем изображения
          if (model.images && model.images.length > 0) {
            model.images.forEach((image: any) => {
              if (image.url) {
                const imageUrl = getFullImageUrl(image.url);
                if (imageUrl && !imageUrls.includes(imageUrl)) {
                  imageUrls.push(imageUrl);
                }
              }
            });
          }
        });
      }
    }
    
    // Если изображений нет, используем плейсхолдер
    if (imageUrls.length === 0) {
      imageUrls.push('https://placehold.co/150x105/3E4246/FFFFFF?text=No+image');
    }
    
    // Собираем информацию о категориях
    const categoryNames: string[] = [];
    const categoryIds: string[] = [];
    const categorySlugs: string[] = [];
    
    if (item.category) {
      const category = item.category;
      if (category.slug) {
        const categoryName = category.NameEngl || category.Name;
        
        if (categoryName) {
          categoryNames.push(categoryName);
          categoryIds.push(category.id);
          categorySlugs.push(category.slug);
        }
      }
    }
    
    // Возвращаем отформатированные данные продукта
    return {
      slug: item.slug || 'no-slug',
      Name: item.Name || 'No name',
      Description: item.Description || '',
      Price: item.Price || 0,
      imageUrl: imageUrls[0],
      imageUrls: imageUrls,
      brandName: item.brand?.Brand_Name || 'Unknown Brand',
      brandSlug: item.brand?.slug || 'unknown-brand',
      categoryNames,
      categoryIds,
      categorySlugs,
      genders: item.genders && Array.isArray(item.genders) 
        ? item.genders.map((g: any) => g?.Geander_Name || '').filter(Boolean)
        : [],
      colors: modelColors.length > 0 
        ? modelColors 
        : (item.colors && Array.isArray(item.colors) 
            ? item.colors.map((c: any) => c?.Name || '').filter(Boolean)
            : []),
    };
  }, []);

  // Функция группировки продуктов по брендам
  const groupByBrand = useCallback((productsList: Product[]): BrandWithProducts[] => {
    const brandMap = new Map<string, BrandWithProducts>();
    
    productsList.forEach(product => {
      if (!brandMap.has(product.brandSlug)) {
        brandMap.set(product.brandSlug, {
          name: product.brandName,
          slug: product.brandSlug,
          products: []
        });
      }
      
      brandMap.get(product.brandSlug)?.products.push(product);
    });
    
    return Array.from(brandMap.values());
  }, []);

  // Функция загрузки всех продуктов
  const fetchAllProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await fetchProducts();
      
      if (!data || !Array.isArray(data)) {
        throw new Error('API response has invalid format');
      }
      
      // Форматируем продукты
      const formattedProducts = await Promise.all(data.map(async (item) => {
        const models = await fetchModels(item.slug);
        return await formatProduct(item, models);
      }));
      
      setProducts(formattedProducts);
      
      // Группируем продукты по брендам
      const brandsWithProducts = groupByBrand(formattedProducts);
      setBrandProducts(brandsWithProducts);
      
    } catch (err: any) {
      console.error('Error loading products:', err);
      setError('Failed to load products. Please check your connection.');
      setProducts([]);
      setBrandProducts([]);
    } finally {
      setLoading(false);
    }
  }, [formatProduct, groupByBrand]);

  // Загрузка продуктов при монтировании компонента
  useEffect(() => {
    fetchAllProducts();
  }, [fetchAllProducts]);

  // Функция фильтрации продуктов по категории
  const filterProductsByCategory = useCallback((categoryName: string): BrandWithProducts[] => {
    if (!categoryName || categoryName === 'All') {
      return brandProducts;
    }
    
    return brandProducts
      .map(brand => {
        const filteredProducts = brand.products.filter(product => 
          product.categoryNames.some(cat => 
            cat.toLowerCase() === categoryName.toLowerCase()
          )
        );
        
        return {
          ...brand,
          products: filteredProducts
        };
      })
      .filter(brand => brand.products.length > 0);
  }, [brandProducts]);

  // Функция поиска продуктов
  const searchProducts = useCallback((query: string, filters?: any): Product[] => {
    if (!query || query.length < 2) {
      return [];
    }
    
    // Разбиваем поисковый запрос на слова
    const searchTerms = query.toLowerCase().split(/\s+/).filter(term => term.length > 0);
    
    // Фильтруем продукты
    let results = products.filter(product => 
      searchTerms.some(term => 
        product.Name.toLowerCase().includes(term) ||
        product.brandName.toLowerCase().includes(term) ||
        product.Description.toLowerCase().includes(term) ||
        product.categoryNames.some(cat => cat.toLowerCase().includes(term))
      )
    );
    
    // Применяем дополнительные фильтры
    if (filters) {
      if (filters.brands && filters.brands.length > 0) {
        results = results.filter(product => filters.brands.includes(product.brandSlug));
      }
      
      if (filters.minPrice !== undefined && !isNaN(filters.minPrice)) {
        results = results.filter(product => product.Price >= filters.minPrice);
      }
      
      if (filters.maxPrice !== undefined && !isNaN(filters.maxPrice)) {
        results = results.filter(product => product.Price <= filters.maxPrice);
      }
      
      // Другие фильтры...
    }
    
    return results;
  }, [products]);

  // Возвращаем все необходимые функции и состояния
  return {
    products,
    brandProducts,
    loading,
    error,
    refreshProducts: fetchAllProducts,
    filterProductsByCategory,
    searchProducts
  };
};

export default useProducts;