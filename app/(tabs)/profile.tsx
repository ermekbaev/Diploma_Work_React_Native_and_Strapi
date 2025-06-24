import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, SafeAreaView, ScrollView, StatusBar } from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import ThemeSwitch from '@/components/ThemeSwitch';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

const ProfileScreen = () => {
  const { currentTheme } = useTheme();
  const isDark = currentTheme === 'dark';
  const router = useRouter();
  
  // Состояние для избранных товаров
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Цвета в зависимости от темы
  const colors = {
    background: isDark ? '#121212' : '#F2F2F7',
    card: isDark ? '#1E1E1E' : '#FFFFFF',
    text: isDark ? '#FFFFFF' : '#000000',
    subtext: isDark ? '#BBBBBB' : '#8E8E93',
    border: isDark ? '#2C2C2C' : '#E1E1E1',
    icon: isDark ? '#FFFFFF' : '#4A4A4A',
    iconButton: isDark ? '#333333' : '#F5F5F5',
  };
  
  // Загрузка избранных товаров при монтировании компонента
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        setLoading(true);
        const storedFavorites = await AsyncStorage.getItem('favorites');
        if (storedFavorites) {
          setFavorites(JSON.parse(storedFavorites));
        }
      } catch (error) {
        console.error('Ошибка загрузки избранного:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadFavorites();
  }, []);
  
  // Переход к избранным товарам
  const goToFavorites = () => {
    // Здесь будет переход на страницу избранного
    router.push('/favorites');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <ScrollView>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.card }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Profile</Text>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconButton}>
              <Feather name="bell" size={22} color={colors.icon} />
              <View style={styles.notificationDot}>
                <Text style={styles.notificationText}>2</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Profile Card */}
        <View style={[styles.profileCard, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <Image
            source={{ uri: 'https://i.pinimg.com/236x/8f/76/61/8f766151ed3c5e57d297c783a4a4b7e7.jpg' }}
            style={styles.profileImage}
          />
          <Text style={[styles.profileName, { color: colors.text }]}>Adilet Ermekbaev</Text>
          <TouchableOpacity style={[styles.editButton, { backgroundColor: colors.iconButton }]}>
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Favorites section */}
        <View style={[styles.menuContainer, { backgroundColor: colors.card, marginTop: 20, marginBottom: 10 }]}>
          <TouchableOpacity 
            style={[styles.menuItem, { borderBottomColor: colors.border }]}
            onPress={goToFavorites}
          >
            <View style={[styles.menuIconContainer, { backgroundColor: colors.iconButton }]}>
              <MaterialIcons name="favorite" size={24} color="#FF6B6B" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={[styles.menuTitle, { color: colors.text }]}>Favorites</Text>
              <Text style={[styles.menuSubtitle, { color: colors.subtext }]}>
                {favorites.length} items saved
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={colors.subtext} />
          </TouchableOpacity>
        </View>

        <View style={[styles.menuContainer, { backgroundColor: colors.card }]}>

          <MenuItem 
            icon="account-circle" 
            title="Personal Information" 
            subtitle="View your personal info" 
            colors={colors}
          />
          <MenuItem 
            icon="settings" 
            title="Settings" 
            subtitle="App settings and preferences" 
            colors={colors}
          />
          <MenuItem 
            icon="help-outline" 
            title="Help & Support" 
            subtitle="Get help or contact support" 
            colors={colors}
          />
          <MenuItem 
            icon="info-outline" 
            title="About" 
            subtitle="Terms, Privacy, and App info" 
            colors={colors}
          />
          
          {/* Переключатель темы */}
          <View style={[styles.menuItem, { borderBottomColor: colors.border }]}>
            <View style={[styles.menuIconContainer, { backgroundColor: colors.iconButton }]}>
              <MaterialIcons 
                name={isDark ? "dark-mode" : "light-mode"} 
                size={24} 
                color={colors.icon} 
              />
            </View>
            <View style={styles.themeContainer}>
              <ThemeSwitch showLabel={false} />
            </View>
          </View>
          
          <MenuItem 
            icon="exit-to-app" 
            title="Logout" 
            subtitle="" 
            isLast={true}
            colors={colors}
          />
        </View>

        <View style={[styles.menuContainer, { backgroundColor: colors.card, marginBottom: 10 }]}>
          <TouchableOpacity 
            style={[styles.menuItem, { borderBottomColor: colors.border }]}
            onPress={() => router.push('/(stack)/my-orders')}
          >
            <View style={[styles.menuIconContainer, { backgroundColor: colors.iconButton }]}>
              <MaterialIcons name="receipt-long" size={24} color="#4CAF50" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={[styles.menuTitle, { color: colors.text }]}>Мои заказы</Text>
              <Text style={[styles.menuSubtitle, { color: colors.subtext }]}>
                История покупок и отслеживание
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={colors.subtext} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const MenuItem = ({ icon, title, subtitle, isLast = false, colors } : any) => {
  return (
    <TouchableOpacity 
      style={[
        styles.menuItem, 
        isLast ? styles.lastMenuItem : null,
        { borderBottomColor: colors.border }
      ]}
    >
      <View style={[styles.menuIconContainer, { backgroundColor: colors.iconButton }]}>
        <MaterialIcons name={icon} size={24} color={colors.icon} />
      </View>
      <View style={styles.menuTextContainer}>
        <Text style={[styles.menuTitle, { color: colors.text }]}>{title}</Text>
        {subtitle ? <Text style={[styles.menuSubtitle, { color: colors.subtext }]}>{subtitle}</Text> : null}
      </View>
      <MaterialIcons name="chevron-right" size={24} color={colors.subtext} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerIcons: {
    flexDirection: 'row',
  },
  iconButton: {
    position: 'relative',
    padding: 5,
  },
  notificationDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: 'red',
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  profileCard: {
    alignItems: 'center',
    paddingVertical: 25,
    borderBottomWidth: 1,
  },
  profileImage: {
    width: 110,
    height: 110,
    borderRadius: 40,
    marginBottom: 15,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 15,
  },
  editButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  editButtonText: {
    color: '#007AFF',
    fontWeight: '500',
  },
  menuContainer: {
    borderRadius: 10,
    marginHorizontal: 15,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    marginRight: 15,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  menuSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  themeContainer: {
    flex: 1,
    paddingLeft: 10,
  },
});

export default ProfileScreen;