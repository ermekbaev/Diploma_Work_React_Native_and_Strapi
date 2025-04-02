import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  Alert
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import { fetchModelsByProductId, fetchProductById } from "@/services/api";

// Импорт хука темы
import { useAppTheme } from "@/hooks/useAppTheme";

// Components
import ProductImages from "@/components/Products/ProductImages";
import ColorSelector from "@/components/Products/ColorSelector";
import SizeSelector from "@/components/Products/SizeSelector";
import SectionHeader from "@/components/ui/SectionHeader";

// Utilities
import { getFullImageUrl } from "@/utils/imageHelpers";
import { formatPrice, getColorBackground } from "@/utils/productHelpers";
import useCart from "@/hooks/useCart";
import { useAppContext } from "@/context/AppContext";

// Static data for use in case of errors
const FALLBACK_PRODUCT = {
  id: 0,
  slug: '',
  Name: 'Product not found',
  Description: 'Sorry, we couldn\'t load the product information.',
  Price: 0,
  imageUrls: ["https://via.placeholder.com/400x320?text=No+Image+Available"],
  genders: [],
  colors: [],
  sizes: [],
};

// Interfaces for typing
interface Product {
  id: number;
  slug: string;
  Name: string;
  Description: string;
  Price: number;
  imageUrls: string[];
  genders: Array<{id: number, Gender_Name: string}>;
  colors: Array<{id: number, Name: string, colorCode?: string}>;
  sizes: Array<{id: number, Size: number}>;
  brand?: {
    id: number,
    Brand_Name: string
  };
  category?: {
    id: number,
    Name: string
  };
}

interface ModelData {
  id: number;
  colors: {id: number, Name: string, colorCode?: string};
  images: Array<{url: string}>;
}

