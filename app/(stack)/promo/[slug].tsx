import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  SafeAreaView
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import { fetchModelsByProductId, fetchProductById, IMG_API } from "../../../services/api";
import DominantColorBackground from "@/components/Background/DominantColorBackground";

// Общие константы и утилиты
const SCREEN_WIDTH = Dimensions.get('window').width;
const DEFAULT_IMAGE = "https://via.placeholder.com/400x320?text=No+Image+Available";

// Статические данные для использования при ошибках
const FALLBACK_PRODUCT = {
  id: 0,
  slug: '',
  Name: 'Продукт не найден',
  Description: 'К сожалению, не удалось загрузить информацию о продукте.',
  Price: 0,
  imageUrls: [DEFAULT_IMAGE],
  genders: [],
  colors: [],
  sizes: [],
};


// Утилита для получения полного URL изображения
const getFullImageUrl = (relativePath?: string): string => {
  if (!relativePath) return DEFAULT_IMAGE;

  if (relativePath.startsWith("http://") || relativePath.startsWith("https://")) {
    return relativePath;
  }

  const path = relativePath.startsWith("/") ? relativePath : `/${relativePath}`;
  return `${IMG_API}${path}`;
};

interface Product {
  id: number;
  slug: string;
  Name: string;
  Description: string;
  Price: number;
  imageUrls: string[];
  genders: Array<{id: number, Gender_Name: string}>;
  colors: Array<{id: number, Name: string}>;
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
  colors: {id: number, Name: string};
  images: Array<{url: string}>;
}

