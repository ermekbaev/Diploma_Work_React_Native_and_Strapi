import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { useRouter, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Импортируем компоненты и хуки
import { useAppContext } from '@/context/AppContext';
import FavoriteItem from '@/components/Favorites/FavoriteItem';

export default function FavoritesScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { favorites, favoritesLoading, removeFromFavorites } = useAppContext();
  
  const [localFavorites, setLocalFavorites] = useState(favorites);
  const [isClearing, setIsClearing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Функция для загрузки актуальных данных из AsyncStorage
  const loadFavoritesFromStorage = useCallback(async () => {
    try {
      const storedData = await AsyncStorage.getItem('favorites');
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        setLocalFavorites(parsedData);
        return parsedData;
      }
      setLocalFavorites([]);
      return [];
    } catch (error) {
      console.error('Ошибка при загрузке избранного из хранилища:', error);
      setLocalFavorites([]);
      return [];
    }
  }, []);

  // Синхронизируем локальное состояние при изменении favorites
  useEffect(() => {
    if (favorites && !isClearing) {
      setLocalFavorites(favorites);
    }
  }, [favorites, isClearing]);

  // Добавляем слушатель фокуса для обновления при возвращении на экран
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadFavoritesFromStorage();
    });

    return unsubscribe;
  }, [navigation, loadFavoritesFromStorage]);

  // Функция для обновления по свайпу вниз
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadFavoritesFromStorage();
    setRefreshing(false);
  }, [loadFavoritesFromStorage]);

  // Обработчик переключения на детальную страницу товара
  const handleItemPress = (slug: string) => {
    router.push(`../promo/${slug}`);
  };

  // Обработчик удаления из избранного
  const handleRemove = (itemId: string) => {
    removeFromFavorites(itemId);
    // Также обновляем локальное состояние для мгновенной обратной связи
    setLocalFavorites(prev => prev.filter(item => item.id !== itemId));
  };

  // Принудительная очистка избранного
  const handleForceCleanup = async () => {
    try {
      console.log('Начинаем принудительную очистку избранного...');
      setIsClearing(true);

      // 1. Очистка AsyncStorage
      await AsyncStorage.removeItem('favorites');
      console.log('AsyncStorage очищен');
      
      // 2. Обновляем локальное состояние немедленно
      setLocalFavorites([]);
      
      // 3. Короткая задержка для анимации и затем завершаем процесс очистки
      setTimeout(() => {
        setIsClearing(false);
      }, 500);
      
    } catch (error) {
      console.error('Ошибка при принудительной очистке:', error);
      setIsClearing(false);
    }
  };

  // Отображение загрузки или процесса очистки
  if (favoritesLoading || isClearing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="#000000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Избранное</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#000000" />
          <Text style={styles.loaderText}>
            {isClearing ? 'Очистка избранного...' : 'Загрузка...'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Если нет избранных товаров
  if (!localFavorites || localFavorites.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="#000000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Избранное</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-outline" size={64} color="#CCCCCC" />
          <Text style={styles.emptyText}>В избранном пока ничего нет</Text>
          <TouchableOpacity style={styles.shopButton} onPress={() => router.push('../(tabs)')}>
            <Text style={styles.shopButtonText}>Перейти к покупкам</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Заголовок */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Избранное</Text>
        <TouchableOpacity 
          onPress={handleForceCleanup}
          style={styles.clearButton}
        >
          <Text style={styles.clearText}>Очистить</Text>
        </TouchableOpacity>
      </View>

      {/* Список избранных товаров */}
      <FlatList
        data={localFavorites}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <FavoriteItem
            item={item}
            onPress={handleItemPress}
            onRemove={handleRemove}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#FF3B30"]}
            tintColor="#FF3B30"
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  clearButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  clearText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  listContent: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    marginTop: 16,
    marginBottom: 24,
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
  shopButton: {
    backgroundColor: '#000000',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  shopButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    marginTop: 10,
    fontSize: 16,
    color: '#000000',
  },
});