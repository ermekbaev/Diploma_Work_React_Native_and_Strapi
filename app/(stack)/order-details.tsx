import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Image,
  Alert
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/useAppTheme';
import useOrders, { Order } from '@/hooks/useOrders';

// Статусы заказов с локализацией
const ORDER_STATUSES = {
  pending: { label: 'Ожидает подтверждения', color: '#FF9500', icon: 'time-outline' },
  confirmed: { label: 'Подтвержден', color: '#007AFF', icon: 'checkmark-circle-outline' },
  processing: { label: 'Готовится к отправке', color: '#007AFF', icon: 'cube-outline' },
  shipped: { label: 'Отправлен', color: '#FF9500', icon: 'car-outline' },
  delivered: { label: 'Доставлен', color: '#34C759', icon: 'checkmark-circle' },
  cancelled: { label: 'Отменен', color: '#FF3B30', icon: 'close-circle-outline' }
};

export default function OrderDetailsScreen() {
  const router = useRouter();
  const { orderId } = useLocalSearchParams();
  const { theme, colors } = useAppTheme();
  const { getOrderById, simulateOrderProgress } = useOrders();
  const isDark = theme === 'dark';
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      const foundOrder = getOrderById(orderId as string);
      setOrder(foundOrder || null);
    }
    setLoading(false);
  }, [orderId, getOrderById]);

  const handleTrackOrder = () => {
    if (order?.trackingNumber) {
      Alert.alert(
        'Отслеживание заказа',
        `Номер для отслеживания: ${order.trackingNumber}\n\nСтатус: ${ORDER_STATUSES[order.status].label}`,
        [{ text: 'OK' }]
      );
    }
  };

  const handleSimulateProgress = async () => {
    if (order) {
      const success = await simulateOrderProgress(order.id);
      if (success) {
        const updatedOrder = getOrderById(order.id);
        setOrder(updatedOrder || null);
        Alert.alert('Статус обновлен', 'Статус заказа был изменен (демонстрация)');
      }
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.tint} />
        </View>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color={colors.icon} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Детали заказа</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.text }]}>Заказ не найден</Text>
        </View>
      </SafeAreaView>
    );
  }

  const statusInfo = ORDER_STATUSES[order.status];
  const orderDate = new Date(order.date).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Заголовок */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={colors.icon} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Заказ {order.orderNumber}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Статус заказа */}
        <View style={[styles.statusCard, { backgroundColor: colors.card }]}>
          <View style={styles.statusHeader}>
            <View style={[styles.statusIcon, { backgroundColor: `${statusInfo.color}20` }]}>
              <Ionicons name={statusInfo.icon as any} size={32} color={statusInfo.color} />
            </View>
            <View style={styles.statusInfo}>
              <Text style={[styles.statusTitle, { color: colors.text }]}>{statusInfo.label}</Text>
              <Text style={[styles.statusDate, { color: colors.placeholder }]}>{orderDate}</Text>
            </View>
          </View>
          
          {order.estimatedDelivery && (
            <View style={[styles.deliveryInfo, { backgroundColor: colors.background }]}>
              <Ionicons name="time-outline" size={20} color={colors.placeholder} />
              <Text style={[styles.deliveryText, { color: colors.placeholder }]}>
                Ожидаемая доставка: {order.estimatedDelivery}
              </Text>
            </View>
          )}
        </View>

        {/* Товары в заказе */}
        <View style={[styles.itemsCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Товары в заказе</Text>
          
          {order.items.map((item) => (
            <View key={item.id} style={[styles.orderItem, { borderBottomColor: colors.border }]}>
              <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
              <View style={styles.itemDetails}>
                <Text style={[styles.itemName, { color: colors.text }]}>{item.productName}</Text>
                <Text style={[styles.itemSpecs, { color: colors.placeholder }]}>
                  Цвет: {item.color} • Размер: {item.size}
                </Text>
                <View style={styles.itemPricing}>
                  <Text style={[styles.itemQuantity, { color: colors.placeholder }]}>
                    Количество: {item.quantity}
                  </Text>
                  <Text style={[styles.itemPrice, { color: colors.text }]}>
                    {item.price} сом
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Детали доставки */}
        <View style={[styles.deliveryCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Доставка</Text>
          
          <View style={styles.deliveryDetail}>
            <Ionicons name="location-outline" size={20} color={colors.tint} />
            <View style={styles.deliveryDetailText}>
              <Text style={[styles.deliveryLabel, { color: colors.placeholder }]}>Адрес доставки</Text>
              <Text style={[styles.deliveryValue, { color: colors.text }]}>{order.deliveryAddress}</Text>
            </View>
          </View>

          <View style={styles.deliveryDetail}>
            <Ionicons name="card-outline" size={20} color={colors.tint} />
            <View style={styles.deliveryDetailText}>
              <Text style={[styles.deliveryLabel, { color: colors.placeholder }]}>Способ оплаты</Text>
              <Text style={[styles.deliveryValue, { color: colors.text }]}>{order.paymentMethod}</Text>
            </View>
          </View>

          {order.trackingNumber && (
            <View style={styles.deliveryDetail}>
              <Ionicons name="cube-outline" size={20} color={colors.tint} />
              <View style={styles.deliveryDetailText}>
                <Text style={[styles.deliveryLabel, { color: colors.placeholder }]}>Номер отслеживания</Text>
                <Text style={[styles.deliveryValue, { color: colors.text }]}>{order.trackingNumber}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Итого */}
        <View style={[styles.totalCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Итого</Text>
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { color: colors.text }]}>Общая сумма</Text>
            <Text style={[styles.totalAmount, { color: colors.text }]}>{order.totalAmount} сом</Text>
          </View>
        </View>
      </ScrollView>

      {/* Кнопки действий */}
      <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        {order.trackingNumber && (
          <TouchableOpacity 
            style={[styles.trackButton, { borderColor: colors.tint }]}
            onPress={handleTrackOrder}
          >
            <Ionicons name="location" size={20} color={colors.tint} />
            <Text style={[styles.trackButtonText, { color: colors.tint }]}>Отследить</Text>
          </TouchableOpacity>
        )}
        
        {/* Демо кнопка для изменения статуса */}
        {['pending', 'confirmed', 'processing', 'shipped'].includes(order.status) && (
          <TouchableOpacity 
            style={[styles.simulateButton, { backgroundColor: colors.tint }]}
            onPress={handleSimulateProgress}
          >
            <Text style={styles.simulateButtonText}>Обновить статус (демо)</Text>
          </TouchableOpacity>
        )}
      </View>
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
  content: {
    flex: 1,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
  },
  statusCard: {
    margin: 16,
    padding: 20,
    borderRadius: 12,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  statusInfo: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  statusDate: {
    fontSize: 14,
  },
  deliveryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  deliveryText: {
    fontSize: 14,
  },
  itemsCard: {
    margin: 16,
    padding: 20,
    borderRadius: 12,
    marginTop: 0,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  orderItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  itemSpecs: {
    fontSize: 14,
    marginBottom: 8,
  },
  itemPricing: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemQuantity: {
    fontSize: 14,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '600',
  },
  deliveryCard: {
    margin: 16,
    padding: 20,
    borderRadius: 12,
    marginTop: 0,
  },
  deliveryDetail: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  deliveryDetailText: {
    marginLeft: 12,
    flex: 1,
  },
  deliveryLabel: {
    fontSize: 14,
    marginBottom: 2,
  },
  deliveryValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  totalCard: {
    margin: 16,
    padding: 20,
    borderRadius: 12,
    marginTop: 0,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: '700',
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 12,
  },
  trackButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  trackButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  simulateButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  simulateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
});