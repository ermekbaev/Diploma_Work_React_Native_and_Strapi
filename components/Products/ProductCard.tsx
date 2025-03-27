import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import DominantColorBackground from '@/components/Background/DominantColorBackground';

// Импортируем утилиты
import { getPriorityGender, Product } from '@/utils/productHelpers';

interface ProductCardProps {
  product: Product;
  onPress?: (slug: string) => void;
  size?: 'small' | 'medium' | 'large';
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onPress,
  size = 'medium'
}) => {
  const router = useRouter();
  const displayGender = getPriorityGender(product.genders);
  
  // Обработчик нажатия
  const handlePress = () => {
    if (onPress) {
      onPress(product.slug);
    } else {
      router.push(`../promo/${product.slug}`);
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
    >
      <View style={styles.productContainer}>
        <DominantColorBackground 
          imageSrc={product.imageUrl} 
          style={{ width: "100%", height: cardStyle.image.height, borderRadius: 12, overflow: "hidden" }}>
          <Image 
            source={{ uri: product.imageUrl }} 
            style={styles.productImage} 
            defaultSource={require('../../assets/images/bell_icon.png')}
            resizeMode="cover"
          />
        </DominantColorBackground>
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
    // Базовые стили для карточки, конкретные размеры устанавливаются динамически
  },
  productContainer: {
    borderRadius: 12,
    backgroundColor: "#eeeeee",
    padding: 5
  },
  productImage: {
    width: '125%',
    height: '100%',
  },
  productInfoContainer: {
    paddingHorizontal: 4,
    marginTop: 6
  },
  productTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  productMetaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  productBrand: {
    fontSize: 14,
    color: '#000000',
    flex: 1,
  },
  productCategory: {
    fontSize: 14,
    color: '#000000',
    textAlign: 'right',
    flex: 1,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    marginTop: 4,
  },
});

export default ProductCard;