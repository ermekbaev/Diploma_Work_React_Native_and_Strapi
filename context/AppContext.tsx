import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import useProducts from '@/hooks/useProducts';
import useCategories from '@/hooks/useCategories';
import useCart from '@/hooks/useCart';
import { Product, BrandWithProducts, Category } from '@/utils/productHelpers';
import useFavorites, { FavoriteItem } from '@/hooks/useFavorites';


// Определяем интерфейс для контекста
interface AppContextType {
  // Продукты
  products: Product[];
  brandProducts: BrandWithProducts[];
  productsLoading: boolean;
  productsError: string | null;
  refreshProducts: () => void;
  filterProductsByCategory: (categoryName: string) => BrandWithProducts[];
  
  // Категории
  categories: Category[];
  selectedCategory: string;
  categoriesLoading: boolean;
  categoriesError: string | null;
  selectCategory: (categoryName: string) => void;
  refreshCategories: () => void;
  
  // Корзина
  cartItems: any[];
  cartLoading: boolean;
  cartError: string | null;
  addToCart: (product: any, color: any, size: number) => void;
  removeFromCart: (itemId: string) => void;
  updateCartQuantity: (itemId: string, quantity: number) => void;
  cartSummary: { subtotal: number; shipping: number; total: number; itemCount: number };
  clearCart: () => void;
  
  // Избранное
  favorites: FavoriteItem[];
  favoritesLoading: boolean;
  favoritesError: string | null;
  addToFavorites: (product: any, color: any) => void;
  removeFromFavorites: (itemId: string) => void;
  isInFavorites: (productSlug: string, colorId: number) => boolean;
  clearFavorites: () => void;
  
  // Поиск
  searchResults: Product[];
  searchLoading: boolean;
  searchError: string | null;
  searchProducts: (query: string, filters?: any) => void;
  
  // Общее состояние приложения
  appLoading: boolean;
}

// Создаем контекст
const AppContext = createContext<AppContextType | undefined>(undefined);

// Создаем провайдер контекста
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Используем созданные ранее хуки
  const {
    products,
    brandProducts,
    loading: productsLoading,
    error: productsError,
    refreshProducts,
    filterProductsByCategory
  } = useProducts();
  
  const {
    categories,
    selectedCategory,
    loading: categoriesLoading,
    error: categoriesError,
    selectCategory,
    refreshCategories
  } = useCategories();
  
  const {
    cartItems,
    loading: cartLoading,
    error: cartError,
    addToCart,
    removeFromCart,
    updateQuantity: updateCartQuantity,
    calculateSummary,
    clearCart
  } = useCart();
  
  const {
    favorites,
    loading: favoritesLoading,
    error: favoritesError,
    addToFavorites,
    removeFromFavorites,
    isInFavorites,
    clearFavorites
  } = useFavorites();
  
  // Для поиска используем более простой подход с состояниями
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  
  // Функция поиска
  const searchProducts = async (query: string, filters?: any) => {
    setSearchLoading(true);
    
    try {
      // Фильтруем существующие продукты
      if (query.length > 0) {
        const results = products.filter((product:any) => {
          const searchLower = query.toLowerCase();
          return (
            product.Name.toLowerCase().includes(searchLower) ||
            product.brandName.toLowerCase().includes(searchLower) ||
            product.Description.toLowerCase().includes(searchLower)
          );
        });
        
        setSearchResults(results);
      } else {
        setSearchResults([]);
      }
      
      setSearchError(null);
    } catch (error: any) {
      console.error('Search error:', error);
      setSearchError('Ошибка при поиске');
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };
  
  // Общее состояние загрузки приложения
  const appLoading = productsLoading || categoriesLoading || cartLoading || favoritesLoading;
  
  // Рассчитываем итоги корзины
  const cartSummary = calculateSummary();
  
  // Значение контекста
  const contextValue: AppContextType = {
    // Продукты
    products,
    brandProducts,
    productsLoading,
    productsError,
    refreshProducts,
    filterProductsByCategory,
    
    // Категории
    categories,
    selectedCategory,
    categoriesLoading,
    categoriesError,
    selectCategory,
    refreshCategories,
    
    // Корзина
    cartItems,
    cartLoading,
    cartError,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    cartSummary,
    clearCart,
    
    // Избранное
    favorites,
    favoritesLoading,
    favoritesError,
    addToFavorites,
    removeFromFavorites,
    isInFavorites,
    clearFavorites,
    
    // Поиск
    searchResults,
    searchLoading,
    searchError,
    searchProducts,
    
    // Общее состояние
    appLoading
  };
  
  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

// Хук для использования контекста в компонентах
export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  
  return context;
};