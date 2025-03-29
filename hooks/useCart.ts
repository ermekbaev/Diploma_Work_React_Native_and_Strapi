import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

// Типы для корзины
export interface CartItemType {
  id: string;
  productSlug: string;
  name: string;
  price: number;
  quantity: number;
  color: {
    id: number;
    name: string;
  };
  size: number;
  imageUrl: string;
}

interface CartSummary {
  subtotal: number;
  shipping: number;
  total: number;
  itemCount: number;
}

/**
 * Хук для управления корзиной
 */
const useCart = () => {
  const [cartItems, setCartItems] = useState<CartItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Загрузка корзины при первом рендере
  useEffect(() => {
    const loadCart = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const storedCart = await AsyncStorage.getItem('cart');
        
        if (storedCart) {
          const parsedCart = JSON.parse(storedCart);
          setCartItems(parsedCart);
        }
      } catch (err: any) {
        console.error('Error loading cart:', err);
        setError('Failed to load cart');
      } finally {
        setLoading(false);
        setIsInitialized(true);
      }
    };
    
    loadCart();
  }, []);

  // Предотвращение множественных загрузок
  const [isLoading, setIsLoading] = useState(false);

  // Функция загрузки корзины из AsyncStorage
  const loadCart = useCallback(async () => {
    // Если уже идет загрузка, не запускаем новую
    if (isLoading) return;
    
    try {
      setIsLoading(true);
      setLoading(true);
      setError(null);
      
      const storedCart = await AsyncStorage.getItem('cart');
      
      if (storedCart) {
        setCartItems(JSON.parse(storedCart));
      } else {
        // Если корзина не найдена в хранилище, устанавливаем пустой массив
        setCartItems([]);
      }
      
    } catch (err: any) {
      console.error('Ошибка загрузки корзины:', err);
      setError('Не удалось загрузить корзину');
    } finally {
      setLoading(false);
      setIsLoading(false);
    }
  }, [isLoading]);

  // Сохранение корзины при изменении
  useEffect(() => {
    const saveCart = async () => {
      try {
        await AsyncStorage.setItem('cart', JSON.stringify(cartItems));
      } catch (err) {
        console.error('Error saving cart:', err);
        setError('Failed to save cart');
      }
    };
    
    // Only save after the initial load has completed
    if (isInitialized) {
      saveCart();
    }
  }, [cartItems, isInitialized]);

  // Добавление товара в корзину
  const addToCart = useCallback(async (product: {
    slug: string;
    Name: string;
    Price: number;
    imageUrl: string;
  }, color: {
    id: number;
    Name: string;
  }, size: number) => {
    try {
      setCartItems(prevItems => {
        // Create a unique identifier for this combination of product, color, and size
        const itemId = `${product.slug}-${color.id}-${size}`;
        
        // Check if this item is already in the cart
        const existingItemIndex = prevItems.findIndex(item => item.id === itemId);
        
        if (existingItemIndex !== -1) {
          // If already in cart, increase quantity
          const updatedItems = [...prevItems];
          updatedItems[existingItemIndex] = {
            ...updatedItems[existingItemIndex],
            quantity: updatedItems[existingItemIndex].quantity + 1
          };
          
          return updatedItems;
        } else {
          // If not in cart, add new item
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
      
      // Show confirmation to the user
      Alert.alert('Добавлено в корзину', 'Товар успешно добавлен в корзину!');
      
      return true;
    } catch (error) {
      console.error('Error adding to cart:', error);
      return false;
    }
  }, []);

  // Удаление товара из корзины
  const removeFromCart = useCallback(async (itemId: string) => {
    try {
      // Получаем текущую корзину из AsyncStorage
      const storedCart = await AsyncStorage.getItem('cart');
      if (!storedCart) return;
      
      // Фильтруем элементы корзины
      const currentCart: CartItemType[] = JSON.parse(storedCart);
      const updatedCart = currentCart.filter(item => item.id !== itemId);
      
      // Сохраняем обновленную корзину в AsyncStorage
      await AsyncStorage.setItem('cart', JSON.stringify(updatedCart));
      
      // Обновляем состояние
      setCartItems(updatedCart);
      
      return true;
    } catch (error) {
      console.error('Error removing product from cart:', error);
      return false;
    }
  }, []);

  // Изменение количества товара
  const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
    try {
      if (quantity <= 0) {
        // Если количество меньше или равно 0, удаляем товар
        return await removeFromCart(itemId);
      }
      
      // Получаем текущую корзину из AsyncStorage
      const storedCart = await AsyncStorage.getItem('cart');
      if (!storedCart) return false;
      
      // Обновляем количество товара
      const currentCart: CartItemType[] = JSON.parse(storedCart);
      const updatedCart = currentCart.map(item => 
        item.id === itemId 
          ? { ...item, quantity } 
          : item
      );
      
      // Сохраняем обновленную корзину в AsyncStorage
      await AsyncStorage.setItem('cart', JSON.stringify(updatedCart));
      
      // Обновляем состояние
      setCartItems(updatedCart);
      
      console.log('Product quantity updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating product quantity:', error);
      return false;
    }
  }, [removeFromCart]);

  // Расчет итогов корзины
  const calculateSummary = useCallback((): CartSummary => {
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Настраиваемые правила доставки
    let shipping = 0;
    if (cartItems.length > 0) {
      if (subtotal < 3000) {
        shipping = 299; // Стандартная доставка
      } else if (subtotal < 5000) {
        shipping = 199; // Скидка на доставку
      }
      // Бесплатная доставка при заказе от 5000
    }
    
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
  const clearCart = useCallback(async () => {
    try {
      // Удаляем запись корзины из AsyncStorage
      await AsyncStorage.removeItem('cart');
      
      // Обновляем состояние
      setCartItems([]);
      
      console.log('Cart cleared successfully');
      return true;
    } catch (error) {
      console.error('Error clearing cart:', error);
      return false;
    }
  }, []);

  // Проверка наличия товара в корзине
  const isInCart = useCallback((productSlug: string, colorId: number, size: number) => {
    const itemId = `${productSlug}-${colorId}-${size}`;
    return cartItems.some(item => item.id === itemId);
  }, [cartItems]);

  // Получение количества товара в корзине
  const getItemQuantity = useCallback((productSlug: string, colorId: number, size: number) => {
    const itemId = `${productSlug}-${colorId}-${size}`;
    const item = cartItems.find(item => item.id === itemId);
    return item ? item.quantity : 0;
  }, [cartItems]);

  // Обновить весь массив корзины
  const setCart = useCallback((items: CartItemType[]) => {
    setCartItems(items);
  }, []);

  // Возвращаем все необходимые функции и состояния
  return {
    cartItems,
    loading,
    error,
    loadCart,
    addToCart,
    removeFromCart,
    updateQuantity,
    calculateSummary,
    clearCart,
    isInCart,
    getItemQuantity,
    setCart
  };
};

export default useCart;