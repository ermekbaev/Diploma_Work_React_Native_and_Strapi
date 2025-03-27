import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CartItemType } from '@/components/Cart/CartItem';

interface CartSummary {
  subtotal: number;
  shipping: number;
  total: number;
  itemCount: number;
}

/**
 * Хук для работы с корзиной
 */
const useCart = () => {
  const [cartItems, setCartItems] = useState<CartItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Загрузка корзины при первом рендере
  useEffect(() => {
    const loadCart = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const storedCart = await AsyncStorage.getItem('cart');
        
        if (storedCart) {
          setCartItems(JSON.parse(storedCart));
        }
      } catch (err: any) {
        console.error('Error loading cart:', err);
        setError('Failed to load cart');
      } finally {
        setLoading(false);
      }
    };
    
    loadCart();
  }, []);

  // Сохранение корзины при изменении
  useEffect(() => {
    const saveCart = async () => {
      try {
        await AsyncStorage.setItem('cart', JSON.stringify(cartItems));
      } catch (err) {
        console.error('Error saving cart:', err);
      }
    };
    
    if (!loading) {
      saveCart();
    }
  }, [cartItems, loading]);

  // Добавление товара в корзину
  const addToCart = useCallback((product: {
    slug: string;
    Name: string;
    Price: number;
    imageUrl: string;
  }, color: {
    id: number;
    Name: string;
  }, size: number) => {
    setCartItems(prevItems => {
      // Создаем уникальный идентификатор
      const itemId = `${product.slug}-${color.id}-${size}`;
      
      // Проверяем, есть ли уже такой товар в корзине
      const existingItemIndex = prevItems.findIndex(item => item.id === itemId);
      
      if (existingItemIndex !== -1) {
        // Если товар уже есть, увеличиваем количество
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + 1
        };
        
        return updatedItems;
      } else {
        // Если товара нет, добавляем новый
        return [...prevItems, {
          id: itemId,
          productSlug: product.slug,
          name: product.Name,
          price: product.Price,
          quantity: 1,
          color: {
            id: color.id,
            name: color.Name
          },
          size,
          imageUrl: product.imageUrl
        }];
      }
    });
  }, []);

  // Удаление товара из корзины
  const removeFromCart = useCallback((itemId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
  }, []);

  // Изменение количества товара
  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    if (quantity <= 0) {
      // Если количество меньше или равно 0, удаляем товар
      removeFromCart(itemId);
      return;
    }
    
    setCartItems(prevItems => 
      prevItems.map(item => 
        item.id === itemId 
          ? { ...item, quantity } 
          : item
      )
    );
  }, [removeFromCart]);

  // Расчет итогов корзины
  const calculateSummary = useCallback((): CartSummary => {
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = cartItems.length > 0 ? 9.99 : 0;
    const total = subtotal + shipping;
    const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    
    return {
      subtotal,
      shipping,
      total,
      itemCount
    };
  }, [cartItems]);

  // Очистка корзины
  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  // Возвращаем все необходимые функции и состояния
  return {
    cartItems,
    loading,
    error,
    addToCart,
    removeFromCart,
    updateQuantity,
    calculateSummary,
    clearCart
  };
};

export default useCart;