import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Animated,
  Dimensions
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/useAppTheme';

const { width } = Dimensions.get('window');

interface OrderDetails {
  orderNumber: string;
  totalAmount: number;
  estimatedDelivery: string;
  paymentMethod: string;
  deliveryAddress: string;
  customerEmail: string;
}

export default function OrderSuccessScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { theme, colors } = useAppTheme();
  const isDark = theme === 'dark';
  
  // Анимации
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.3));
  const [slideAnim] = useState(new Animated.Value(50));
  
  // Данные заказа (в реальном приложении приходили бы через params или API)
  const [orderDetails] = useState<OrderDetails>({
    orderNumber: params.orderNumber as string || `#${Date.now().toString().slice(-6)}`,
    totalAmount: Number(params.totalAmount) || 0,
    estimatedDelivery: params.estimatedDelivery as string || '1-2 рабочих дня',
    paymentMethod: params.paymentMethod as string || 'Банковская карта',
    deliveryAddress: params.deliveryAddress as string || 'Бишкек, ул. Чуй 123',
    customerEmail: params.customerEmail as string || 'customer@example.com'
  });
  
  useEffect(() => {
    // Запуск анимаций при загрузке экрана (ускоренные)
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400, // Было 800, теперь 400
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100, // Было 50, теперь 100 (быстрее)
        friction: 8,  // Было 7, теперь 8 (меньше колебаний)
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300, // Было 600, теперь 300
        delay: 100,    // Было 200, теперь 100
        useNativeDriver: true,
      }),
    ]).start();

    // Сохраняем заказ в историю заказов
    const saveOrderToHistory = async () => {
      try {
        // Создаем фиктивные товары для демонстрации
        const demoItems = [
          {
            id: '1',
            productName: 'Nike Air Max 270',
            quantity: 1,
            price: orderDetails.totalAmount,
            imageUrl: 'https://static.nike.com/a/images/c_limit,w_400,f_auto/t_product_v1/19c2a6f0-acb4-41b9-9c46-8b61c067fb1e/air-jordan-1-mid-shoes-BpARGf.png',
            color: 'Черный',
            size: '42'
          }
        ];

        await addOrder({
          orderNumber: orderDetails.orderNumber,
          items: demoItems,
          totalAmount: orderDetails.totalAmount,
          deliveryAddress: orderDetails.deliveryAddress,
          paymentMethod: orderDetails.paymentMethod,
          estimatedDelivery: orderDetails.estimatedDelivery
        });
      } catch (error) {
        console.error('Error saving order to history:', error);
      }
    };

    // Сохраняем заказ только если есть все необходимые данные
    if (orderDetails.orderNumber && orderDetails.totalAmount) {
      saveOrderToHistory();
    }
  }, [fadeAnim, scaleAnim, slideAnim, addOrder, orderDetails]);
  
  const handleContinueShopping = () => {
    router.replace('/(tabs)');
  };
  
  const handleViewOrders = () => {
    // Переход к странице "Мои заказы"
    router.replace('/(stack)/my-orders');
  };
  
  const handleTrackOrder = () => {
    // В реальном приложении здесь был бы переход к отслеживанию заказа
    alert(`Отслеживание заказа ${orderDetails.orderNumber} будет доступно в ближайшее время.`);
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Анимированная иконка успеха */}
        <Animated.View 
          style={[
            styles.successIconContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          <View style={[styles.successCircle, { backgroundColor: colors.success }]}>
            <Ionicons name="checkmark" size={60} color="#FFFFFF" />
          </View>
        </Animated.View>
        
        {/* Заголовок */}
        <Animated.View 
          style={[
            styles.titleContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Text style={[styles.successTitle, { color: colors.text }]}>
            Заказ успешно оформлен!
          </Text>
          <Text style={[styles.successSubtitle, { color: colors.placeholder }]}>
            Спасибо за покупку! Ваш заказ принят в обработку.
          </Text>
        </Animated.View>
        
        {/* Детали заказа */}
        <Animated.View 
          style={[
            styles.orderDetailsCard,
            { 
              backgroundColor: colors.card,
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Text style={[styles.cardTitle, { color: colors.text }]}>Детали заказа</Text>
          
          <View style={styles.orderDetailRow}>
            <View style={styles.detailItem}>
              <Ionicons name="receipt-outline" size={24} color={colors.tint} />
              <View style={styles.detailText}>
                <Text style={[styles.detailLabel, { color: colors.placeholder }]}>Номер заказа</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>{orderDetails.orderNumber}</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.orderDetailRow}>
            <View style={styles.detailItem}>
              <Ionicons name="card-outline" size={24} color={colors.tint} />
              <View style={styles.detailText}>
                <Text style={[styles.detailLabel, { color: colors.placeholder }]}>Сумма заказа</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>{orderDetails.totalAmount} сом</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.orderDetailRow}>
            <View style={styles.detailItem}>
              <Ionicons name="time-outline" size={24} color={colors.tint} />
              <View style={styles.detailText}>
                <Text style={[styles.detailLabel, { color: colors.placeholder }]}>Ожидаемая доставка</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>{orderDetails.estimatedDelivery}</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.orderDetailRow}>
            <View style={styles.detailItem}>
              <Ionicons name="location-outline" size={24} color={colors.tint} />
              <View style={styles.detailText}>
                <Text style={[styles.detailLabel, { color: colors.placeholder }]}>Адрес доставки</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>{orderDetails.deliveryAddress}</Text>
              </View>
            </View>
          </View>
        </Animated.View>
        
        {/* Что дальше? */}
        <Animated.View 
          style={[
            styles.nextStepsCard,
            { 
              backgroundColor: colors.card,
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Text style={[styles.cardTitle, { color: colors.text }]}>Что дальше?</Text>
          
          <View style={styles.stepItem}>
            <View style={[styles.stepNumber, { backgroundColor: colors.tint }]}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <Text style={[styles.stepText, { color: colors.text }]}>
              Мы обработаем ваш заказ и свяжемся с вами для подтверждения
            </Text>
          </View>
          
          <View style={styles.stepItem}>
            <View style={[styles.stepNumber, { backgroundColor: colors.tint }]}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <Text style={[styles.stepText, { color: colors.text }]}>
              Соберем ваш заказ и передадим в службу доставки
            </Text>
          </View>
          
          <View style={styles.stepItem}>
            <View style={[styles.stepNumber, { backgroundColor: colors.tint }]}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <Text style={[styles.stepText, { color: colors.text }]}>
              Курьер доставит заказ по указанному адресу
            </Text>
          </View>
        </Animated.View>
        
        {/* Уведомления */}
        <Animated.View 
          style={[
            styles.notificationCard,
            { 
              backgroundColor: `${colors.info}20`,
              borderColor: colors.info,
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <View style={styles.notificationHeader}>
            <Ionicons name="information-circle" size={24} color={colors.info} />
            <Text style={[styles.notificationTitle, { color: colors.info }]}>Уведомления</Text>
          </View>
          <Text style={[styles.notificationText, { color: colors.text }]}>
            Мы отправили подтверждение заказа на {orderDetails.customerEmail}. 
            Также вы получите SMS-уведомления о статусе заказа.
          </Text>
        </Animated.View>
      </ScrollView>
      
      {/* Кнопки действий */}
      <Animated.View 
        style={[
          styles.footer,
          { 
            backgroundColor: colors.card,
            borderTopColor: colors.border,
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <TouchableOpacity 
          style={[styles.trackButton, { backgroundColor: `${colors.tint}20`, borderColor: colors.tint }]}
          onPress={handleTrackOrder}
        >
          <Ionicons name="location" size={20} color={colors.tint} />
          <Text style={[styles.trackButtonText, { color: colors.tint }]}>Отследить заказ</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.continueButton, { backgroundColor: colors.tint }]}
          onPress={handleContinueShopping}
        >
          <Text style={styles.continueButtonText}>Продолжить покупки</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.ordersButton, { backgroundColor: colors.cardBackground }]}
          onPress={handleViewOrders}
        >
          <Ionicons name="list" size={20} color={colors.text} />
          <Text style={[styles.ordersButtonText, { color: colors.text }]}>Мои заказы</Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
  },
  successIconContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  successCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  orderDetailsCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  nextStepsCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  notificationCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  orderDetailRow: {
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    marginLeft: 16,
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  stepNumberText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  stepText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
    paddingTop: 4,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  notificationText: {
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    gap: 12,
  },
  trackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  trackButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  continueButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  ordersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  ordersButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

function addOrder(arg0: { orderNumber: string; items: { id: string; productName: string; quantity: number; price: number; imageUrl: string; color: string; size: string; }[]; totalAmount: number; deliveryAddress: string; paymentMethod: string; estimatedDelivery: string; }) {
    throw new Error('Function not implemented.');
}
