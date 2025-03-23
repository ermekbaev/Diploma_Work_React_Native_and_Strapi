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
import { useEffect, useState } from "react";
import { fetchModelsByProductId, fetchProductById } from "../../../services/api";
// import { API_BASE_URL } from "../../../config"; // Create a config file for environment variables

// Interface for product data
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

// Interface for model data
interface ModelData {
  id: number;
  colors: {id: number, Name: string};
  images: Array<{url: string}>;
}

const screenWidth = Dimensions.get('window').width;

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

  const getFullImageUrl = (relativePath: string) => {
    if (!relativePath) return "https://via.placeholder.com/400x320?text=No+Image+Available";
  
    if (relativePath.startsWith("http://") || relativePath.startsWith("https://")) {
      return relativePath;
    }
  
    const path = relativePath.startsWith("/") ? relativePath : `/${relativePath}`;
    return `http://192.168.0.103:1337${path}`;
  };
  
  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        
        // Load the main product
        const productData = await fetchProductById(slug as string);
        if (!productData?.data?.length) {
          throw new Error("Product not found");
        }
        
        const productItem = productData.data[0];
        setProduct(productItem);
  
        // Load models
        const models = await fetchModelsByProductId(productItem.id);
        if (!models || models.length === 0) {
          throw new Error("No models found for this product");
        }
        
        setModelsData(models);

        // Set default images (first model)
        const initialModel = models[0];
        let imagesUrls = initialModel && initialModel.images
          ? initialModel.images.map((image: any) => getFullImageUrl(image.url))
          : [];

        if (imagesUrls.length === 0) {
          imagesUrls = ["https://via.placeholder.com/400x320?text=No+Image+Available"];
        }

        setProductImages(imagesUrls);
        
        // Set the first image as selected by default
        if (imagesUrls.length > 0) {
          setSelectedImage(imagesUrls[0]);
        }
  
        // Get colors from models
        const uniqueColors = new Map();
        models.forEach((model: ModelData) => {
          if (model.colors && model.colors.id) {
            uniqueColors.set(model.colors.id, model.colors);
          }
        });
        
        const colorsArray = Array.from(uniqueColors.values());
        
        // Update product with colors
        setProduct(prev => {
          if (!prev) return null;
          return { ...prev, colors: colorsArray };
        });
        
        // Set the first color as selected by default
        if (colorsArray.length > 0) {
          setSelectedColor(colorsArray[0].id);
        }
        
      } catch (err: any) {
        console.error("Error loading product:", err);
        setError(err.message || "Failed to load product");
      } finally {
        setLoading(false);
      }
    };
  
    if (slug) {
      loadProduct();
    }
  }, [slug]);
  console.log(modelsData);
  
  
  useEffect(() => {
    navigation.getParent()?.setOptions({ tabBarStyle: { display: "flex" } });

    return () => {
      navigation.getParent()?.setOptions({ tabBarStyle: { display: "flex" } });
    };
  }, [navigation]);

  // Toggle favorite status
  const toggleFavorite = () => {
    setFavorite(!favorite);
  };

  // Handle color selection
  const handleColorSelect = (colorId: number) => {
    setSelectedColor(colorId);
  
    // Find the model with this color
    const selectedModel = modelsData.find((model: ModelData) => 
      model.colors && model.colors.id === colorId
    );
    // console.log(selectedModel, "selected model");
    
  
    // Update images
    if (selectedModel && selectedModel.images) {
      const imagesUrls = selectedModel.images.map((image: any) => 
        getFullImageUrl(image.url)
      );
      
      setProductImages(imagesUrls.length > 0 
        ? imagesUrls 
        : ["https://via.placeholder.com/400x320?text=No+Image+Available"]
      );
      
      // Update selected image to first image of the new color
      if (imagesUrls.length > 0) {
        setSelectedImage(imagesUrls[0]);
      }
    }
  };
  console.log(productImages);
  

  // Handle size selection
  const handleSizeSelect = (size: number) => {
    setSelectedSize(size);
  };

  // Handle image selection from thumbnails
  const handleThumbnailSelect = (image: string) => {
    setSelectedImage(image);
  };

  // Get color name by ID
  const getColorNameById = (colorId: number | null) => {
    if (!colorId || !product?.colors) return "";
    const color = product.colors.find(c => c.id === colorId);
    return color ? color.Name : "";
  };

  // Loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
        <Text style={styles.loadingText}>Loading product...</Text>
      </View>
    );
  }

  // Error state
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

  // Map color to background color for UI
  const getColorBackground = (colorName: string) => {
    const colorMap: Record<string, string> = {
      'White': '#FFFFFF',
      'Black': '#000000',
      'Brown': '#8B4513',
      'Gray': '#808080',
      'Red': '#FF0000',
      'Blue': '#0000FF',
      'Green': '#008000',
      'Purple': '#800080',
      'Pink': '#FFC0CB',
      'Orange': '#FFA500',
      'Yellow': '#FFFF00',
      // Russian color names
      'Белый': '#FFFFFF',
      'Черный': '#000000',
      'Коричневый': '#8B4513',
      'Серый': '#808080',
      'Красный': '#FF0000',
      'Синий': '#0000FF',
      'Зеленый': '#008000',
      'Фиолетовый': '#800080',
      'Розовый': '#FFC0CB',
      'Оранжевый': '#FFA500',
      'Желтый': '#FFFF00'
    };
    
    return colorMap[colorName] || '#CCCCCC';
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with back button and cart */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="cart-outline" size={24} color="black" />
        </TouchableOpacity>
      </View>
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Product info section */}
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
        
        {/* Main product image - full width */}
        <View style={styles.mainImageContainer}>
          {selectedImage ? (
            <Image source={{ uri: selectedImage }} style={styles.mainImage} resizeMode="contain" />
          ) : (
            <View style={styles.placeholderImage}>
              <Text style={styles.placeholderText}>Image not available</Text>
            </View>
          )}
        </View>
        
        {/* Color selection - small circles */}
        {product.colors && product.colors.length > 0 && (
          <View style={styles.colorSelectionContainer}>
            {product.colors.map((color) => (
              <TouchableOpacity
                key={color.id}
                style={[
                  styles.colorOption,
                  { backgroundColor: getColorBackground(color.Name) },
                  selectedColor === color.id && styles.selectedColorOption,
                  color.Name === 'White' || color.Name === 'Белый' ? { borderWidth: 1, borderColor: '#E0E0E0' } : {}
                ]}
                onPress={() => handleColorSelect(color.id)}
              />
            ))}
          </View>
        )}
        
        {/* Price */}
        <Text style={styles.price}>{product.Price.toFixed(2)} ₽</Text>
        
        {/* Image selection thumbnails */}
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
                <Image source={{ uri: image }} style={styles.thumbnailImage} resizeMode="contain" />
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

        {/* Description section */}
        <View style={styles.descriptionContainer}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.descriptionText}>{product.Description}</Text>
        </View>
        
        {/* Brand section if available */}
        {product.brand && (
          <View style={styles.brandContainer}>
            <Text style={styles.sectionTitle}>Brand</Text>
            <Text style={styles.brandText}>{product.brand.Brand_Name}</Text>
          </View>
        )}
        
        {/* Add spacing at the bottom */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Bottom button */}
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
    width: screenWidth,
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
    width: screenWidth,
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
    borderRadius: 10,
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
    paddingHorizontal: 16,
    marginTop: 10,
    marginHorizontal: 15,
  },
  descriptionText: {
    fontSize: 14,
    color: "#333333",
    lineHeight: 20,
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
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 12,
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