// app/tabs/index.tsx
import { Tabs } from 'expo-router';
import { Image, StyleSheet } from 'react-native';

export default function TabLayout() {
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
            <Image
              source={require('../../assets/images/cart.png')}
              style={styles.icon}
              resizeMode="contain"
            />
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
});
