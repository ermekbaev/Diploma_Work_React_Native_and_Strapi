// services/searchService.ts
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
export const searchProducts = async (query: string, options?: SearchOptions): Promise<Product[]> => {
  try {
    // Получаем все товары (в реальном приложении здесь должен быть API-запрос поиска)
    const products = await fetchProducts();
    
    // Если запрос API не удался, возвращаем пустой массив
    if (!products || !Array.isArray(products)) {
      return [];
    }
    
    // Функция для получения полного URL изображения
        const getFullImageUrl = (relativePath: any) => {
          if (!relativePath) return null;
          
          if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
            return relativePath;
          }
          
          const path = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
          return `${IMG_API}${path}`;
        };

    // Преобразуем данные API в нужный формат
    const formattedProducts = await Promise.all(products.map(async(item: any) => {
      const models = await fetchModels(item.slug);
              
      let imageUrls: string[] = [];
              
      // Проверяем, есть ли у моделей изображения
      if (models && models.length > 0) {
        // Фильтруем модели, соответствующие текущему товару
        const matchingModels = models.filter((model: any) => model.product?.slug === item.slug);
        
        if (matchingModels.length > 0) {
          // Получаем изображения из первой соответствующей модели
          const firstModel = matchingModels[0];
          
          if (firstModel.images && firstModel.images.length > 0) {
            imageUrls = firstModel.images
              .map((image: any) => {
                // Проверяем, имеет ли изображение URL или форматы
                if (image.url) {
                  return getFullImageUrl(image.url);
                } else if (image.formats && image.formats.small && image.formats.small.url) {
                  return getFullImageUrl(image.formats.small.url);
                }
                return null;
              })
              .filter(Boolean) as string[]; // Более простой способ фильтрации null значений
          }
        }
      }
      
      return {
        slug: item.slug || 'no-slug',
        Name: item.Name || 'No name',
        Description: item.Description || '',
        Price: item.Price || 0,
        // Всегда возвращаем строку для imageUrl
        imageUrl: imageUrls.length > 0 ? imageUrls[0] : 'https://placehold.co/150x105/3E4246/FFFFFF?text=No+image',
        imageUrls: imageUrls.length > 0 ? imageUrls : ['https://placehold.co/150x105/3E4246/FFFFFF?text=No+image'],
        brandName: item.brand?.Brand_Name || 'Unknown Brand',
        brandSlug: item.brand?.slug || 'unknown-brand',
        categoryNames: item.category ? [item.category.Name || item.category.NameEngl || ''] : [],
        categoryIds: item.category ? [item.category.id] : [],
        categorySlugs: item.category ? [item.category.slug || ''] : [],
        genders: item.genders && Array.isArray(item.genders) 
          ? item.genders.map((g: any) => g?.Geander_Name || '').filter(Boolean)
          : [],
        colors: item.colors && Array.isArray(item.colors) 
          ? item.colors.map((c: any) => c?.Name || '').filter(Boolean)
          : [],
      };
    }));
    
    // Фильтруем по поисковому запросу
    let filteredProducts = formattedProducts.filter((product: Product) => {
      if (!query) return true; // Если запрос пустой, возвращаем все товары
      
      const searchTerms = query.toLowerCase().split(' ');
      
      // Проверяем по названию
      const nameMatch = searchTerms.every(term => 
        product.Name.toLowerCase().includes(term));
      
      // Проверяем по бренду
      const brandMatch = searchTerms.every(term => 
        product.brandName.toLowerCase().includes(term));
      
      // Проверяем по описанию, если оно есть
      const descriptionMatch = product.Description ? searchTerms.every(term => 
        product.Description.toLowerCase().includes(term)) : false;
      
      return nameMatch || brandMatch || descriptionMatch;
    });
    
    // Применяем дополнительные фильтры, если они указаны
    if (options) {
      if (options.brands && options.brands.length > 0) {
        filteredProducts = filteredProducts.filter(product => 
          options.brands!.includes(product.brandSlug));
      }
      
      if (options.categories && options.categories.length > 0) {
        filteredProducts = filteredProducts.filter(product => 
          product.categorySlugs.some(cat => options.categories!.includes(cat)));
      }
      
      if (options.minPrice !== undefined) {
        filteredProducts = filteredProducts.filter(product => 
          product.Price >= options.minPrice!);
      }
      
      if (options.maxPrice !== undefined) {
        filteredProducts = filteredProducts.filter(product => 
          product.Price <= options.maxPrice!);
      }
      
      if (options.genders && options.genders.length > 0) {
        filteredProducts = filteredProducts.filter(product => 
          product.genders.some((gender:any) => 
            options.genders!.some(g => gender.toLowerCase().includes(g.toLowerCase()))
          )
        );
      }
      
      if (options.colors && options.colors.length > 0) {
        filteredProducts = filteredProducts.filter(product => 
          product.colors.some((color:any) => 
            options.colors!.some(c => color.toLowerCase().includes(c.toLowerCase()))
          )
        );
      }
    }
    
    return filteredProducts;

    
    
  } catch (error) {
    console.error('Error searching products:', error);
    return [];
  }
};