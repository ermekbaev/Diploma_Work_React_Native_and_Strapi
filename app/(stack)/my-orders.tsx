import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppTheme } from '@/hooks/useAppTheme';

// Типы данных
interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  price: number;
  imageUrl: string;
  color: string;
  size: string;
}

interface Order {
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

// Статусы заказов с локализацией
const ORDER_STATUSES = {
  pending: { label: 'Ожидает подтверждения', color: '#FF9500', icon: 'time-outline' },
  confirmed: { label: 'Подтвержден', color: '#007AFF', icon: 'checkmark-circle-outline' },
  processing: { label: 'Готовится к отправке', color: '#007AFF', icon: 'cube-outline' },
  shipped: { label: 'Отправлен', color: '#FF9500', icon: 'car-outline' },
  delivered: { label: 'Доставлен', color: '#34C759', icon: 'checkmark-circle' },
  cancelled: { label: 'Отменен', color: '#FF3B30', icon: 'close-circle-outline' }
};

export default function MyOrdersScreen() {
  const router = useRouter();
  const { theme, colors } = useAppTheme();
  const isDark = theme === 'dark';
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'active' | 'completed'>('all');

  // Загрузка заказов
  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      
      // Пытаемся загрузить реальные заказы из AsyncStorage
      const storedOrders = await AsyncStorage.getItem('orders');
      
      if (storedOrders) {
        setOrders(JSON.parse(storedOrders));
      } else {
        // Если заказов нет, создаем демо-данные
        const demoOrders = await generateDemoOrders();
        setOrders(demoOrders);
        // Сохраняем демо-данные для консистентности
        await AsyncStorage.setItem('orders', JSON.stringify(demoOrders));
      }
    } catch (error) {
      console.error('Error loading orders:', error);
      // В случае ошибки создаем пустой список
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Генерация демо-заказов
  const generateDemoOrders = async (): Promise<Order[]> => {
    const demoProducts = [
      { name: 'Nike Air Max 270', imageUrl: 'https://static.nike.com/a/images/c_limit,w_400,f_auto/t_product_v1/19c2a6f0-acb4-41b9-9c46-8b61c067fb1e/air-jordan-1-mid-shoes-BpARGf.png' },
      { name: 'Adidas Ultraboost 22', imageUrl: 'https://assets.adidas.com/images/w_600,f_auto,q_auto/68ae7ea7849b43eca70aac1e00f5146d_9366/Stan_Smith_Shoes_White_FX5502_01_standard.jpg' },
      { name: 'Puma RS-X', imageUrl: 'https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa,w_450,h_450/global/374915/01/sv01/fnd/IND/fmt/png' }
    ];

    return [
      {
        id: '1',
        orderNumber: '#789123',
        status: 'delivered',
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        items: [
          {
            id: '1',
            productName: demoProducts[0].name,
            quantity: 1,
            price: 12999,
            imageUrl: demoProducts[0].imageUrl,
            color: 'Черный',
            size: '42'
          }
        ],
        totalAmount: 12999,
        deliveryAddress: 'Бишкек, ул. Чуй 123',
        paymentMethod: 'Банковская карта',
        trackingNumber: 'TRK789123456'
      },
      {
        id: '2',
        orderNumber: '#789124',
        status: 'shipped',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        items: [
          {
            id: '2',
            productName: demoProducts[1].name,
            quantity: 1,
            price: 15999,
            imageUrl: demoProducts[1].imageUrl,
            color: 'Белый',
            size: '41'
          },
          {
            id: '3',
            productName: demoProducts[2].name,
            quantity: 1,
            price: 8999,
            imageUrl: demoProducts[2].imageUrl,
            color: 'Синий',
            size: '43'
          }
        ],
        totalAmount: 24998,
        deliveryAddress: 'Бишкек, ул. Советская 45',
        paymentMethod: 'Наличными при получении',
        estimatedDelivery: 'Завтра',
        trackingNumber: 'TRK789124567'
      },
      {
        id: '3',
        orderNumber: '#789125',
        status: 'confirmed',
        date: new Date().toISOString(),
        items: [
          {
            id: '4',
            productName: demoProducts[0].name,
            quantity: 2,
            price: 12999,
            imageUrl: demoProducts[0].imageUrl,
            color: 'Красный',
            size: '40'
          }
        ],
        totalAmount: 25998,
        deliveryAddress: 'Бишкек, ул. Московская 78',
        paymentMethod: 'Банковская карта',
        estimatedDelivery: '2-3 дня'
      }
    ];
  };

  // Обновление заказов
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  }, [loadOrders]);

  // Первоначальная загрузка
  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // Фильтрация заказов
  const getFilteredOrders = () => {
    switch (selectedFilter) {
      case 'active':
        return orders.filter(order => 
          ['pending', 'confirmed', 'processing', 'shipped'].includes(order.status)
        );
      case 'completed':
        return orders.filter(order => 
          ['delivered', 'cancelled'].includes(order.status)
        );
      default:
        return orders;
    }
  };

  // Обработчики действий
  const handleOrderPress = (order: Order) => {
    router.push({
      pathname: '/(stack)/order-details',
      params: { orderId: order.id }
    });
  };

  const handleTrackOrder = (order: Order) => {
    if (order.trackingNumber) {
      Alert.alert(
        'Отслеживание заказа',
        `Номер для отслеживания: ${order.trackingNumber}\n\nСтатус: ${ORDER_STATUSES[order.status].label}`,
        [{ text: 'OK' }]
      );
    } else {
      Alert.alert(
        'Отслеживание недоступно',
        'Номер для отслеживания будет предоставлен после отправки заказа.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleReorder = (order: Order) => {
    Alert.alert(
      'Повторить заказ',
      'Добавить товары из этого заказа в корзину?',
      [
        { text: 'Отмена', style: 'cancel' },
        { 
          text: 'Добавить', 
          onPress: () => {
            // Здесь можно добавить логику добавления товаров в корзину
            Alert.alert('Успешно', 'Товары добавлены в корзину!');
          }
        }
      ]
    );
  };

  // Рендер элемента заказа
  const renderOrderItem = ({ item: order }: { item: Order }) => {
    const statusInfo = ORDER_STATUSES[order.status];
    const orderDate = new Date(order.date).toLocaleDateString('ru-RU');
    const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);

    return (
      <TouchableOpacity 
        style={[styles.orderCard, { backgroundColor: colors.card }]}
        onPress={() => handleOrderPress(order)}
      >
        {/* Заголовок заказа */}
        <View style={styles.orderHeader}>
          <View>
            <Text style={[styles.orderNumber, { color: colors.text }]}>
              Заказ {order.orderNumber}
            </Text>
            <Text style={[styles.orderDate, { color: colors.placeholder }]}>
              {orderDate}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: `${statusInfo.color}20` }]}>
            <Ionicons name={statusInfo.icon as any} size={16} color={statusInfo.color} />
            <Text style={[styles.statusText, { color: statusInfo.color }]}>
              {statusInfo.label}
            </Text>
          </View>
        </View>

        {/* Товары в заказе */}
        <View style={styles.orderItems}>
          <Text style={[styles.itemsText, { color: colors.placeholder }]}>
            {totalItems} {totalItems === 1 ? 'товар' : 'товара'} на сумму {order.totalAmount} сом
          </Text>
          {order.estimatedDelivery && (
            <Text style={[styles.deliveryText, { color: colors.placeholder }]}>
              Доставка: {order.estimatedDelivery}
            </Text>
          )}
        </View>

        {/* Действия */}
        <View style={styles.orderActions}>
          {order.trackingNumber && (
            <TouchableOpacity 
              style={[styles.actionButton, { borderColor: colors.tint }]}
              onPress={() => handleTrackOrder(order)}
            >
              <Text style={[styles.actionButtonText, { color: colors.tint }]}>
                Отследить
              </Text>
            </TouchableOpacity>
          )}
          
          {order.status === 'delivered' && (
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: colors.tint }]}
              onPress={() => handleReorder(order)}
            >
              <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]}>
                Повторить
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // Рендер фильтров
  const renderFilters = () => (
    <View style={styles.filtersContainer}>
      {[
        { key: 'all', label: 'Все' },
        { key: 'active', label: 'Активные' },
        { key: 'completed', label: 'Завершенные' }
      ].map((filter) => (
        <TouchableOpacity
          key={filter.key}
          style={[
            styles.filterButton,
            { 
              backgroundColor: selectedFilter === filter.key ? colors.tint : 'transparent',
              borderColor: colors.border
            }
          ]}
          onPress={() => setSelectedFilter(filter.key as any)}
        >
          <Text style={[
            styles.filterButtonText,
            { 
              color: selectedFilter === filter.key ? '#FFFFFF' : colors.text 
            }
          ]}>
            {filter.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const filteredOrders = getFilteredOrders();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Заголовок */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={colors.icon} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Мои заказы</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Фильтры */}
      {renderFilters()}

      {/* Список заказов */}
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.tint} />
          <Text style={[styles.loaderText, { color: colors.placeholder }]}>
            Загрузка заказов...
          </Text>
        </View>
      ) : filteredOrders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="receipt-outline" size={64} color={colors.placeholder} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            {selectedFilter === 'all' ? 'У вас пока нет заказов' : 'Заказы не найдены'}
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.placeholder }]}>
            {selectedFilter === 'all' 
              ? 'Начните делать покупки и ваши заказы появятся здесь'
              : 'Попробуйте изменить фильтр'
            }
          </Text>
          {selectedFilter === 'all' && (
            <TouchableOpacity 
              style={[styles.shopButton, { backgroundColor: colors.tint }]}
              onPress={() => router.replace('/(tabs)')}
            >
              <Text style={styles.shopButtonText}>Начать покупки</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item.id}
          renderItem={renderOrderItem}
          contentContainerStyle={styles.ordersList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.tint]}
              tintColor={colors.tint}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  ordersList: {
    padding: 16,
  },
  orderCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  orderDate: {
    fontSize: 14,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  orderItems: {
    marginBottom: 12,
  },
  itemsText: {
    fontSize: 14,
    marginBottom: 2,
  },
  deliveryText: {
    fontSize: 14,
  },
  orderActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    marginTop: 12,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  shopButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  shopButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});