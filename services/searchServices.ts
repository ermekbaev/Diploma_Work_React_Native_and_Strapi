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

export const searchProducts = async (query: string, filters?: any) => {
  try {
    // Получаем все товары
    const allProducts = await fetchProducts();
    
    if (!allProducts || !Array.isArray(allProducts)) {
      return [];
    }
    
    // Форматируем продукты
    const formattedProducts = await Promise.all(allProducts.map(async (item) => {
      const models = await fetchModels(item.slug);
      return formatApiProduct(item, models);
    }));
    
    // Более интеллектуальный поиск
    const searchTerms = query.toLowerCase().trim().split(/\s+/);
    
    // Функция для определения релевантности результата
    const calculateRelevance = (product: any) => {
      let score = 0;
      
      // Проверяем каждое слово запроса
      for (const term of searchTerms) {
        // Проверяем название (наивысший приоритет)
        if (product.Name.toLowerCase().includes(term)) {
          score += 10;
          
          // Еще больше очков за точное совпадение слова
          if (product.Name.toLowerCase().split(/\s+/).includes(term)) {
            score += 5;
          }
        }
        
        // Проверяем бренд (средний приоритет)
        if (product.brandName.toLowerCase().includes(term)) {
          score += 5;
        }
      }
      
      return score;
    };
    
    // Фильтруем продукты, оставляя только те, у которых ненулевая релевантность
    const relevantProducts = formattedProducts
      .map(product => ({
        product,
        relevance: calculateRelevance(product)
      }))
      .filter(item => item.relevance > 0)
      .sort((a, b) => b.relevance - a.relevance) // Сортируем по релевантности
      .map(item => item.product);
    
    // Применяем дополнительные фильтры, если они указаны
    let results = relevantProducts;
    if (filters) {
      // Логика фильтрации (ваш существующий код)
    }
    
    return results;
  } catch (error) {
    console.error('Error searching products:', error);
    return [];
  }
};

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