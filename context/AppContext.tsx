import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useProducts from '@/hooks/useProducts';
import useCategories from '@/hooks/useCategories';
import useCart from '@/hooks/useCart';

// Определяем интерфейс для контекста
interface AppContextType {
  // Продукты
  products: any[];
  brandProducts: any[];
  productsLoading: boolean;
  productsError: string | null;
  refreshProducts: () => void;
  filterProductsByCategory: (categoryName: string) => any[];
  
  // Категории
  categories: any[];
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
  favorites: any[];
  favoritesLoading: boolean;
  favoritesError: string | null;
  addToFavorites: (product: any, color: any) => void;
  removeFromFavorites: (favoriteId: string) => void;
  getFavorites: () => any[];
  isInFavorites: (productSlug: string, colorId: number) => boolean;
  toggleFavorite: (product: any, color: any) => void;
  
  // Поиск
  searchResults: any[];
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
  
  // Состояние для избранного
  const [favorites, setFavorites] = useState<any[]>([]);
  const [favoritesLoading, setFavoritesLoading] = useState(true);
  const [favoritesError, setFavoritesError] = useState<string | null>(null);
  
  // Загрузка избранного при монтировании
  useEffect(() => {
    loadFavorites();
  }, []);
  
  // Функция загрузки избранного из AsyncStorage
  const loadFavorites = async () => {
    try {
      setFavoritesLoading(true);
      const storedFavorites = await AsyncStorage.getItem('favorites');
      
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      }
      
      setFavoritesError(null);
    } catch (error) {
      console.error('Ошибка при загрузке избранного:', error);
      setFavoritesError('Не удалось загрузить избранное');
    } finally {
      setFavoritesLoading(false);
    }
  };
  
  // Сохранение избранного при изменении
  useEffect(() => {
    const saveFavorites = async () => {
      try {
        await AsyncStorage.setItem('favorites', JSON.stringify(favorites));
      } catch (error) {
        console.error('Ошибка при сохранении избранного:', error);
      }
    };
    
    if (!favoritesLoading) {
      saveFavorites();
    }
  }, [favorites, favoritesLoading]);
  
  // Функция для получения текущего списка избранного
  const getFavorites = () => {
    return favorites;
  };
  
  // Добавление товара в избранное
  const addToFavorites = (product: any, color: any) => {
    const favoriteId = `${product.slug}-${color.id}`;
    
    // Проверяем, есть ли такой товар уже в избранном
    const exists = favorites.some(item => item.id === favoriteId);
    
    if (!exists) {
      const newFavorite = {
        id: favoriteId,
        product,
        color
      };
      
      setFavorites(prev => [...prev, newFavorite]);
    }
  };
  
  // Удаление товара из избранного
  const removeFromFavorites = (favoriteId: string) => {
    setFavorites(prev => prev.filter(item => item.id !== favoriteId));
  };
  
  // Проверка наличия товара в избранном
  const isInFavorites = (productSlug: string, colorId: number): boolean => {
    const favoriteId = `${productSlug}-${colorId}`;
    return favorites.some(item => item.id === favoriteId);
  };
  
  // Переключение статуса избранного
  const toggleFavorite = (product: any, color: any) => {
    const favoriteId = `${product.slug}-${color.id}`;
    
    if (isInFavorites(product.slug, color.id)) {
      removeFromFavorites(favoriteId);
    } else {
      addToFavorites(product, color);
    }
  };
  
  // Для поиска используем более простой подход с состояниями
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  
  // Функция поиска
  const searchProducts = async (query: string, filters?: any) => {
    setSearchLoading(true);
    
    try {
      // Фильтруем существующие продукты
      if (query.length > 0) {
        const results = products.filter(product => {
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
      console.error('Ошибка при поиске:', error);
      setSearchError('Ошибка при поиске товаров');
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
    getFavorites,
    isInFavorites,
    toggleFavorite,
    
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