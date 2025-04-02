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
import { useAppTheme } from '@/hooks/useAppTheme';
import FavoriteItem from '@/components/Favorites/FavoriteItem';

export default function FavoritesScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { favorites, favoritesLoading, removeFromFavorites } = useAppContext();
  const { theme, colors } = useAppTheme();
  const isDark = theme === 'dark';
  
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
    setLocalFavorites(prev => prev.filter(item => item.id !== itemId));
  };

  // Принудительная очистка избранного
  const handleForceCleanup = async () => {
    try {
      setIsClearing(true);
      await AsyncStorage.removeItem('favorites');
      
      setLocalFavorites([]);
      
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
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { borderBottomColor: colors.border, backgroundColor: colors.card }]}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Избранное</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.tint} />
          <Text style={[styles.loaderText, { color: colors.text }]}>
            {isClearing ? 'Очистка избранного...' : 'Загрузка...'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Если нет избранных товаров
  if (!localFavorites || localFavorites.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { borderBottomColor: colors.border, backgroundColor: colors.card }]}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Избранное</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-outline" size={64} color={colors.placeholder} />
          <Text style={[styles.emptyText, { color: colors.placeholder }]}>В избранном пока ничего нет</Text>
          <TouchableOpacity 
            style={[styles.shopButton, { backgroundColor: colors.tint }]} 
            onPress={() => router.push('../(tabs)')}
          >
            <Text style={styles.shopButtonText}>Перейти к покупкам</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Заголовок */}
      <View style={[styles.header, { borderBottomColor: colors.border, backgroundColor: colors.card }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Избранное</Text>
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
            //@ts-ignore
            onPress={handleItemPress}
            onRemove={handleRemove}
            isDark={isDark}
            colors={colors}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#FF3B30"]}
            tintColor={colors.tint}
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
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
    textAlign: 'center',
  },
  shopButton: {
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
  },
});