import React, { useState } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Dimensions, Text } from 'react-native';
import { useAppTheme } from '@/hooks/useAppTheme';

const { width } = Dimensions.get('window');

interface ProductImagesProps {
  images: string[];
  defaultImage?: string;
  isDark?: boolean;
  colors?: any;
}

const ProductImages: React.FC<ProductImagesProps> = ({
  images,
  defaultImage = "https://placehold.co/400x320/3E4246/FFFFFF?text=No+image",
  isDark: propIsDark,
  colors: propColors
}) => {
  // Получаем данные темы из контекста, если они не переданы через пропсы
  const { theme, colors: themeColors } = useAppTheme();
  const isDark = propIsDark !== undefined ? propIsDark : theme === 'dark';
  const colors = propColors || themeColors;

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  
  // Если изображений нет, показываем плейсхолдер
  if (!images || images.length === 0) {
    images = [defaultImage];
  }
  
  const selectedImage = images[selectedImageIndex];
  
  // Обработчик выбора миниатюры
  const handleThumbnailSelect = (index: number) => {
    setSelectedImageIndex(index);
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.mainImageContainer}>
        {selectedImage ? (
          <View style={[
            styles.imageBackground,
            { backgroundColor: isDark ? colors.cardBackground : '#f0f0f0' }
          ]}>
            <Image 
              source={{ uri: selectedImage }} 
              style={styles.mainImage} 
              resizeMode="contain" 
            />
          </View>
        ) : (
          <View style={[
            styles.placeholderImage,
            { backgroundColor: isDark ? colors.cardBackground : '#F5F5F5' }
          ]}>
            <Text style={[
              styles.placeholderText, 
              { color: isDark ? colors.placeholder : '#999999' }
            ]}>
              Image not available
            </Text>
          </View>
        )}
      </View>
      
      {images.length > 1 && (
        <View style={styles.thumbnailContainer}>
          {images.slice(0, 4).map((image, index) => (
            <TouchableOpacity
              key={`thumb-${index}`}
              style={[
                styles.thumbnail,
                { borderColor: isDark ? colors.border : '#ffffff' },
                selectedImageIndex === index && [
                  styles.selectedThumbnail,
                  { borderColor: isDark ? colors.tint : '#d1cfcf' }
                ]
              ]}
              onPress={() => handleThumbnailSelect(index)}
            >
              <View style={[
                styles.thumbnailBackground,
                { backgroundColor: isDark ? colors.cardBackground : '#f0f0f0' }
              ]}>
                <Image 
                  source={{ uri: image }} 
                  style={styles.thumbnailImage} 
                  resizeMode="contain" 
                />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  mainImageContainer: {
    width: width,
    height: 320,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  imageBackground: {
    width: "100%",
    height: "100%",
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainImage: {
    width: '85%',
    height: '100%',
  },
  placeholderImage: {
    width: width,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 16,
  },
  thumbnailContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  thumbnail: {
    width: 75,
    height: 75,
    borderRadius: 12,
    borderWidth: 0.5,
    overflow: 'hidden',
  },
  thumbnailBackground: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedThumbnail: {
    borderWidth: 1,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
});

export default ProductImages;