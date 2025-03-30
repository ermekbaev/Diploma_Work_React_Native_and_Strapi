import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getColorBackground } from '@/utils/productHelpers';

export interface FavoriteItem {
  id: string; // уникальный ID формата `${productSlug}-${colorId}`
  productSlug: string;
  name: string;
  price: number;
  imageUrl: string;
  brandName: string; 
  color: {
    id: number;
    name: string;
    colorCode?: string;
  };
}

/**
 * Хук для работы с избранными товарами
 */
const useFavorites = () => {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Загрузка списка избранных товаров при первом рендере
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const storedFavorites = await AsyncStorage.getItem('favorites');
        
        if (storedFavorites) {
          setFavorites(JSON.parse(storedFavorites));
        }
      } catch (err: any) {
        console.error('Ошибка загрузки избранного:', err);
        setError('Не удалось загрузить избранное');
      } finally {
        setLoading(false);
      }
    };
    
    loadFavorites();
  }, []);

  // Сохранение списка избранных товаров при изменении
  useEffect(() => {
    const saveFavorites = async () => {
      try {
        await AsyncStorage.setItem('favorites', JSON.stringify(favorites));
      } catch (err) {
        console.error('Ошибка сохранения избранного:', err);
      }
    };
    
    if (!loading) {
      saveFavorites();
    }
  }, [favorites, loading]);

  // Добавление товара в избранное
  const addToFavorites = useCallback((product: {
    slug: string;
    Name: string;
    Price: number;
    imageUrl: string;
    brandName: string;
  }, color: {
    id: number;
    name: string;
    colorCode?: string;
  }) => {
    setFavorites(prevFavorites => {
      // Создаем уникальный идентификатор
      const itemId = `${product.slug}-${color.id}`;
      
      // Проверяем, есть ли уже такой товар в избранном
      const existingItemIndex = prevFavorites.findIndex(item => item.id === itemId);
      
      if (existingItemIndex !== -1) {
        // Если товар уже есть, не добавляем его повторно
        return prevFavorites;
      } else {
        // Если товара нет, добавляем новый
        return [...prevFavorites, {
          id: itemId,
          productSlug: product.slug,
          name: product.Name,
          price: product.Price,
          imageUrl: product.imageUrl,
          brandName: product.brandName,
          color: {
            id: color.id,
            name: color.name,
            colorCode: color.colorCode
          }
        }];
      }
    });
  }, []);

  // Удаление товара из избранного
  const removeFromFavorites = useCallback((itemId: string) => {
    setFavorites(prevFavorites => prevFavorites.filter(item => item.id !== itemId));
  }, []);

  // Проверка, находится ли товар в избранном
  const isInFavorites = useCallback((productSlug: string, colorId: number) => {
    const itemId = `${productSlug}-${colorId}`;
    return favorites.some(item => item.id === itemId);
  }, [favorites]);

  // Очистка всего списка избранного
  const clearFavorites = useCallback(async () => {
    try {
      // Сначала обновляем состояние в приложении
      setFavorites([]);
      
      // Затем сразу же обновляем AsyncStorage
      await AsyncStorage.removeItem('favorites');
      // ИЛИ установить пустой массив
      // await AsyncStorage.setItem('favorites', JSON.stringify([]));
      
      console.log('Весь список избранного успешно очищен');
    } catch (error) {
      console.error('Ошибка при очистке избранного:', error);
      // Если возникла ошибка, попробуем еще раз
      try {
        await AsyncStorage.setItem('favorites', '[]');
      } catch (e) {
        console.error('Повторная попытка очистки избранного не удалась:', e);
      }
    }
  }, []);

  // Возвращаем все необходимые функции и состояния
  return {
    favorites,
    loading,
    error,
    addToFavorites,
    removeFromFavorites,
    isInFavorites,
    clearFavorites
  };
};

export default useFavorites;