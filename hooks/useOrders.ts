import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Типы для заказов
export interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  price: number;
  imageUrl: string;
  color: string;
  size: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  date: string;
  items: OrderItem[];
  totalAmount: number;
  deliveryAddress: string;
  paymentMethod: string;
  estimatedDelivery?: string;
  trackingNumber?: string;
}

/**
 * Хук для управления заказами
 */
const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Загрузка заказов из AsyncStorage
  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const storedOrders = await AsyncStorage.getItem('orders');
      
      if (storedOrders) {
        const parsedOrders = JSON.parse(storedOrders);
        setOrders(parsedOrders);
      } else {
        setOrders([]);
      }
    } catch (err: any) {
      console.error('Error loading orders:', err);
      setError('Не удалось загрузить заказы');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Сохранение заказов в AsyncStorage
  const saveOrders = useCallback(async (ordersToSave: Order[]) => {
    try {
      await AsyncStorage.setItem('orders', JSON.stringify(ordersToSave));
    } catch (err) {
      console.error('Error saving orders:', err);
    }
  }, []);

  // Добавление нового заказа
  const addOrder = useCallback(async (orderData: {
    orderNumber: string;
    items: OrderItem[];
    totalAmount: number;
    deliveryAddress: string;
    paymentMethod: string;
    estimatedDelivery?: string;
  }) => {
    try {
      const newOrder: Order = {
        id: Date.now().toString(),
        status: 'pending',
        date: new Date().toISOString(),
        trackingNumber: `TRK${Date.now().toString().slice(-9)}`,
        ...orderData
      };

      const updatedOrders = [newOrder, ...orders];
      setOrders(updatedOrders);
      await saveOrders(updatedOrders);
      
      return newOrder;
    } catch (error) {
      console.error('Error adding order:', error);
      throw new Error('Не удалось создать заказ');
    }
  }, [orders, saveOrders]);

  // Обновление статуса заказа
  const updateOrderStatus = useCallback(async (orderId: string, newStatus: Order['status']) => {
    try {
      const updatedOrders = orders.map(order =>
        order.id === orderId 
          ? { ...order, status: newStatus }
          : order
      );
      
      setOrders(updatedOrders);
      await saveOrders(updatedOrders);
      
      return true;
    } catch (error) {
      console.error('Error updating order status:', error);
      return false;
    }
  }, [orders, saveOrders]);

  // Получение заказа по ID
  const getOrderById = useCallback((orderId: string) => {
    return orders.find(order => order.id === orderId);
  }, [orders]);

  // Фильтрация заказов по статусу
  const getOrdersByStatus = useCallback((status: Order['status']) => {
    return orders.filter(order => order.status === status);
  }, [orders]);

  // Получение активных заказов
  const getActiveOrders = useCallback(() => {
    return orders.filter(order => 
      ['pending', 'confirmed', 'processing', 'shipped'].includes(order.status)
    );
  }, [orders]);

  // Получение завершенных заказов
  const getCompletedOrders = useCallback(() => {
    return orders.filter(order => 
      ['delivered', 'cancelled'].includes(order.status)
    );
  }, [orders]);

  // Статистика заказов
  const getOrdersStats = useCallback(() => {
    const totalOrders = orders.length;
    const activeOrders = getActiveOrders().length;
    const completedOrders = getCompletedOrders().length;
    const totalSpent = orders
      .filter(order => order.status === 'delivered')
      .reduce((sum, order) => sum + order.totalAmount, 0);

    return {
      totalOrders,
      activeOrders,
      completedOrders,
      totalSpent
    };
  }, [orders, getActiveOrders, getCompletedOrders]);

  // Симуляция изменения статуса заказа (для демо)
  const simulateOrderProgress = useCallback(async (orderId: string) => {
    const order = getOrderById(orderId);
    if (!order) return false;

    const statusFlow: Order['status'][] = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
    const currentIndex = statusFlow.indexOf(order.status);
    
    if (currentIndex >= 0 && currentIndex < statusFlow.length - 1) {
      const nextStatus = statusFlow[currentIndex + 1];
      return await updateOrderStatus(orderId, nextStatus);
    }
    
    return false;
  }, [getOrderById, updateOrderStatus]);

  // Функция для удаления дублированных заказов
    const removeDuplicateOrders = useCallback(async () => {
    const uniqueOrders = orders.reduce((acc, order) => {
        const existing = acc.find(o => o.orderNumber === order.orderNumber);
        if (!existing) {
        acc.push(order);
        }
        return acc;
    }, [] as Order[]);
    
    if (uniqueOrders.length !== orders.length) {
        setOrders(uniqueOrders);
        await saveOrders(uniqueOrders);
        console.log(`Removed ${orders.length - uniqueOrders.length} duplicate orders`);
    }
    }, [orders, saveOrders]);

  // Первоначальная загрузка
  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  return {
    orders,
    loading,
    error,
    loadOrders,
    addOrder,
    updateOrderStatus,
    getOrderById,
    getOrdersByStatus,
    getActiveOrders,
    getCompletedOrders,
    getOrdersStats,
    simulateOrderProgress,
    removeDuplicateOrders
  };
};

export default useOrders;