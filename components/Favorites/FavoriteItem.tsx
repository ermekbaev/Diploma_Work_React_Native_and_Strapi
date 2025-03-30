import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getColorBackground } from '@/utils/productHelpers';
import { FavoriteItem as FavoriteItemType } from '@/hooks/useFavorites';

interface FavoriteItemProps {
  item: FavoriteItemType;
  onPress: (slug: string) => void;
  onRemove: (id: string) => void;
}

const FavoriteItem: React.FC<FavoriteItemProps> = ({ item, onPress, onRemove }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.itemContent}
        onPress={() => onPress(item.productSlug)}
        activeOpacity={0.7}
      >
        <View style={[
          styles.imageContainer, 
          { backgroundColor: getColorBackground(item.color, 0.1) }
        ]}>
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.image}
            defaultSource={require('../../assets/images/bell_icon.png')}
            resizeMode="contain"
          />
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
          
          <View style={styles.detailsContainer}>
            <View style={styles.colorContainer}>
              <View 
                style={[
                  styles.colorSwatch, 
                  { backgroundColor: getColorBackground(item.color) }
                ]} 
              />
              <Text style={styles.colorName}>{item.color.name}</Text>
            </View>
            
            <Text style={styles.price}>${item.price.toFixed(2)}</Text>
          </View>
          
          <Text style={styles.brand}>{item.brandName}</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.removeButton} 
        onPress={() => onRemove(item.id)}
      >
        <Ionicons name="close-circle" size={22} color="#FF3B30" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  itemContent: {
    flexDirection: 'row',
    padding: 12,
  },
  imageContainer: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 12,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '80%',
    height: '80%',
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 6,
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  colorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorSwatch: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 6,
    borderWidth: 0.5,
    borderColor: '#E0E0E0',
  },
  colorName: {
    fontSize: 12,
    color: '#666666',
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
  brand: {
    fontSize: 12,
    color: '#999999',
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 10,
  },
});

export default FavoriteItem;