import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  SafeAreaView
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import { fetchModelsByProductId, fetchProductById } from "@/services/api";

// Компоненты
import ProductImages from "@/components/Products/ProductImages";
import ColorSelector from "@/components/Products/ColorSelector";
import SizeSelector from "@/components/Products/SizeSelector";
import SectionHeader from "@/components/ui/SectionHeader";

// Утилиты
import { getFullImageUrl } from "@/utils/imageHelpers";
import { formatPrice, getColorBackground } from "@/utils/productHelpers";

// Статические данные для использования при ошибках
const FALLBACK_PRODUCT = {
  id: 0,
  slug: '',
  Name: 'Продукт не найден',
  Description: 'К сожалению, не удалось загрузить информацию о продукте.',
  Price: 0,
  imageUrls: ["https://via.placeholder.com/400x320?text=No+Image+Available"],
  genders: [],
  colors: [],
  sizes: [],
};

// Интерфейсы для типизации
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

  // Состояния данных
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modelsData, setModelsData] = useState<ModelData[]>([]);
  const [productImages, setProductImages] = useState<string[]>([]);
  
  // Состояния пользовательского выбора
  const [selectedColor, setSelectedColor] = useState<number | null>(null);
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [favorite, setFavorite] = useState<boolean>(false);
  
  // Функция загрузки данных о продукте
  const loadProduct = useCallback(async () => {
    try {
      setLoading(true);
      
      // Получение данных о продукте
      const productData = await fetchProductById(slug as string);
      const productItem = productData?.data?.[0] || FALLBACK_PRODUCT;
      
      // Получение моделей продукта
      const models = await fetchModelsByProductId(productItem.id);
      
      // Обработка изображений
      const initialModel = models[0] || { images: [], colors: { id: null, Name: '' } };
      const imagesUrls = initialModel.images
        ? initialModel.images.map((image: any) => getFullImageUrl(image.url))
        : ["https://via.placeholder.com/400x320?text=No+Image+Available"];

      // Обработка цветов
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

      // Обновляем продукт с полученными цветами
      const updatedProduct = {
        ...productItem,
        colors: colorsArray
      };

      setProduct(updatedProduct);
      setModelsData(models);
      setProductImages(imagesUrls);
      setSelectedColor(colorsArray[0]?.id || null);

    } catch (err: any) {
      console.error("Error loading product:", err);
      setError(err.message || "Не удалось загрузить продукт");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  // Загрузка данных при монтировании компонента
  useEffect(() => {
    if (slug) {
      loadProduct();
    }
  }, [slug, loadProduct]);

  // Управление видимостью таб-бара
  useEffect(() => {
    navigation.getParent()?.setOptions({ tabBarStyle: { display: "flex" } });

    return () => {
      navigation.getParent()?.setOptions({ tabBarStyle: { display: "flex" } });
    };
  }, [navigation]);

  // Функции управления интерфейсом
  const toggleFavorite = () => {
    setFavorite(!favorite);
  };

  // Обработчик выбора цвета
  const handleColorSelect = (colorId: number) => {
    setSelectedColor(colorId);
  
    // Находим модель, соответствующую выбранному цвету
    const selectedModel = modelsData.find((model: ModelData) => 
      model.colors && model.colors.id === colorId
    );

    // Обновляем изображения в соответствии с выбранным цветом
    if (selectedModel && selectedModel.images) {
      const imagesUrls = selectedModel.images.map((image: any) => 
        getFullImageUrl(image.url)
      );
      
      setProductImages(imagesUrls.length > 0 
        ? imagesUrls 
        : ["https://via.placeholder.com/400x320?text=No+Image+Available"]
      );
    }
  };

  // Обработчик выбора размера
  const handleSizeSelect = (size: number) => {
    setSelectedSize(size);
  };

  // Получение имени цвета по ID
  const getColorNameById = (colorId: number | null) => {
    if (!colorId || !product?.colors) return "";
    const color = product.colors.find(c => c.id === colorId);
    return color ? color.Name : "";
  };

  // Обработчик добавления в корзину
  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) return;
    
    alert(`Product ${product?.Name} (size: ${selectedSize}, color: ${getColorNameById(selectedColor)}) added to cart`);
  };

  // Отображение во время загрузки
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
        <Text style={styles.loadingText}>Loading product...</Text>
      </View>
    );
  }

  // Отображение в случае ошибки
  if (error || !product) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error || 'Product not found'}</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="black" />
          <Text style={{ color: "black", marginLeft: 5 }}>Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Верхняя панель */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="cart-outline" size={24} color="black" />
        </TouchableOpacity>
      </View>
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Заголовок продукта */}
        <View style={styles.productHeader}>
          <View>
            <Text style={styles.productTitle}>{product.Name}</Text>
            <Text style={styles.productCategory}>
              {product.category?.Name || product.genders?.[0]?.Gender_Name || "Footwear"}
            </Text>
          </View>
          <TouchableOpacity onPress={toggleFavorite} style={styles.favoriteButton}>
            <Ionicons 
              name={favorite ? "heart" : "heart-outline"} 
              size={24} 
              color={favorite ? "#FF3B30" : "black"} 
            />
          </TouchableOpacity>
        </View>
        
        {/* Изображения товара */}
        <ProductImages images={productImages} />
        
        {/* Выбор цвета */}
        {product.colors && product.colors.length > 0 && (
          <View style={styles.sectionContainer}>
            <ColorSelector
              colors={product.colors}
              selectedColorId={selectedColor}
              onColorSelect={handleColorSelect}
            />
          </View>
        )}
        
        {/* Цена товара */}
        <Text style={styles.price}>{formatPrice(product.Price)}</Text>
        
        {/* Выбор размера */}
        {product.sizes && product.sizes.length > 0 && (
          <View style={styles.sectionContainer}>
            <SizeSelector
              sizes={product.sizes}
              selectedSize={selectedSize}
              onSizeSelect={handleSizeSelect}
            />
          </View>
        )}
        
        {/* Описание товара */}
        <View style={styles.descriptionContainer}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.descriptionText}>{product.Description}</Text>
        </View>
        
        {/* Информация о бренде */}
        {/* {product.brand && (
          <View style={styles.brandContainer}>
            <Text style={styles.sectionTitle}>Brand</Text>
            <Text style={styles.brandText}>{product.brand.Brand_Name}</Text>
          </View>
        )} */}
        
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Кнопка добавления в корзину */}
      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity 
          style={[
            styles.addToCartButton,
            (!selectedSize || !selectedColor) && styles.disabledButton
          ]}
          disabled={!selectedSize || !selectedColor}
          onPress={handleAddToCart}
        >
          <Text style={styles.addToCartButtonText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
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
    color: "#000000",
  },
  productCategory: {
    fontSize: 14,
    color: "#666666",
    marginTop: 2,
  },
  sectionContainer: {
    paddingHorizontal: 16,
    marginHorizontal: 15,
  },
  price: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000000",
    marginTop: 15,
    marginBottom: 15,
    paddingHorizontal: 16,
    marginHorizontal: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 10,
    marginLeft: 15,
    paddingHorizontal: 16,
  },
  descriptionContainer: {
    marginTop: 10,
  },
  descriptionText: {
    fontSize: 14,
    color: "#333333",
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
    color: "#333333",
  },
  bottomSpacer: {
    height: 80,
  },
  bottomButtonContainer: {
    position: "absolute",
    bottom: 25,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  addToCartButton: {
    backgroundColor: "#000000",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#999999",
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
    backgroundColor: "#FFFFFF",
  },
  loadingText: {
    fontSize: 16,
    color: "#000000",
    marginTop: 10,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: "#FF3B30",
    textAlign: "center",
    marginBottom: 20,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#F0F0F0",
    borderRadius: 10,
  },
});