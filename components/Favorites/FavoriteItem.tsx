import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppContext } from '@/context/AppContext';

interface FavoriteItemProps {
  item: any;
  onRemove?: (id: string) => void;
}

const FavoriteItem: React.FC<FavoriteItemProps> = ({ item, onRemove }) => {
  const router = useRouter();
  const { removeFromFavorites } = useAppContext();
  
  // Проверяем, что item и product существуют
  if (!item || !item.product) {
    return null;
  }
  
  const { id, product, color } = item;
  
  // Безопасное получение цены
  const price = product.Price !== undefined ? product.Price : 0;
  
  // Обработчик нажатия на товар
  const handlePress = () => {
    router.push(`../promo/${product.slug}`);
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
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: product.imageUrl }} 
          style={styles.image}
          defaultSource={require('../../assets/images/bell_icon.png')}
          resizeMode="cover"
        />
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={styles.productName} numberOfLines={2}>{product.Name}</Text>
        
        <View style={styles.detailsRow}>
          <Text style={styles.brandName}>{product.brandName || 'Бренд'}</Text>
          
          {color && color.name && (
            <Text style={styles.colorName}>Цвет: {color.name}</Text>
          )}
        </View>
        
        <View style={styles.priceRow}>
          <Text style={styles.price}>${typeof price === 'number' ? price.toFixed(2) : '0.00'}</Text>
          
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
    backgroundColor: '#f8f8f8',
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
    backgroundColor: '#ffffff',
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
    color: '#000000',
    marginBottom: 5,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  brandName: {
    fontSize: 14,
    color: '#666666',
  },
  colorName: {
    fontSize: 14,
    color: '#666666',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
  removeButton: {
    padding: 5,
  },
});

export default FavoriteItem;