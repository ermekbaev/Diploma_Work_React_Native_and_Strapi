import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Определяем интерфейс для элемента корзины
export interface CartItemType {
  id: string;
  productSlug: string;
  name: string;
  price: number;
  quantity: number;
  color: {
    id: number;
    name: string;
  };
  size: number;
  imageUrl: string;
}

interface CartItemProps {
  item: CartItemType;
  onRemove: (id: string) => void;
  onQuantityChange: (id: string, quantity: number) => void;
  onPress: (slug: string) => void;
}

const CartItem: React.FC<CartItemProps> = ({
  item,
  onRemove,
  onQuantityChange,
  onPress
}) => {
  return (
    <View style={styles.cartItem}>
      <TouchableOpacity
        onPress={() => onPress(item.productSlug)}
        style={styles.itemImageContainer}
      >
        <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
      </TouchableOpacity>
      
      <View style={styles.itemDetails}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemVariant}>
          Размер: {item.size}, Цвет: {item.color.name}
        </Text>
        <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
        
        <View style={styles.itemActions}>
          <View style={styles.quantityControl}>
            <TouchableOpacity 
              style={styles.quantityButton}
              onPress={() => onQuantityChange(item.id, item.quantity - 1)}
            >
              <Text style={styles.quantityButtonText}>-</Text>
            </TouchableOpacity>
            
            <Text style={styles.quantityText}>{item.quantity}</Text>
            
            <TouchableOpacity 
              style={styles.quantityButton}
              onPress={() => onQuantityChange(item.id, item.quantity + 1)}
            >
              <Text style={styles.quantityButtonText}>+</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={styles.removeButton}
            onPress={() => onRemove(item.id)}
          >
            <Ionicons name="trash-outline" size={20} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cartItem: {
    flexDirection: 'row',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
    marginRight: 15,
    overflow: 'hidden',
  },
  itemImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  itemDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  itemName: {
    fontWeight: '500',
    fontSize: 16,
    marginBottom: 4,
  },
  itemVariant: {
    color: '#777',
    fontSize: 13,
    marginBottom: 8,
  },
  itemPrice: {
    fontWeight: '600',
    fontSize: 15,
  },
  itemActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 4,
  },
  quantityButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  quantityText: {
    fontSize: 14,
    fontWeight: '500',
    paddingHorizontal: 8,
  },
  removeButton: {
    padding: 8,
  },
});

export default CartItem;