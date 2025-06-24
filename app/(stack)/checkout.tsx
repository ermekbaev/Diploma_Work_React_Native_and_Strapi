import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Alert,
  Switch
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/useAppTheme';
import useCart from '@/hooks/useCart';
import useOrders from '@/hooks/useOrders';

interface DeliveryOption {
  id: string;
  title: string;
  description: string;
  price: number;
  estimatedDays: string;
}

interface PaymentMethod {
  id: string;
  title: string;
  icon: string;
  isAvailable: boolean;
}

export default function CheckoutScreen() {
  const router = useRouter();
  const { theme, colors } = useAppTheme();
  const { cartItems, calculateSummary, clearCart } = useCart();
  const { addOrder } = useOrders();
  const isDark = theme === 'dark';
  
  // Состояния формы
  const [deliveryAddress, setDeliveryAddress] = useState({
    fullName: '',
    phone: '',
    email: '',
    city: 'Бишкек',
    address: '',
    apartment: '',
    postalCode: ''
  });
  
  const [selectedDelivery, setSelectedDelivery] = useState('standard');
  const [selectedPayment, setSelectedPayment] = useState('card');
  const [saveAddress, setSaveAddress] = useState(true);
  const [agreeTerms, setAgreeTerms] = useState(false);
  
  // Варианты доставки
  const deliveryOptions: DeliveryOption[] = [
    {
      id: 'standard',
      title: 'Стандартная доставка',
      description: 'Доставка курьером по городу',
      price: 200,
      estimatedDays: '1-2 дня'
    },
    {
      id: 'express',
      title: 'Экспресс доставка',
      description: 'Быстрая доставка в течение дня',
      price: 500,
      estimatedDays: 'В течение дня'
    },
    {
      id: 'pickup',
      title: 'Самовывоз',
      description: 'Забрать из пункта выдачи',
      price: 0,
      estimatedDays: 'Сегодня'
    }
  ];
  
  // Способы оплаты
  const paymentMethods: PaymentMethod[] = [
    {
      id: 'card',
      title: 'Банковская карта',
      icon: 'card-outline',
      isAvailable: true
    },
    {
      id: 'cash',
      title: 'Наличными при получении',
      icon: 'cash-outline',
      isAvailable: true
    },
    {
      id: 'elsom',
      title: 'Elsom',
      icon: 'phone-portrait-outline',
      isAvailable: false // Заглушка
    },
    {
      id: 'optima',
      title: 'Optima Bank',
      icon: 'card-outline',
      isAvailable: false // Заглушка
    }
  ];
  
  const cartSummary = calculateSummary();
  const selectedDeliveryOption = deliveryOptions.find(option => option.id === selectedDelivery);
  const totalWithDelivery = cartSummary.total + (selectedDeliveryOption?.price || 0);
  
  // Валидация формы
  const isFormValid = () => {
    return (
      deliveryAddress.fullName.trim() !== '' &&
      deliveryAddress.phone.trim() !== '' &&
      deliveryAddress.email.trim() !== '' &&
      deliveryAddress.address.trim() !== '' &&
      agreeTerms
    );
  };
  
  // Обработчик оформления заказа
  const handlePlaceOrder = async () => {
    if (!isFormValid()) {
      Alert.alert('Ошибка', 'Пожалуйста, заполните все обязательные поля и согласитесь с условиями');
      return;
    }
    
    try {
      // Генерируем номер заказа
      const orderNumber = `#${Date.now().toString().slice(-6)}`;
      
      // Создаем товары для заказа из корзины
      const orderItems = cartItems.map(cartItem => ({
        id: cartItem.id,
        productName: cartItem.name,
        quantity: cartItem.quantity,
        price: cartItem.price,
        imageUrl: cartItem.imageUrl,
        color: cartItem.color.name,
        size: cartItem.size.toString()
      }));
      
      // Сохраняем заказ в историю ЗДЕСЬ, а не на странице успеха
      await addOrder({
        orderNumber,
        items: orderItems,
        totalAmount: totalWithDelivery,
        deliveryAddress: `${deliveryAddress.city}, ${deliveryAddress.address}${deliveryAddress.apartment ? `, кв. ${deliveryAddress.apartment}` : ''}`,
        paymentMethod: paymentMethods.find(method => method.id === selectedPayment)?.title || 'Банковская карта',
        estimatedDelivery: selectedDeliveryOption?.estimatedDays || '1-2 дня'
      });
      
      // Очищаем корзину
      await clearCart();
      
      // Переходим на страницу успеха с параметрами заказа (БЕЗ сохранения там)
      router.replace({
        pathname: '/(stack)/order-success',
        params: {
          orderNumber,
          totalAmount: totalWithDelivery,
          estimatedDelivery: selectedDeliveryOption?.estimatedDays || '1-2 дня',
          paymentMethod: paymentMethods.find(method => method.id === selectedPayment)?.title || 'Банковская карта',
          deliveryAddress: `${deliveryAddress.city}, ${deliveryAddress.address}${deliveryAddress.apartment ? `, кв. ${deliveryAddress.apartment}` : ''}`,
          customerEmail: deliveryAddress.email,
          skipSave: 'true' // Флаг, что сохранение уже выполнено
        }
      });
    } catch (error) {
      console.error('Error creating order:', error);
      Alert.alert('Ошибка', 'Не удалось оформить заказ. Попробуйте еще раз.');
    }
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Заголовок */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={colors.icon} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Оформление заказа</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Адрес доставки */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Адрес доставки</Text>
          
          <TextInput
            style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
            placeholder="ФИО получателя *"
            placeholderTextColor={colors.placeholder}
            value={deliveryAddress.fullName}
            onChangeText={(text) => setDeliveryAddress(prev => ({...prev, fullName: text}))}
          />
          
          <TextInput
            style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
            placeholder="Номер телефона *"
            placeholderTextColor={colors.placeholder}
            keyboardType="phone-pad"
            value={deliveryAddress.phone}
            onChangeText={(text) => setDeliveryAddress(prev => ({...prev, phone: text}))}
          />
          
          <TextInput
            style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
            placeholder="Email *"
            placeholderTextColor={colors.placeholder}
            keyboardType="email-address"
            value={deliveryAddress.email}
            onChangeText={(text) => setDeliveryAddress(prev => ({...prev, email: text}))}
          />
          
          <TextInput
            style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
            placeholder="Город"
            placeholderTextColor={colors.placeholder}
            value={deliveryAddress.city}
            onChangeText={(text) => setDeliveryAddress(prev => ({...prev, city: text}))}
          />
          
          <TextInput
            style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
            placeholder="Улица, дом *"
            placeholderTextColor={colors.placeholder}
            value={deliveryAddress.address}
            onChangeText={(text) => setDeliveryAddress(prev => ({...prev, address: text}))}
          />
          
          <TextInput
            style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
            placeholder="Квартира/офис"
            placeholderTextColor={colors.placeholder}
            value={deliveryAddress.apartment}
            onChangeText={(text) => setDeliveryAddress(prev => ({...prev, apartment: text}))}
          />
        </View>
        
        {/* Способ доставки */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Способ доставки</Text>
          
          {deliveryOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionItem,
                { borderColor: colors.border },
                selectedDelivery === option.id && { borderColor: colors.tint, backgroundColor: `${colors.tint}10` }
              ]}
              onPress={() => setSelectedDelivery(option.id)}
            >
              <View style={styles.optionContent}>
                <View style={styles.optionInfo}>
                  <Text style={[styles.optionTitle, { color: colors.text }]}>{option.title}</Text>
                  <Text style={[styles.optionDescription, { color: colors.placeholder }]}>{option.description}</Text>
                  <Text style={[styles.optionEstimate, { color: colors.placeholder }]}>{option.estimatedDays}</Text>
                </View>
                <Text style={[styles.optionPrice, { color: colors.text }]}>
                  {option.price === 0 ? 'Бесплатно' : `${option.price} сом`}
                </Text>
              </View>
              {selectedDelivery === option.id && (
                <Ionicons name="checkmark-circle" size={24} color={colors.tint} />
              )}
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Способ оплаты */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Способ оплаты</Text>
          
          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.optionItem,
                { borderColor: colors.border },
                selectedPayment === method.id && { borderColor: colors.tint, backgroundColor: `${colors.tint}10` },
                !method.isAvailable && { opacity: 0.5 }
              ]}
              onPress={() => method.isAvailable && setSelectedPayment(method.id)}
              disabled={!method.isAvailable}
            >
              <View style={styles.optionContent}>
                <View style={styles.paymentMethodInfo}>
                  <Ionicons name={method.icon as any} size={24} color={colors.icon} />
                  <View style={styles.paymentMethodText}>
                    <Text style={[styles.optionTitle, { color: colors.text }]}>{method.title}</Text>
                    {!method.isAvailable && (
                      <Text style={[styles.comingSoon, { color: colors.placeholder }]}>Скоро будет доступно</Text>
                    )}
                  </View>
                </View>
              </View>
              {selectedPayment === method.id && method.isAvailable && (
                <Ionicons name="checkmark-circle" size={24} color={colors.tint} />
              )}
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Итоги заказа */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Ваш заказ</Text>
          
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.placeholder }]}>Товары ({cartSummary.itemCount})</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>{cartSummary.subtotal} сом</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.placeholder }]}>Доставка</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              {selectedDeliveryOption?.price === 0 ? 'Бесплатно' : `${selectedDeliveryOption?.price} сом`}
            </Text>
          </View>
          
          <View style={[styles.totalRow, { borderTopColor: colors.border }]}>
            <Text style={[styles.totalLabel, { color: colors.text }]}>Итого</Text>
            <Text style={[styles.totalValue, { color: colors.text }]}>{totalWithDelivery} сом</Text>
          </View>
        </View>
        
        {/* Чекбоксы */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <View style={styles.checkboxContainer}>
            <Switch
              value={saveAddress}
              onValueChange={setSaveAddress}
              trackColor={{ false: colors.border, true: colors.tint }}
              thumbColor={saveAddress ? colors.card : colors.placeholder}
            />
            <Text style={[styles.checkboxLabel, { color: colors.text }]}>Сохранить адрес доставки</Text>
          </View>
          
          <View style={styles.checkboxContainer}>
            <Switch
              value={agreeTerms}
              onValueChange={setAgreeTerms}
              trackColor={{ false: colors.border, true: colors.tint }}
              thumbColor={agreeTerms ? colors.card : colors.placeholder}
            />
            <Text style={[styles.checkboxLabel, { color: colors.text }]}>
              Согласен с{' '}
              <Text style={{ color: colors.tint }}>условиями использования</Text>
              {' '}и{' '}
              <Text style={{ color: colors.tint }}>политикой конфиденциальности</Text>
            </Text>
          </View>
        </View>
        
        <View style={styles.bottomSpacer} />
      </ScrollView>
      
      {/* Кнопка оформления заказа */}
      <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[
            styles.placeOrderButton,
            { backgroundColor: isFormValid() ? colors.tint : colors.disabled }
          ]}
          onPress={handlePlaceOrder}
          disabled={!isFormValid()}
        >
          <Text style={styles.placeOrderButtonText}>
            Оформить заказ • {totalWithDelivery} сом
          </Text>
        </TouchableOpacity>
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
  section: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    fontSize: 16,
  },
  optionItem: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionInfo: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    marginBottom: 2,
  },
  optionEstimate: {
    fontSize: 12,
  },
  optionPrice: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  paymentMethodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentMethodText: {
    marginLeft: 12,
    flex: 1,
  },
  comingSoon: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkboxLabel: {
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
  },
  bottomSpacer: {
    height: 100,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  placeOrderButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  placeOrderButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});