export default function PromoDetailScreen() {
  const { slug } = useLocalSearchParams();
  const router = useRouter();
  const navigation = useNavigation();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<number | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [favorite, setFavorite] = useState<boolean>(false);
  const [productImages, setProductImages] = useState<string[]>([]);
  const [modelsData, setModelsData] = useState<ModelData[]>([]);
  
  const loadProduct = useCallback(async () => {
    try {
      setLoading(true);
      
      const productData = await fetchProductById(slug as string);
      const productItem = productData?.data?.[0] || FALLBACK_PRODUCT;
      
      const models = await fetchModelsByProductId(productItem.id);
      
      const initialModel = models[0] || { images: [], colors: { id: null, Name: '' } };
      const imagesUrls = initialModel.images
        ? initialModel.images.map((image: any) => getFullImageUrl(image.url))
        : [DEFAULT_IMAGE];

        const uniqueColors = new Set();
        const colorsArray = models
          .map((model: ModelData) => model.colors)
          .filter((color: any) => {
            if (color && color.id && !uniqueColors.has(color.id)) {
              uniqueColors.add(color.id);
              return true;
            }
            return false;
          })
          .map((color: any) => ({
            ...color,
            colorCode: color.colorCode 
          }));
        

      // Обновляем продукт с полученными цветами
      const updatedProduct = {
        ...productItem,
        colors: colorsArray
      };

      setProduct(updatedProduct);
      setModelsData(models);
      setProductImages(imagesUrls);
      setSelectedImage(imagesUrls[0]);
      setSelectedColor(colorsArray[0]?.id || null);

    } catch (err: any) {
      console.error("Error loading product:", err);
      setError(err.message || "Не удалось загрузить продукт");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    if (slug) {
      loadProduct();
    }
  }, [slug, loadProduct]);
  

  useEffect(() => {
    if (slug) {
      loadProduct();
    }
  }, [slug, loadProduct]);

  
  
  useEffect(() => {
    navigation.getParent()?.setOptions({ tabBarStyle: { display: "flex" } });

    return () => {
      navigation.getParent()?.setOptions({ tabBarStyle: { display: "flex" } });
    };
  }, [navigation]);

  const toggleFavorite = () => {
    setFavorite(!favorite);
  };

  const handleColorSelect = (colorId: number) => {
    setSelectedColor(colorId);
  
    const selectedModel = modelsData.find((model: ModelData) => 
      model.colors && model.colors.id === colorId
    );

    if (selectedModel && selectedModel.images) {
      const imagesUrls = selectedModel.images.map((image: any) => 
        getFullImageUrl(image.url)
      );
      
      setProductImages(imagesUrls.length > 0 
        ? imagesUrls 
        : ["https://via.placeholder.com/400x320?text=No+Image+Available"]
      );
      
      if (imagesUrls.length > 0) {
        setSelectedImage(imagesUrls[0]);
      }
    }
  };

  const handleSizeSelect = (size: number) => {
    setSelectedSize(size);
  };

  const handleThumbnailSelect = (image: string) => {
    setSelectedImage(image);
  };

  const getColorNameById = (colorId: number | null) => {
    if (!colorId || !product?.colors) return "";
    const color = product.colors.find(c => c.id === colorId);
    return color ? color.Name : "";
  };

  const getColorBackground = (color: {Name?: string, colorCode?: string}) => {
    if (color.colorCode) {
      return color.colorCode;
    }
  
    const COLOR_MAP: Record<string, string> = {
      'White': '#FFFFFF', 'Белый': '#FFFFFF',
      'Black': '#000000', 'Черный': '#000000',
      'Brown': '#8B4513', 'Коричневый': '#8B4513',
      'Gray': '#808080', 'Серый': '#808080',
      'Red': '#FF0000', 'Красный': '#FF0000',
      default: '#CCCCCC'
    };
  
    return COLOR_MAP[color.Name || ''] || COLOR_MAP.default;
  };
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
        <Text style={styles.loadingText}>Loading product...</Text>
      </View>
    );
  }

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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="cart-outline" size={24} color="black" />
        </TouchableOpacity>
      </View>
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.productHeader}>
          <View>
            <Text style={styles.productTitle}>{product.Name}</Text>
            <Text style={styles.productCategory}>
              {product.category?.Name || product.genders?.[0]?.Gender_Name || "Footwear"}
            </Text>
          </View>
          <TouchableOpacity onPress={toggleFavorite} style={styles.favoriteButton}>
            <Ionicons name={favorite ? "heart" : "heart-outline"} size={24} color={favorite ? "#FF3B30" : "black"} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.mainImageContainer}>
          {selectedImage ? (
            <DominantColorBackground imageSrc={selectedImage} >
            <Image source={{ uri: selectedImage }} style={styles.mainImage} resizeMode="contain" />
            </DominantColorBackground>
          ) : (
            <View style={styles.placeholderImage}>
              <Text style={styles.placeholderText}>Image not available</Text>
            </View>
          )}
        </View>
        
        {product.colors && product.colors.length > 0 && (
          <View style={styles.colorSelectionContainer}>
            {product.colors.map((color) => (
              <TouchableOpacity
                key={color.id}
                style={[
                  styles.colorOption,
                  { backgroundColor: getColorBackground(color) },
                  selectedColor === color.id && styles.selectedColorOption,
                  color.Name === 'White' || color.Name === 'Белый' ? { borderWidth: 1, borderColor: '#E0E0E0' } : {}
                ]}
                onPress={() => handleColorSelect(color.id)}
              />
            ))}
          </View>
        )}
        
        <Text style={styles.price}>{product.Price.toFixed(2)} ₽</Text>
        
        {productImages.length > 1 && (
          <View style={styles.thumbnailContainer}>
            {productImages.slice(0, 4).map((image, index) => (
              <TouchableOpacity
                key={`thumb-${index}`}
                style={[
                  styles.thumbnail,
                  selectedImage === image && styles.selectedThumbnail
                ]}
                onPress={() => handleThumbnailSelect(image)}
              >
                <DominantColorBackground imageSrc={image} >
                <Image source={{ uri: image }} style={styles.thumbnailImage} resizeMode="contain" />
                </DominantColorBackground>
              </TouchableOpacity>
            ))}
          </View>
        )}
        
        {/* Size selection */}
        <Text style={styles.sectionTitle}>Select Size</Text>
        <View style={styles.sizeContainer}>
          {product.sizes && product.sizes.map((sizeObj) => (
            <TouchableOpacity
              key={sizeObj.id}
              style={[
                styles.sizeOption,
                selectedSize === sizeObj.Size && styles.selectedSizeOption
              ]}
              onPress={() => handleSizeSelect(sizeObj.Size)}
            >
              <Text style={[
                styles.sizeText,
                selectedSize === sizeObj.Size && styles.selectedSizeText
              ]}>
                {sizeObj.Size}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.descriptionContainer}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.descriptionText}>{product.Description}</Text>
        </View>
        
        {/* {product.brand && (
          <View style={styles.brandContainer}>
            <Text style={styles.sectionTitle}>Brand</Text>
            <Text style={styles.brandText}>{product.brand.Brand_Name}</Text>
          </View>
        )} */}
        
        <View style={styles.bottomSpacer} />
      </ScrollView>

      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity 
          style={[
            styles.addToCartButton,
            (!selectedSize || !selectedColor) && styles.disabledButton
          ]}
          disabled={!selectedSize || !selectedColor}
          onPress={() => {
            // You can add cart functionality here
            alert(`Product ${product.Name} (size: ${selectedSize}, color: ${getColorNameById(selectedColor)}) added to cart`);
          }}
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
  mainImageContainer: {
    width: SCREEN_WIDTH,
    height: 320,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    borderRadius: 12,
  },
  mainImage: {
    width: "85%",
    height: "100%",
  },
  placeholderImage: {
    width: SCREEN_WIDTH,
    height: "100%",
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    color: "#999999",
    fontSize: 16,
  },
  colorSelectionContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
    paddingHorizontal: 16,
    gap: 10,
  },
  colorOption: {
    width: 20,
    height: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  selectedColorOption: {
    borderWidth: 2,
    borderColor: "#000000",
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
  thumbnailContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 20,
    marginHorizontal: 15,
  },
  thumbnail: {
    width: 75,
    height: 75,
    borderColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 0.5,
    backgroundColor: "#FFFFFF",
    marginHorizontal:3
  },
  selectedThumbnail: {
    borderColor: "#d1cfcf",
    borderWidth: 0.5,
  },
  thumbnailImage: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 10,
    marginLeft: 15,
    paddingHorizontal: 16,
  },
  sizeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    marginHorizontal: 15,
    gap: 8,
  },
  sizeOption: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    backgroundColor: "#FFFFFF",
    minWidth: 50,
    alignItems: "center",
  },
  selectedSizeOption: {
    borderColor: "#000000",
    backgroundColor: "#000000",
  },
  sizeText: {
    fontSize: 12,
    color: "#000000",
  },
  selectedSizeText: {
    color: "#FFFFFF",
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