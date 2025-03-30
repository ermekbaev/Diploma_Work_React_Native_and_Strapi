import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, SafeAreaView, ScrollView, StatusBar } from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppContext } from '@/context/AppContext';

const ProfileScreen = () => {
  const router = useRouter();
  const { favorites } = useAppContext();
  
  // Количество избранных товаров
  const favoritesCount = favorites ? favorites.length : 0;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Профиль</Text>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconButton}>
              <Feather name="bell" size={22} color="#000" />
              <View style={styles.notificationDot}>
                <Text style={styles.notificationText}>2</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <Image
            source={{ uri: 'https://i.pinimg.com/236x/8f/76/61/8f766151ed3c5e57d297c783a4a4b7e7.jpg' }}
            style={styles.profileImage}
          />
          <Text style={styles.profileName}>Adilet Ermekbaev</Text>
          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.editButtonText}>Редактировать профиль</Text>
          </TouchableOpacity>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {/* Добавляем пункт Избранное */}
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push("../favorites")}
          >
            <View style={styles.menuIconContainer}>
              <MaterialIcons name="favorite-outline" size={24} color="#4A4A4A" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>Избранное</Text>
              <Text style={styles.menuSubtitle}>Сохраненные товары</Text>
            </View>
            {favoritesCount > 0 && (
              <View style={styles.badgeContainer}>
                <Text style={styles.badgeText}>{favoritesCount}</Text>
              </View>
            )}
            <MaterialIcons name="chevron-right" size={24} color="#BBBBBB" />
          </TouchableOpacity>
          
          <MenuItem 
            icon="account-circle" 
            title="Личная информация" 
            subtitle="Просмотр личных данных" 
            onPress={() => {}}
          />
          <MenuItem 
            icon="settings" 
            title="Настройки" 
            subtitle="Настройки приложения" 
            onPress={() => {}}
          />
          <MenuItem 
            icon="help-outline" 
            title="Помощь" 
            subtitle="Поддержка и справка" 
            onPress={() => {}}
          />
          <MenuItem 
            icon="info-outline" 
            title="О приложении" 
            subtitle="Условия и политика" 
            onPress={() => {}}
          />
          <MenuItem 
            icon="exit-to-app" 
            title="Выйти" 
            subtitle="" 
            isLast={true}
            onPress={() => {}}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const MenuItem = ({ icon, title, subtitle, isLast = false, onPress } : any) => {
  return (
    <TouchableOpacity 
      style={[styles.menuItem, isLast ? styles.lastMenuItem : null]}
      onPress={onPress}
    >
      <View style={styles.menuIconContainer}>
        <MaterialIcons name={icon} size={24} color="#4A4A4A" />
      </View>
      <View style={styles.menuTextContainer}>
        <Text style={styles.menuTitle}>{title}</Text>
        {subtitle ? <Text style={styles.menuSubtitle}>{subtitle}</Text> : null}
      </View>
      <MaterialIcons name="chevron-right" size={24} color="#BBBBBB" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
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
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingVertical: 25,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E1E1',
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
    color: '#000',
    marginBottom: 15,
  },
  editButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#F2F2F7',
    borderRadius: 20,
  },
  editButtonText: {
    color: '#007AFF',
    fontWeight: '500',
  },
  menuContainer: {
    marginTop: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginHorizontal: 15,
    marginBottom: 20,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E1E1',
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    marginRight: 15,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  menuSubtitle: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  badgeContainer: {
    backgroundColor: '#FF3B30',
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    paddingHorizontal: 5,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;