import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useNavigation, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Импортируем компоненты и хуки
import CartItem from '@/components/Cart/CartItem';
import CartSummary from '@/components/Cart/CartSummary';
import useCart from '@/hooks/useCart';

const CartScreen = () => {
  const router = useRouter();
  const navigation = useNavigation();
  
  // Получаем данные о корзине из хука
  const {
    cartItems,
    loading,
    error,
    loadCart,
    removeFromCart,
    updateQuantity,
    calculateSummary,
    clearCart
  } = useCart();

  // Обновление корзины при фокусе на экране
  useFocusEffect(
    useCallback(() => {
      // Запустить загрузку данных корзины
      loadCart();
      
      return () => {
        // Код выполняется при потере фокуса (опционально)
      };
    }, []) // Пустой массив зависимостей - функция выполняется только при изменении фокуса
  );

  // Расчет итогов корзины
  const cartSummary = calculateSummary();

  // Обработчик перехода к оформлению заказа
  const handleCheckout = () => {
    // В будущем здесь будет переход на экран оформления заказа
    Alert.alert(
      "Оформление заказа",
      "Функционал оформления заказа находится в разработке",
      [{ text: "OK" }]
    );
  };

  // Обработчик продолжения покупок
  const handleContinueShopping = () => {
    // Используем прямую навигацию на главный экран
    // @ts-ignore
    navigation.navigate('index');
  };

  // Обработчик очистки корзины
  const handleClearCart = () => {
    if (cartItems.length === 0) return;
    
    Alert.alert(
      "Очистка корзины",
      "Вы уверены, что хотите удалить все товары из корзины?",
      [
        {
          text: "Отмена",
          style: "cancel"
        },
        { 
          text: "Очистить", 
          onPress: async () => {
            const success = await clearCart();
            if (!success) {
              Alert.alert(
                "Ошибка",
                "Не удалось очистить корзину. Пожалуйста, попробуйте ещё раз.",
                [{ text: "OK" }]
              );
            }
          },
          style: "destructive"
        }
      ]
    );
  };

  // Если корзина загружается
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Корзина</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000000" />
          <Text style={styles.loadingText}>Загрузка корзины...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Если корзина пуста
  if (cartItems.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Корзина</Text>
        </View>
        
        <View style={styles.emptyCartContainer}>
          <Ionicons name="cart-outline" size={64} color="#CCCCCC" />
          <Text style={styles.emptyCartText}>Ваша корзина пуста</Text>
          <Text style={styles.emptyCartSubtext}>
            Добавьте товары в корзину, чтобы оформить заказ
          </Text>
          <TouchableOpacity 
            style={styles.continueShopping}
            onPress={handleContinueShopping}
          >
            <Text style={styles.continueShoppingText}>Перейти к покупкам</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Заголовок */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Корзина</Text>
        {cartItems.length > 0 && (
          <TouchableOpacity onPress={handleClearCart}>
            <Text style={styles.clearCartText}>Очистить</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <ScrollView style={styles.scrollView}>
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={loadCart}
            >
              <Text style={styles.retryButtonText}>Повторить</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {/* Товары в корзине */}
        <View style={styles.cartItemsContainer}>
          {cartItems.map((item) => (
            <CartItem 
              key={item.id}
              item={item}
              onRemove={removeFromCart}
              onQuantityChange={updateQuantity}
              onPress={(slug:any) => {
                // Переходим на страницу продукта
                router.push(`../promo/${slug}`);
              }}
            />
          ))}
        </View>
        
        {/* Итоги корзины */}
        <CartSummary 
          subtotal={cartSummary.subtotal}
          shipping={cartSummary.shipping}
          total={cartSummary.total}
          itemCount={cartSummary.itemCount}
        />
        
        {/* Условия доставки */}
        <View style={styles.shippingInfoContainer}>
          <Ionicons name="information-circle-outline" size={20} color="#666" />
          <Text style={styles.shippingInfoText}>
            Доставка бесплатна при заказе от 5 000 ₽
          </Text>
        </View>
        
        {/* Отступ для обеспечения видимости контента над кнопкой оформления заказа */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
      
      {/* Кнопка оформления заказа */}
      <View style={styles.checkoutButtonContainer}>
        <View style={styles.checkoutInfo}>
          <Text style={styles.checkoutItemCount}>
            {cartSummary.itemCount} {getPluralForm(cartSummary.itemCount, ['товар', 'товара', 'товаров'])}
          </Text>
          <Text style={styles.checkoutTotal}>{cartSummary.total.toFixed(2)} ₽</Text>
        </View>
        <TouchableOpacity 
          style={styles.checkoutButton}
          onPress={handleCheckout}
        >
          <Text style={styles.checkoutButtonText}>Оформить заказ</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// Вспомогательная функция для получения правильной формы слова в зависимости от числа
const getPluralForm = (count: number, forms: [string, string, string]): string => {
  const cases = [2, 0, 1, 1, 1, 2];
  const index = (count % 100 > 4 && count % 100 < 20) ? 2 : cases[Math.min(count % 10, 5)];
  return forms[index];
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  clearCartText: {
    color: '#FF3B30',
    fontSize: 14,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666666',
    fontSize: 16,
  },
  emptyCartContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyCartText: {
    marginTop: 20,
    fontSize: 18,
    color: '#333333',
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyCartSubtext: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 20,
  },
  continueShopping: {
    backgroundColor: '#000000',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  continueShoppingText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  cartItemsContainer: {
    padding: 15,
  },
  errorContainer: {
    padding: 15,
    backgroundColor: '#FFE8E6',
    margin: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  errorText: {
    color: '#FF3B30',
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  shippingInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#F9F9F9',
    margin: 15,
    borderRadius: 8,
  },
  shippingInfoText: {
    marginLeft: 10,
    color: '#666666',
    fontSize: 14,
  },
  bottomSpacer: {
    height: 80,
  },
  checkoutButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 15,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  checkoutInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  checkoutItemCount: {
    color: '#666666',
    fontSize: 14,
  },
  checkoutTotal: {
    fontWeight: '700',
    fontSize: 16,
  },
  checkoutButton: {
    backgroundColor: '#000',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default CartScreen;