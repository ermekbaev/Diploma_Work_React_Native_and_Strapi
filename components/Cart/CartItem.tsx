import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/useAppTheme';

interface CartItemProps {
  item: any;
  onRemove: (id: string) => void;
  onQuantityChange: (id: string, quantity: number) => void;
  onPress: (slug: string) => void;
  isDark?: boolean;
  colors?: any;
}

const CartItem: React.FC<CartItemProps> = ({ 
  item, 
  onRemove, 
  onQuantityChange, 
  onPress,
  isDark: propIsDark,
  colors: propColors 
}) => {
  // Получаем данные темы из контекста, если они не переданы через пропсы
  const { theme, colors: themeColors } = useAppTheme();
  const isDark = propIsDark !== undefined ? propIsDark : theme === 'dark';
  const colors = propColors || themeColors;

  // Вычисляем общую стоимость позиции
  const totalPrice = item.price * item.quantity;

  return (
    <View style={[
      styles.cartItem, 
      { 
        borderBottomColor: colors.border,
        backgroundColor: colors.card 
      }
    ]}>
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
        <Text 
          style={[styles.itemName, { color: colors.text }]} 
          numberOfLines={1} 
          ellipsizeMode="tail"
        >
          {item.name}
        </Text>
        <View style={styles.itemVariantContainer}>
          <Text style={[styles.itemVariant, { color: colors.placeholder }]}>
            Размер: <Text style={[styles.variantValue, { color: colors.text }]}>{item.size}</Text>
          </Text>
          <Text style={[styles.itemVariant, { color: colors.placeholder }]}>
            Цвет: <Text style={[styles.variantValue, { color: colors.text }]}>{item.color.name}</Text>
          </Text>
        </View>
        
        <View style={styles.priceContainer}>
          <Text style={[styles.itemPrice, { color: colors.text }]}>
            {item.price.toFixed(2)} ₽
          </Text>
          {item.quantity > 1 && (
            <Text style={[styles.totalPrice, { color: colors.placeholder }]}>
              Всего: {totalPrice.toFixed(2)} ₽
            </Text>
          )}
        </View>
        
        <View style={styles.itemActions}>
          <View style={[
            styles.quantityControl, 
            { backgroundColor: isDark ? colors.cardBackground : '#f5f5f5' }
          ]}>
            <TouchableOpacity 
              style={styles.quantityButton}
              onPress={() => onQuantityChange(item.id, item.quantity - 1)}
            >
              <Text style={[styles.quantityButtonText, { color: colors.text }]}>-</Text>
            </TouchableOpacity>
            
            <Text style={[styles.quantityText, { color: colors.text }]}>{item.quantity}</Text>
            
            <TouchableOpacity 
              style={styles.quantityButton}
              onPress={() => onQuantityChange(item.id, item.quantity + 1)}
            >
              <Text style={[styles.quantityButtonText, { color: colors.text }]}>+</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={styles.removeButton}
            onPress={() => onRemove(item.id)}
          >
            <Ionicons name="trash-outline" size={20} color={colors.error} />
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
  },
  itemImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 10,
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
    fontSize: 13,
  },
  variantValue: {
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