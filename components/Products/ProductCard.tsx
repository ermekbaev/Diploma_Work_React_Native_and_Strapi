import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Импортируем контекст и утилиты
import { useAppContext } from '@/context/AppContext';
import { getPriorityGender, Product } from '@/utils/productHelpers';

interface ProductCardProps {
  product: Product;
  onPress?: (slug: string) => void;
  size?: 'small' | 'medium' | 'large';
  showFavoriteButton?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onPress,
  size = 'medium',
  showFavoriteButton = true
}) => {
  const router = useRouter();
  const displayGender = getPriorityGender(product.genders);
  
  // Получаем функции для работы с избранным
  const { isInFavorites, addToFavorites, removeFromFavorites } = useAppContext();
  
  // Если у товара есть цвета, проверяем, находится ли первый цвет в избранном
  const hasColors = product.colors && product.colors.length > 0;
  const firstColorId = hasColors && product.colors[0] 
  ? typeof product.colors[0] === 'object' && product.colors[0] !== null 
    ? (product.colors[0] as any).id || null
    : typeof product.colors[0] === 'string' || typeof product.colors[0] === 'number' 
      ? Number(product.colors[0]) 
      : null
  : null;
  
  const isFavorite = firstColorId !== null && isInFavorites(product.slug, firstColorId);
  
  // Обработчик нажатия
  const handlePress = () => {
    if (onPress) {
      onPress(product.slug);
    } else {
      router.push(`../promo/${product.slug}`);
    }
  };
  
  // Обработчик нажатия на кнопку избранного
  const handleFavoritePress = (e: any) => {
    e.stopPropagation();
    
    if (!hasColors || firstColorId === null) return;
    
    // Получаем первый цвет товара
    const color = product.colors[0];
    // Более безопасный способ получения имени цвета
    const colorName = typeof color === 'string' 
      ? color //@ts-ignore
      : (color && typeof color === 'object' && 'Name' in color ? color.Name : '');
    
    // Более безопасный способ получения кода цвета
    const colorCode = typeof color === 'string' 
      ? undefined //@ts-ignore
      : (color && typeof color === 'object' && 'colorCode' in color ? color.colorCode : undefined);
    
    if (isFavorite) {
      // Удаляем из избранного
      removeFromFavorites(`${product.slug}-${firstColorId}`);
    } else {
      // Добавляем в избранное
      addToFavorites(
        {
          slug: product.slug,
          Name: product.Name,
          Price: product.Price,
          imageUrl: product.imageUrl,
          brandName: product.brandName,
        },
        {
          id: firstColorId,
          name: colorName,
          colorCode: colorCode
        }
      );
    }
  };
  
  // Определяем стили в зависимости от размера
  const getCardStyle = () => {
    switch(size) {
      case 'small':
        return {
          card: { width: 130, marginRight: 10 },
          image: { height: 130 }
        };
      case 'large':
        return {
          card: { width: Dimensions.get('window').width - 32, marginRight: 0 },
          image: { height: 200 }
        };
      default: // medium
        return {
          card: { width: 170, marginRight: 15 },
          image: { height: 170 }
        };
    }
  };
  
  const cardStyle = getCardStyle();
  
  return (
    <TouchableOpacity
      style={[styles.productCard, cardStyle.card]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={styles.productContainer}>
        <View style={styles.imageContainer}>
          <View style={[
            styles.imageWrapper, 
            { height: cardStyle.image.height }
          ]}>
            <Image 
              source={{ uri: product.imageUrl }} 
              style={styles.productImage} 
              defaultSource={require('../../assets/images/bell_icon.png')}
              resizeMode="cover"
            />
          </View>
          
          {showFavoriteButton && hasColors && (
            <TouchableOpacity 
              style={styles.favoriteButton}
              onPress={handleFavoritePress}
            >
              <Ionicons 
                name={isFavorite ? "heart" : "heart-outline"} 
                size={18} 
                color={isFavorite ? "#FF3B30" : "#000000"} 
              />
            </TouchableOpacity>
          )}
        </View>
        
        <View style={styles.productInfoContainer}>
          <Text style={styles.productTitle} numberOfLines={1} ellipsizeMode="tail">
            {product.Name}
          </Text>
          <View style={styles.productMetaContainer}>
            <Text style={styles.productBrand} numberOfLines={1} ellipsizeMode="tail">
              {product.brandName}
            </Text>
            <Text style={styles.productCategory} numberOfLines={1} ellipsizeMode="tail">
              {displayGender}
            </Text>
          </View>
          <Text style={styles.productPrice}>${product.Price.toFixed(2)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  productCard: {
    marginBottom: 15,
  },
  productContainer: {
    borderRadius: 12,
    backgroundColor: "#f5f5f5", // Более светлый фон
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    borderRadius: 10,
    overflow: 'hidden',
  },
  imageWrapper: {
    width: '100%',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
  },
  productImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  productInfoContainer: {
    paddingHorizontal: 6,
    paddingVertical: 8,
  },
  productTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  productMetaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  productBrand: {
    fontSize: 13,
    color: '#555555',
    flex: 1,
  },
  productCategory: {
    fontSize: 13,
    color: '#555555',
    textAlign: 'right',
    flex: 1,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
});

export default ProductCard;