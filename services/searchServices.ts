// services/searchService.ts
import { formatApiProduct } from "@/utils/apiHelpers";
import { fetchModels, fetchProducts, IMG_API } from "./api";

export interface Product {
  slug: string;
  Name: string;
  Description: string;
  Price: number;
  imageUrl: string; // Строго строка, без null
  imageUrls: string[];
  brandName: string;
  brandSlug: string;
  categoryNames: string[];
  categoryIds: string[];
  categorySlugs: string[];
  genders: string[];
  colors: string[];
}

interface SearchOptions {
  brands?: string[];
  categories?: string[];
  minPrice?: number;
  maxPrice?: number;
  genders?: string[];
  colors?: string[];
}

// Функция для поиска товаров
export const searchProducts = async (query: string, filters?: any) => {
  try {
    // Получаем все товары
    const allProducts = await fetchProducts();
    
    if (!allProducts || !Array.isArray(allProducts)) {
      return [];
    }
    
    // Форматируем продукты (если это необходимо)
    const formattedProducts = await Promise.all(allProducts.map(async (item) => {
      const models = await fetchModels(item.slug);
      // Ваша функция форматирования продукта
      return formatApiProduct(item, models);
    }));
    
    // Фильтруем продукты по запросу
    const searchLower = query.toLowerCase();
    const filteredProducts = formattedProducts.filter(product => 
      product.Name.toLowerCase().includes(searchLower) ||
      product.brandName.toLowerCase().includes(searchLower) ||
      (product.Description && product.Description.toLowerCase().includes(searchLower))
    );
    
    // Применяем дополнительные фильтры, если они указаны
    let results = filteredProducts;
    if (filters) {
      // Логика фильтрации
    }
    
    return results;
  } catch (error) {
    console.error('Error searching products:', error);
    return [];
  }
};