export default function PromoDetailScreen() {
  const { slug } = useLocalSearchParams();
  const router = useRouter();
  const navigation = useNavigation();

  // Получаем данные темы
  const { theme, colors } = useAppTheme();
  const isDark = theme === 'dark';

  // Получаем функции из контекста
  const { addToFavorites, removeFromFavorites, isInFavorites } = useAppContext();
  const { addToCart, isInCart, getItemQuantity } = useCart();

  // Data states
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modelsData, setModelsData] = useState<ModelData[]>([]);
  const [productImages, setProductImages] = useState<string[]>([]);
  
  // User selection states
  const [selectedColor, setSelectedColor] = useState<number | null>(null);
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [favorite, setFavorite] = useState<boolean>(false);
  const [itemInCart, setItemInCart] = useState<boolean>(false);
  const [itemQuantity, setItemQuantity] = useState<number>(0);
  
  // Load product data
  const loadProduct = useCallback(async () => {
    try {
      setLoading(true);
      
      // Get product data
      const productData = await fetchProductById(slug as string);
      const productItem = productData?.data?.[0] || FALLBACK_PRODUCT;
      
      // Get product models
      const models = await fetchModelsByProductId(productItem.id);
      
      // Process images
      const initialModel = models[0] || { images: [], colors: { id: null, Name: '' } };
      const imagesUrls = initialModel.images
        ? initialModel.images.map((image: any) => getFullImageUrl(image.url))
        : ["https://via.placeholder.com/400x320?text=No+Image+Available"];

      // Process colors
      const uniqueColors = new Set();
      const colorsArray = models
        .map((model: ModelData) => model.colors)
        .filter((color: any) => {
          if (color && color.id && !uniqueColors.has(color.id)) {
            uniqueColors.add(color.id);
            return true;
          }
          return false;
        });

      // Update product with the colors obtained
      const updatedProduct = {
        ...productItem,
        colors: colorsArray
      };

      setProduct(updatedProduct);
      setModelsData(models);
      setProductImages(imagesUrls);
      
      // Set defaults
      const defaultColorId = colorsArray[0]?.id || null;
      setSelectedColor(defaultColorId);
      
      if (updatedProduct.sizes && updatedProduct.sizes.length > 0) {
        setSelectedSize(updatedProduct.sizes[0].Size);
      }

      // Проверяем, есть ли товар в избранном
      if (defaultColorId !== null) {
        setFavorite(isInFavorites(productItem.slug, defaultColorId));
      }
      
      // Check if item is in cart
      if (defaultColorId && updatedProduct.sizes && updatedProduct.sizes.length > 0) {
        const defaultSize = updatedProduct.sizes[0].Size;
        checkCartStatus(updatedProduct.slug, defaultColorId, defaultSize);
      }

    } catch (err: any) {
      console.error("Error loading product:", err);
      setError(err.message || "Failed to load product");
    } finally {
      setLoading(false);
    }
  }, [slug, isInCart, getItemQuantity]);

  // Load data on component mount
  useEffect(() => {
    if (slug) {
      loadProduct();
    }
  }, [slug, loadProduct]);

  // Tab bar visibility management
  useEffect(() => {
    navigation.getParent()?.setOptions({ tabBarStyle: { display: "flex" } });

    return () => {
      navigation.getParent()?.setOptions({ tabBarStyle: { display: "flex" } });
    };
  }, [navigation]);
  
  
  // Check if item is in cart and get quantity
  const checkCartStatus = useCallback((productSlug: string, colorId: number, size: number) => {
    if (isInCart && getItemQuantity) {
      const inCart = isInCart(productSlug, colorId, size);
      const quantity = getItemQuantity(productSlug, colorId, size);
      
      setItemInCart(inCart);
      setItemQuantity(quantity);
    }
  }, [isInCart, getItemQuantity]);

  
  // Определение цвета фона для изображений продукта
  const getProductBackgroundColor = useCallback((product: Product | null, selectedColorObj: any) => {
    if (!product) return '#F8F8F8';
    
    // Если выбран цвет, и у него есть colorCode, используем его
    if (selectedColorObj && selectedColorObj.colorCode) {
      return selectedColorObj.colorCode;
    }
    
    // Определяем по имени цвета
    if (selectedColorObj && selectedColorObj.Name) {
      const colorName = selectedColorObj.Name.toLowerCase();
      
      // Карта цветов
      const colorMap: Record<string, string> = {
        'green': '#7CFC00',
        'зеленый': '#7CFC00',
        'blue': '#0000FF',
        'синий': '#0000FF',
        'red': '#FF0000',
        'красный': '#FF0000',
        'white': '#F0F0F0',
        'белый': '#F0F0F0',
        'black': '#333333',
        'черный': '#333333',
        'yellow': '#FFEB3B',
        'желтый': '#FFEB3B',
        'pink': '#FF80AB',
        'розовый': '#FF80AB',
        'orange': '#FF9800',
        'оранжевый': '#FF9800',
      };
      
      // Проверяем наличие в имени какого-либо цвета
      for (const colorKey in colorMap) {
        if (colorName.includes(colorKey)) {
          return colorMap[colorKey];
        }
      }
    }
    
    // Проверяем наличие цвета в названии товара
    if (product.Name) {
      const productName = product.Name.toLowerCase();
      const colorTerms = [
        { term: 'green', color: '#7CFC00' },
        { term: 'blue', color: '#0000FF' },
        { term: 'red', color: '#FF0000' },
        { term: 'white', color: '#F0F0F0' },
        { term: 'black', color: '#333333' },
        { term: 'yellow', color: '#FFEB3B' },
        { term: 'pink', color: '#FF80AB' },
        { term: 'orange', color: '#FF9800' },
      ];
      
      for (const { term, color } of colorTerms) {
        if (productName.includes(term)) {
          return color;
        }
      }
    }
    
    // Определяем по бренду
    if (product.brand) {
      const brandName = product.brand.Brand_Name.toLowerCase();
      
      const brandColorMap: Record<string, string> = {
        'nike': '#7CFC00',   // Яркий зеленый для Nike
        'adidas': '#0000FF', // Синий для Adidas
        'puma': '#E1BEE7',   // Фиолетовый для Puma
        'reebok': '#B3E5FC', // Голубой для Reebok
        'new balance': '#FFECB3', // Желтый для New Balance
      };
      
      for (const brandKey in brandColorMap) {
        if (brandName.includes(brandKey)) {
          return brandColorMap[brandKey];
        }
      }
    }
    
    // По умолчанию используем нейтральный цвет
    return '#F5F5F5';
  }, []);

  // Функция для работы с избранным
  const toggleFavorite = () => {
    if (!product || selectedColor === null) return;
    
    // Получаем выбранный цвет
    const selectedColorObj = product.colors.find(c => c.id === selectedColor);
    if (!selectedColorObj) return;
    
    // Создаем уникальный идентификатор для проверки
    const itemId = `${product.slug}-${selectedColor}`;
    
    if (favorite) {
      // Удаляем из избранного
      removeFromFavorites(itemId);
      setFavorite(false);
      Alert.alert("Удалено из избранного", "Товар был удален из избранного");
    } else {
      // Добавляем в избранное
      addToFavorites(
        {
          slug: product.slug,
          Name: product.Name,
          Price: product.Price,
          imageUrl: productImages[0],
          brandName: product.brand?.Brand_Name || 'Unknown Brand',
        },
        {
          id: selectedColorObj.id,
          name: selectedColorObj.Name,
          colorCode: selectedColorObj.colorCode
        }
      );
      setFavorite(true);
      Alert.alert("Добавлено в избранное", "Товар был добавлен в избранное");
    }
  };

  // Handle color selection
  const handleColorSelect = (colorId: number) => {
    setSelectedColor(colorId);
  
    // Find the model corresponding to the selected color
    const selectedModel = modelsData.find((model: ModelData) => 
      model.colors && model.colors.id === colorId
    );

    // Update images based on selected color
    if (selectedModel && selectedModel.images) {
      const imagesUrls = selectedModel.images.map((image: any) => 
        getFullImageUrl(image.url)
      );
      
      setProductImages(imagesUrls.length > 0 
        ? imagesUrls 
        : ["https://via.placeholder.com/400x320?text=No+Image+Available"]
      );
    }
    
    // Check if this combination is in the cart
    if (product && selectedSize) {
      checkCartStatus(product.slug, colorId, selectedSize);
    }

    // Обновляем статус избранного в зависимости от выбранного цвета
    if (product) {
      setFavorite(isInFavorites(product.slug, colorId));
    }
  };

  // Handle size selection
  const handleSizeSelect = (size: number) => {
    setSelectedSize(size);
    
    // Check if this combination is in the cart
    if (product && selectedColor) {
      checkCartStatus(product.slug, selectedColor, size);
    }
  };

  // Get color name by ID
  const getColorNameById = (colorId: number | null) => {
    if (!colorId || !product?.colors) return "";
    const color = product.colors.find(c => c.id === colorId);
    return color ? color.Name : "";
  };

  // Add to cart
  const handleAddToCart = async () => {
    if (!selectedSize || !selectedColor || !product) {
      Alert.alert('Выбор обязателен', 'Пожалуйста, выберите цвет и размер перед добавлением в корзину');
      return;
    }
    
    const selectedColorObject = product.colors.find(c => c.id === selectedColor);
    
    if (!selectedColorObject) {
      Alert.alert('Ошибка', 'Выбранный цвет не найден');
      return;
    }
    
    try {
      // Add to cart (await the Promise)
      const success = await addToCart(
        {
          slug: product.slug,
          Name: product.Name,
          Price: product.Price,
          imageUrl: productImages[0]
        },
        {
          id: selectedColorObject.id,
          Name: selectedColorObject.Name
        },
        selectedSize
      );
      
      if (success) {
        // Update cart status
        checkCartStatus(product.slug, selectedColor, selectedSize);
      }
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось добавить товар в корзину');
    }
  };

  // Show during loading
  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.tint} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Loading product...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show on error
  if (error || !product) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.error }]}>
            {error || 'Product not found'}
          </Text>
          <TouchableOpacity 
            onPress={() => router.back()} 
            style={[styles.backButton, { backgroundColor: colors.cardBackground }]}
          >
            <Ionicons name="chevron-back" size={24} color={colors.icon} />
            <Text style={{ color: colors.text, marginLeft: 5 }}>Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Получаем выбранный объект цвета
  const selectedColorObj = product.colors.find(c => c.id === selectedColor);
  
  // Определяем цвет фона для изображений
  const bgColor = getProductBackgroundColor(product, selectedColorObj);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top panel */}
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={colors.icon} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/(tabs)/cart')}>
          <Ionicons name="cart-outline" size={24} color={colors.icon} />
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        style={{ backgroundColor: colors.background }}
      >
        {/* Product header */}
        <View style={styles.productHeader}>
          <View>
            <Text style={[styles.productTitle, { color: colors.text }]}>
              {product.Name}
            </Text>
            <Text style={[styles.productCategory, { color: colors.placeholder }]}>
              {product.category?.Name || product.genders?.[0]?.Gender_Name || "Footwear"}
            </Text>
          </View>
          <TouchableOpacity onPress={toggleFavorite} style={styles.favoriteButton}>
            <Ionicons 
              name={favorite ? "heart" : "heart-outline"} 
              size={24} 
              color={favorite ? "#FF3B30" : colors.icon} 
            />
          </TouchableOpacity>
        </View>
        
        {/* Product images */}
        <ProductImages 
          images={productImages}
          isDark={isDark}
          colors={colors}
        />
        
        {/* Color selection */}
        {product.colors && product.colors.length > 0 && (
          <View style={styles.sectionContainer}>
            <ColorSelector
              color={product.colors}
              selectedColorId={selectedColor}
              onColorSelect={handleColorSelect}
              isDark={isDark}
              colors={colors}
            />
          </View>
        )}
        
        {/* Product price */}
        <Text style={[styles.price, { color: colors.text }]}>
          {formatPrice(product.Price)}
        </Text>
        
        {/* Size selection */}
        {product.sizes && product.sizes.length > 0 && (
          <View style={styles.sectionContainer}>
            <SizeSelector
              sizes={product.sizes}
              selectedSize={selectedSize}
              onSizeSelect={handleSizeSelect}
              isDark={isDark}
              colors={colors}
            />
          </View>
        )}
        
        {/* Product description */}
        <View style={styles.descriptionContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Description</Text>
          <Text style={[styles.descriptionText, { color: colors.placeholder }]}>
            {product.Description}
          </Text>
        </View>
        
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Add to cart button */}
      <View style={[
        styles.bottomButtonContainer,
        { 
          backgroundColor: colors.card, 
          borderTopColor: colors.border
        }
      ]}>
        {itemInCart ? (
          <View style={styles.cartStatusContainer}>
            <Text style={[styles.inCartText, { color: colors.placeholder }]}>
              Already in cart ({itemQuantity})
            </Text>
            <TouchableOpacity 
              style={[styles.viewCartButton, { backgroundColor: colors.tint }]}
              onPress={() => router.push('/(tabs)/cart')}
            >
              <Text style={styles.viewCartButtonText}>View Cart</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity 
            style={[
              styles.addToCartButton,
              { backgroundColor: colors.tint },
              (!selectedSize || !selectedColor) && [
                styles.disabledButton,
                { backgroundColor: isDark ? '#444444' : '#999999' }
              ]
            ]}
            disabled={!selectedSize || !selectedColor}
            onPress={handleAddToCart}
          >
            <Text style={styles.addToCartButtonText}>Add to Cart</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 0,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
  },
  productHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 16,
    marginTop: 10,
  },
  favoriteButton: {
    padding: 5,
  },
  productTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  productCategory: {
    fontSize: 14,
    marginTop: 2,
  },
  sectionContainer: {
    paddingHorizontal: 16,
    marginHorizontal: 15,
  },
  price: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 15,
    marginBottom: 15,
    paddingHorizontal: 16,
    marginHorizontal: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    marginLeft: 15,
    paddingHorizontal: 16,
  },
  descriptionContainer: {
    marginTop: 10,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
    marginHorizontal: 15,
    paddingHorizontal: 16,
  },
  brandContainer: {
    paddingHorizontal: 16,
    marginTop: 15,
    marginHorizontal: 15,
  },
  brandText: {
    fontSize: 14,
  },
  bottomSpacer: {
    height: 80,
  },
  bottomButtonContainer: {
    position: "absolute",
    bottom: 25,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingVertical: 15,
    borderTopWidth: 1,
  },
  addToCartButton: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  disabledButton: {
    opacity: 0.7,
  },
  addToCartButtonText: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    marginTop: 10,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 20,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 10,
  },
  cartStatusContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  inCartText: {
    fontSize: 14,
  },
  viewCartButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  viewCartButtonText: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "600",
  },
});