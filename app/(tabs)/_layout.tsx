// app/tabs/_layout.tsx
import { Tabs } from 'expo-router';
import { Image, StyleSheet, View, Text } from 'react-native';
import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Создаем компонент бейджа для иконки корзины
interface CartBadgeIconProps {
  count: number;
}

const CartBadgeIcon = ({ count }: CartBadgeIconProps) => {
  if (count <= 0) {
    return (
      <Image
        source={require('../../assets/images/cart.png')}
        style={styles.icon}
        resizeMode="contain"
      />
    );
  }

  return (
    <View style={styles.badgeIconContainer}>
      <Image
        source={require('../../assets/images/cart.png')}
        style={styles.icon}
        resizeMode="contain"
      />
      <View style={styles.badge}>
        <Text style={styles.badgeText}>
          {count > 99 ? '99+' : count}
        </Text>
      </View>
    </View>
  );
};

export default function TabLayout() {
  // Состояние для хранения количества товаров в корзине
  const [cartItemCount, setCartItemCount] = useState(0);

  // Функция для получения количества товаров из корзины
  const getCartItemCount = useCallback(async () => {
    try {
      const cartData = await AsyncStorage.getItem('cart');
      if (cartData) {
        const cart = JSON.parse(cartData);
        const count = cart.reduce((total: number, item: any) => total + item.quantity, 0);
        setCartItemCount(count);
      } else {
        setCartItemCount(0);
      }
    } catch (error) {
      console.error('Ошибка при получении данных корзины:', error);
      setCartItemCount(0);
    }
  }, []);

  // Слушатель изменений в AsyncStorage
  useEffect(() => {
    getCartItemCount();

    // Устанавливаем интервал для периодической проверки корзины
    const interval = setInterval(getCartItemCount, 2000);
    
    return () => clearInterval(interval);
  }, [getCartItemCount]);

  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false, // Убираем текст с табов
        tabBarStyle: styles.tabBar, // Стили для панели навигации
        headerShown: false
      }}
    >
      <Tabs.Screen
        name="index" // Файл app/tabs/index.tsx отвечает за этот маршрут
        options={{
          headerShown: false, // Убираем верхний хедер
          tabBarIcon: () => (
            <Image
              source={require('../../assets/images/homeIcon.png')}
              style={styles.icon}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="catalog" // Файл app/tabs/catalog.tsx
        options={{
          title: 'Каталог',
          tabBarIcon: () => (
            <Image
              source={require('../../assets/images/catalog.png')}
              style={styles.icon}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="cart" // Файл app/tabs/cart.tsx
        options={{
          title: 'Корзина',
          tabBarIcon: () => (
            <CartBadgeIcon count={cartItemCount} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile" // Файл app/tabs/profile.tsx
        options={{
          title: 'Профиль',
          tabBarIcon: () => (
            <Image
              source={require('../../assets/images/profile.png')}
              style={styles.icon}
              resizeMode="contain"
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 80, // Увеличиваем высоту панели
    paddingBottom: 20, // Добавляем отступ снизу для иконок
    paddingTop: 10, // Отступ сверху, чтобы иконки не были прижаты к верху
    // backgroundColor: '#fff', // Цвет панели (по желанию)
  },
  icon: {
    width: 25, // Ширина иконки
    height: 25, // Высота иконки
  },
  badgeIconContainer: {
    position: 'relative',
    width: 25,
    height: 25,
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -10,
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
});