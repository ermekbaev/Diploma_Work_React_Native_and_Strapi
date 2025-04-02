import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppContext } from '@/context/AppContext';
import { useAppTheme } from '@/hooks/useAppTheme';

interface FavoriteItemProps {
  item: any;
  onRemove?: (id: string) => void;
  onPress?: (slug: string) => void;
  isDark?: boolean;
  colors?: any;
}

const FavoriteItem: React.FC<FavoriteItemProps> = ({
  item,
  onRemove,
  onPress,
  isDark,
  colors: propColors,
}) => {
  const router = useRouter();
  const { removeFromFavorites } = useAppContext();
  
  // Используем useAppTheme, если цвета не переданы через пропсы
  const { theme, colors: themeColors } = useAppTheme();
  const localIsDark = isDark !== undefined ? isDark : theme === 'dark';
  const colors = propColors || themeColors;
  
  // Проверяем, что item и product существуют
  if (!item || !item.product) {
    return null;
  }
  
  const { id, product, color } = item;
  
  // Безопасное получение цены
  const price = product.Price !== undefined ? product.Price : 0;
  
  // Обработчик нажатия на товар
  const handlePress = () => {
    if (onPress) {
      onPress(product.slug);
    } else {
      router.push(`../promo/${product.slug}`);
    }
  };
  
  // Обработчик удаления из избранного
  const handleRemove = () => {
    if (onRemove) {
      onRemove(id);
    } else if (removeFromFavorites) {
      removeFromFavorites(id);
    }
  };
  
  return (
    <TouchableOpacity 
      style={[
        styles.container, 
        { 
          backgroundColor: localIsDark ? colors.card : '#f8f8f8' 
        }
      ]} 
      onPress={handlePress}
    >
      <View style={[
        styles.imageContainer,
        { backgroundColor: localIsDark ? colors.cardBackground : '#ffffff' }
      ]}>
        <Image
          source={{ uri: product.imageUrl }}
          style={styles.image}
          defaultSource={require('../../assets/images/bell_icon.png')}
          resizeMode="cover"
        />
      </View>
      
      <View style={styles.infoContainer}>
        <Text 
          style={[
            styles.productName, 
            { color: colors.text }
          ]} 
          numberOfLines={2}
        >
          {product.Name}
        </Text>
        
        <View style={styles.detailsRow}>
          <Text 
            style={[
              styles.brandName,
              { color: colors.placeholder }
            ]}
          >
            {product.brandName || 'Бренд'}
          </Text>
          
          {color && color.name && (
            <Text 
              style={[
                styles.colorName,
                { color: colors.placeholder }
              ]}
            >
              Цвет: {color.name}
            </Text>
          )}
        </View>
        
        <View style={styles.priceRow}>
          <Text 
            style={[
              styles.price,
              { color: colors.text }
            ]}
          >
            ${typeof price === 'number' ? price.toFixed(2) : '0.00'}
          </Text>
          
          <TouchableOpacity style={styles.removeButton} onPress={handleRemove}>
            <Ionicons name="trash-outline" size={20} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 12,
    marginBottom: 15,
    overflow: 'hidden',
    padding: 10,
  },
  imageContainer: {
    width: 100,
    height: 100,
    borderRadius: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  infoContainer: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  brandName: {
    fontSize: 14,
  },
  colorName: {
    fontSize: 14,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  removeButton: {
    padding: 5,
  },
});

export default FavoriteItem;