import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const CartItem = ({ item, onRemove, onQuantityChange, onPress } :any) => {
  // Вычисляем общую стоимость позиции
  const totalPrice = item.price * item.quantity;

  return (
    <View style={styles.cartItem}>
      <TouchableOpacity
        onPress={() => onPress(item.productSlug)}
        style={styles.itemImageContainer}
      >
        <Image 
          source={{ uri: item.imageUrl }} 
          style={styles.itemImage}
          defaultSource={require('../../assets/images/bell_icon.png')}
          resizeMode="cover"
        />
      </TouchableOpacity>
      
      <View style={styles.itemDetails}>
        <Text style={styles.itemName} numberOfLines={1} ellipsizeMode="tail">
          {item.name}
        </Text>
        <View style={styles.itemVariantContainer}>
          <Text style={styles.itemVariant}>
            Размер: <Text style={styles.variantValue}>{item.size}</Text>
          </Text>
          <Text style={styles.itemVariant}>
            Цвет: <Text style={styles.variantValue}>{item.color.name}</Text>
          </Text>
        </View>
        
        <View style={styles.priceContainer}>
          <Text style={styles.itemPrice}>{item.price.toFixed(2)} ₽</Text>
          {item.quantity > 1 && (
            <Text style={styles.totalPrice}>Всего: {totalPrice.toFixed(2)} ₽</Text>
          )}
        </View>
        
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
    backgroundColor: '#ffffff'
  },
  itemImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
    marginRight: 15,
    marginLeft: 15,
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
    marginRight: 15,
  },
  itemName: {
    fontWeight: '500',
    fontSize: 16,
    marginBottom: 4,
  },
  itemVariantContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    marginBottom: 5,
  },
  itemVariant: {
    color: '#777',
    fontSize: 13,
  },
  variantValue: {
    color: '#333',
    fontWeight: '500',
  },
  priceContainer: {
    marginTop: 3,
  },
  itemPrice: {
    fontWeight: '600',
    fontSize: 15,
  },
  totalPrice: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
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
  }
});

export default CartItem;