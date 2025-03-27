export const getPriorityGender = (genders: string[]): string => {
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
  
  
  export const getColorBackground = (color: {Name?: string, colorCode?: string}): string => {
    if (color.colorCode) {
      return color.colorCode;
    }
  
    const COLOR_MAP: Record<string, string> = {
      'White': '#FFFFFF', 'Белый': '#FFFFFF',
      'Black': '#000000', 'Черный': '#000000',
      'Brown': '#8B4513', 'Коричневый': '#8B4513',
      'Gray': '#808080', 'Серый': '#808080',
      'Red': '#FF0000', 'Красный': '#FF0000',
      'Blue': '#0000FF', 'Синий': '#0000FF',
      'Green': '#008000', 'Зеленый': '#008000',
      'Yellow': '#FFFF00', 'Желтый': '#FFFF00',
      'Orange': '#FFA500', 'Оранжевый': '#FFA500',
      'Purple': '#800080', 'Фиолетовый': '#800080',
      'Pink': '#FFC0CB', 'Розовый': '#FFC0CB',
      default: '#CCCCCC'
    };
  
    return COLOR_MAP[color.Name || ''] || COLOR_MAP.default;
  };


  export const formatPrice = (price: number, currency: string = 'RUB'): string => {
    if (typeof price !== 'number') return '0.00';
    
    const CURRENCY_SYMBOLS: Record<string, string> = {
      'RUB': '₽',
      'USD': '$',
      'EUR': '€',
      'GBP': '£'
    };
    
    const symbol = CURRENCY_SYMBOLS[currency] || currency;
    return `${price.toFixed(2)} ${symbol}`;
  };
  

  export const filterProductsByCategory = (products: any[], categoryName: string) => {
    if (!categoryName || categoryName === 'All') {
      return products;
    }
    
    return products.filter(product => {
      // Проверяем соответствие с учетом регистра
      return product.categoryNames && product.categoryNames.some((cat: string) => 
        cat.toLowerCase() === categoryName.toLowerCase()
      );
    });
  };
  

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
  
  export interface BrandWithProducts {
    name: string;
    slug: string;
    products: Product[];
  }
  
  export interface Category {
    id: string;
    slug: string;
    name: string;
    selected?: boolean;
  }