import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useNavigation } from 'expo-router';

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
    removeFromCart,
    updateQuantity,
    calculateSummary,
    clearCart
  } = useCart();

  // Расчет итогов корзины
  const cartSummary = calculateSummary();

  // Обработчик перехода к оформлению заказа
  const handleCheckout = () => {
    // В будущем здесь будет переход на экран оформления заказа
    alert('Переход к оформлению заказа');
  };

  // Обработчик продолжения покупок
  const handleContinueShopping = () => {
    // Используем прямую навигацию на главный экран
    // @ts-ignore
    navigation.navigate('index');
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
          <TouchableOpacity 
            style={styles.continueShopping}
            onPress={handleContinueShopping}
          >
            <Text style={styles.continueShoppingText}>Продолжить покупки</Text>
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
          <TouchableOpacity onPress={clearCart}>
            <Text style={styles.clearCartText}>Очистить</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <ScrollView style={styles.scrollView}>
        {/* Товары в корзине */}
        <View style={styles.cartItemsContainer}>
          {cartItems.map((item) => (
            <CartItem 
              key={item.id}
              item={item}
              onRemove={removeFromCart}
              onQuantityChange={updateQuantity}
              onPress={(slug) => {
                // @ts-ignore
                navigation.navigate('promo', { slug });
              }}
            />
          ))}
        </View>
        
        {/* Итоги корзины */}
        <CartSummary 
          subtotal={cartSummary.subtotal}
          shipping={cartSummary.shipping}
          total={cartSummary.total}
        />
        
        {/* Отступ для обеспечения видимости контента над кнопкой оформления заказа */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
      
      {/* Кнопка оформления заказа */}
      <View style={styles.checkoutButtonContainer}>
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
    color: '#666666',
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