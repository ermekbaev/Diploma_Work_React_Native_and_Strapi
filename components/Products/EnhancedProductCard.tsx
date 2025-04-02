// components/Products/EnhancedProductCard.tsx
import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions, FlexStyle } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Импортируем утилиты
import { getPriorityGender, Product } from '@/utils/productHelpers';
import { useAppContext } from '@/context/AppContext';
import { useAppTheme } from '@/hooks/useAppTheme';

interface ProductCardProps {
  product: Product;
  onPress?: (slug: string) => void;
  onAddToFavorites?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  size?: 'small' | 'medium' | 'large';
  viewType?: 'grid' | 'list';
  isFavorite?: boolean;
  isDark?: boolean;
  colors?: any;
}

interface CardStyle {
    card: {
      width?: number | string;
      marginRight?: number;
      flexDirection?: FlexStyle['flexDirection'];
    };
    image: {
      width?: number;
      height: number;
    };
  }

const { width } = Dimensions.get('window');

const EnhancedProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onPress,
  onAddToFavorites,
  onAddToCart,
  size = 'medium',
  viewType = 'grid',
  isFavorite: externalIsFavorite = false,
  isDark: propIsDark,
  colors: propColors
}) => {
  const router = useRouter();
  const displayGender = getPriorityGender(product.genders);
  
  // Получаем тему и цвета из контекста, если они не переданы через пропсы
  const { theme, colors: themeColors } = useAppTheme();
  const isDark = propIsDark !== undefined ? propIsDark : theme === 'dark';
  const colors = propColors || themeColors;
  
  // Получаем контекст приложения
  const { 
    toggleFavorite, 
    isInFavorites 
  } = useAppContext();

  // Вычисляем ID первого цвета товара
  const firstColorId = product.colors && product.colors.length > 0 
    ? (typeof product.colors[0] === 'object' 
        ? (product.colors[0] as any).id || 1
        : 1)
    : 1;
    
  // Обработчик нажатия на карточку
  const handlePress = () => {
    if (onPress) {
      onPress(product.slug);
    } else {
      router.push(`../promo/${product.slug}`);
    }
  };
  
  // Обработчик переключения избранного
  const handleFavoritePress = (e: any) => {
    e.stopPropagation();
    
    // Создаем объект цвета
    const colorObj = {
      id: firstColorId,
      name: typeof product.colors[0] === 'object' 
        ? (product.colors[0] as any).Name || 'Default' 
        : 'Default'
    };
    
    // Используем функцию переключения из контекста
    toggleFavorite(
      {
        slug: product.slug,
        Name: product.Name,
        Price: product.Price,
        imageUrl: product.imageUrl,
        brandName: product.brandName,
      },
      colorObj
    );
    
    // Если есть дополнительный обработчик, вызываем его
    if (onAddToFavorites) {
      onAddToFavorites(product);
    }
  };
  
  // Проверяем, находится ли товар в избранном
  const checkIsFavorite = () => {
    return isInFavorites(product.slug, firstColorId);
  };
  
  // Обработчик добавления в корзину
  const handleAddToCart = (e: any) => {
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product);
    }
  };
  
  // Определяем стили в зависимости от размера и типа отображения
  const getCardStyle = (): CardStyle => {
    // Для сетки
    if (viewType === 'grid') {
      switch(size) {
        case 'small':
          return {
            card: { width: 130, marginRight: 10 },
            image: { height: 130 }
          };
        case 'large':
          return {
            card: { width: width - 32, marginRight: 0 },
            image: { height: 200 }
          };
        default: // medium
          return {
            card: { width: 170, marginRight: 15 },
            image: { height: 170 }
          };
      }
    }
    // Для списка
    else {
      return {
        card: { width: '100%', flexDirection: 'row' as const },
        image: { width: 120, height: 120 }
      };
    }
  };
  const cardStyle = getCardStyle();
  
  // Рендеринг списочного представления
  if (viewType === 'list') {
    return (
      <TouchableOpacity
        style={[
          styles.listContainer,
          { backgroundColor: isDark ? colors.cardBackground : '#f8f8f8' }
        ]}
        onPress={handlePress}
      >
        <View style={styles.listImageContainer}>
          <Image 
            source={{ uri: product.imageUrl }} 
            style={styles.listImage} 
            defaultSource={require('../../assets/images/bell_icon.png')}
            resizeMode="cover"
          />
        </View>
        <View style={styles.listContentContainer}>
          <View style={styles.listTopContent}>
            <Text 
              style={[
                styles.listTitle, 
                { color: colors.text }
              ]} 
              numberOfLines={2}
            >
              {product.Name}
            </Text>
            <View style={styles.metaRow}>
              <Text style={[styles.listMeta, { color: colors.placeholder }]}>
                {product.brandName}
              </Text>
              <Text style={[styles.listMeta, { color: colors.placeholder }]}>
                {displayGender}
              </Text>
            </View>
            <Text style={[styles.listPrice, { color: colors.text }]}>
              ${product.Price.toFixed(2)}
            </Text>
          </View>
          <View style={styles.listActionsContainer}>
            <TouchableOpacity 
              style={[
                styles.actionButton,
                { backgroundColor: isDark ? 'rgba(50, 50, 50, 0.5)' : 'rgba(255, 255, 255, 0.5)' }
              ]}
              onPress={handleFavoritePress}
            >
              <Ionicons
                name={checkIsFavorite() ? "heart" : "heart-outline"} 
                size={22} 
                color={checkIsFavorite() ? "#FF3B30" : colors.icon} 
              />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.actionButton,
                { backgroundColor: isDark ? 'rgba(50, 50, 50, 0.5)' : 'rgba(255, 255, 255, 0.5)' }
              ]}
              onPress={handleAddToCart}
            >
              <Ionicons name="cart-outline" size={22} color={colors.icon} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  }
  
  // Рендеринг отображения сеткой
  return (
    <TouchableOpacity
      style={[styles.productCard, cardStyle.card as any]}
      onPress={handlePress}
    >
      <View style={[
        styles.productContainer,
        { backgroundColor: isDark ? colors.cardBackground : '#f8f8f8' }
      ]}>
        <View style={styles.imageWrapper}>
          <Image 
            source={{ uri: product.imageUrl }} 
            style={[styles.productImage, { height: cardStyle.image.height }]} 
            defaultSource={require('../../assets/images/bell_icon.png')}
            resizeMode="cover"
          />
          <TouchableOpacity 
            style={[
              styles.favoriteButton,
              { backgroundColor: isDark ? 'rgba(40, 40, 40, 0.8)' : 'rgba(255, 255, 255, 0.8)' }
            ]}
            onPress={handleFavoritePress}
          >
            <Ionicons
              name={checkIsFavorite() ? "heart" : "heart-outline"} 
              size={20} 
              color={checkIsFavorite() ? "#FF3B30" : colors.icon} 
            />
          </TouchableOpacity>
        </View>
        <View style={styles.productInfoContainer}>
          <Text 
            style={[
              styles.productTitle, 
              { color: colors.text }
            ]} 
            numberOfLines={1} 
            ellipsizeMode="tail"
          >
            {product.Name}
          </Text>
          <View style={styles.productMetaContainer}>
            <Text 
              style={[
                styles.productBrand, 
                { color: colors.placeholder }
              ]} 
              numberOfLines={1} 
              ellipsizeMode="tail"
            >
              {product.brandName}
            </Text>
            <Text 
              style={[
                styles.productCategory, 
                { color: colors.placeholder }
              ]} 
              numberOfLines={1} 
              ellipsizeMode="tail"
            >
              {displayGender}
            </Text>
          </View>
          <View style={styles.priceActionContainer}>
            <Text style={[styles.productPrice, { color: colors.text }]}>
              ${product.Price.toFixed(2)}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  productCard: {
    marginHorizontal: 6,
    marginVertical: 10,
  },
  productContainer: {
    borderRadius: 12,
    padding: 5,
    overflow: 'hidden',
  },
  imageWrapper: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    borderRadius: 8,
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  productInfoContainer: {
    paddingHorizontal: 6,
    paddingVertical: 8,
  },
  productTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  productMetaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  productBrand: {
    fontSize: 14,
    flex: 1,
  },
  productCategory: {
    fontSize: 14,
    textAlign: 'right',
    flex: 1,
  },
  priceActionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  cartButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Стили для отображения списком
  listContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    width: '100%',
  },
  listImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 12,
    overflow: 'hidden',
  },
  listImage: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  listContentContainer: {
    flex: 1,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  listTopContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  listMeta: {
    fontSize: 14,
  },
  listPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4,
  },
  listActionsContainer: {
    justifyContent: 'space-around',
    paddingLeft: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 4,
  },
});

export default EnhancedProductCard;