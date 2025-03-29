// services/searchService.ts
import { formatApiProduct } from "@/utils/apiHelpers";
import { fetchModels, fetchProducts } from "./api";

export interface SearchFilters {
  brands?: string[];
  categories?: string[];
  minPrice?: number;
  maxPrice?: number;
  genders?: string[];
  colors?: string[];
}

export interface Product {
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

// Кэш для хранения полученных продуктов
let productsCache: Product[] = [];
let lastCacheUpdate: number = 0;
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 минут в миллисекундах

/**
 * Поиск товаров с поддержкой фильтров
 */
export const searchProducts = async (query: string, filters?: SearchFilters) => {
  try {
    const currentTime = Date.now();
    let products: Product[];
    
    // Проверяем актуальность кэша
    if (productsCache.length === 0 || (currentTime - lastCacheUpdate) > CACHE_EXPIRY) {
      // Получаем все товары
      const allProducts = await fetchProducts();
      
      if (!allProducts || !Array.isArray(allProducts)) {
        return [];
      }
      
      // Форматируем продукты
      products = await Promise.all(allProducts.map(async (item) => {
        const models = await fetchModels(item.slug);
        return formatApiProduct(item, models);
      }));
      
      // Обновляем кэш
      productsCache = products;
      lastCacheUpdate = currentTime;
    } else {
      // Используем закэшированные данные
      products = productsCache;
    }
    
    // Если запрос пустой, возвращаем пустой массив
    if (!query || query.trim().length < 3) {
      return [];
    }
    
    // Фильтруем продукты по запросу (несколько ключевых слов)
    const searchTerms = query.toLowerCase().trim().split(/\s+/);
    
    let filteredProducts = products.filter(product => {
      return searchTerms.some(term => {
        return (
          product.Name.toLowerCase().includes(term) ||
          product.brandName.toLowerCase().includes(term) ||
          (product.Description && product.Description.toLowerCase().includes(term)) ||
          product.categoryNames.some(category => category.toLowerCase().includes(term))
        );
      });
    });
    
    // Применяем дополнительные фильтры, если они указаны
    if (filters) {
      // Фильтр по брендам
      if (filters.brands && filters.brands.length > 0) {
        filteredProducts = filteredProducts.filter(product => 
          filters.brands?.includes(product.brandSlug)
        );
      }
      
      // Фильтр по категориям
      if (filters.categories && filters.categories.length > 0) {
        filteredProducts = filteredProducts.filter(product => 
          product.categorySlugs.some(slug => filters.categories?.includes(slug))
        );
      }
      
      // Фильтр по ценам
      if (filters.minPrice !== undefined) {
        filteredProducts = filteredProducts.filter(product => 
          product.Price >= (filters.minPrice || 0)
        );
      }
      
      if (filters.maxPrice !== undefined) {
        filteredProducts = filteredProducts.filter(product => 
          product.Price <= (filters.maxPrice || Infinity)
        );
      }
      
      // Фильтр по полу
      if (filters.genders && filters.genders.length > 0) {
        filteredProducts = filteredProducts.filter(product => 
          product.genders.some(gender => 
            filters.genders?.some(g => gender.toLowerCase().includes(g.toLowerCase()))
          )
        );
      }
      
      // Фильтр по цветам
      if (filters.colors && filters.colors.length > 0) {
        filteredProducts = filteredProducts.filter(product => 
          product.colors.some(color => 
            filters.colors?.some(c => color.toLowerCase().includes(c.toLowerCase()))
          )
        );
      }
    }
    
    return filteredProducts;
  } catch (error) {
    console.error('Ошибка при поиске товаров:', error);
    return [];
  }
};

/**
 * Получение всех доступных фильтров
 */
export const getAvailableFilters = async () => {
  try {
    // Если кэш пуст, заполняем его
    if (productsCache.length === 0) {
      await searchProducts("", {});
    }
    
    // Собираем уникальные значения для фильтров
    const brands = new Set<string>();
    const brandNames = new Map<string, string>();
    const categories = new Set<string>();
    const categoryNames = new Map<string, string>();
    const genders = new Set<string>();
    const colors = new Set<string>();
    const prices = { min: Infinity, max: 0 };
    
    productsCache.forEach(product => {
      // Бренды
      if (product.brandSlug) {
        brands.add(product.brandSlug);
        brandNames.set(product.brandSlug, product.brandName);
      }
      
      // Категории
      product.categorySlugs.forEach((slug, index) => {
        categories.add(slug);
        categoryNames.set(slug, product.categoryNames[index] || 'Unnamed');
      });
      
      // Пол
      product.genders.forEach(gender => {
        genders.add(gender);
      });
      
      // Цвета
      product.colors.forEach(color => {
        colors.add(color);
      });
      
      // Цены
      if (product.Price < prices.min) prices.min = product.Price;
      if (product.Price > prices.max) prices.max = product.Price;
    });
    
    return {
      brands: Array.from(brands).map(slug => ({
        slug,
        name: brandNames.get(slug) || slug
      })),
      categories: Array.from(categories).map(slug => ({
        slug,
        name: categoryNames.get(slug) || slug
      })),
      genders: Array.from(genders),
      colors: Array.from(colors),
      priceRange: { min: prices.min, max: prices.max }
    };
    
  } catch (error) {
    console.error('Ошибка при получении фильтров:', error);
    return {
      brands: [],
      categories: [],
      genders: [],
      colors: [],
      priceRange: { min: 0, max: 100000 }
    };
  }
};