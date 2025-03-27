import React, { useState } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Dimensions, Text } from 'react-native';
import DominantColorBackground from '@/components/Background/DominantColorBackground';

const { width } = Dimensions.get('window');

interface ProductImagesProps {
  images: string[];
  defaultImage?: string;
}

const ProductImages: React.FC<ProductImagesProps> = ({
  images,
  defaultImage = "https://placehold.co/400x320/3E4246/FFFFFF?text=No+image"
}) => {
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
          <DominantColorBackground imageSrc={selectedImage} style={styles.dominantBg}>
            <Image 
              source={{ uri: selectedImage }} 
              style={styles.mainImage} 
              resizeMode="contain" 
            />
          </DominantColorBackground>
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderText}>Image not available</Text>
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
                selectedImageIndex === index && styles.selectedThumbnail
              ]}
              onPress={() => handleThumbnailSelect(index)}
            >
              <DominantColorBackground imageSrc={image} style={styles.thumbnailBg}>
                <Image 
                  source={{ uri: image }} 
                  style={styles.thumbnailImage} 
                  resizeMode="contain" 
                />
              </DominantColorBackground>
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
  dominantBg: {
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
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#999999',
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
    borderColor: '#ffffff',
    overflow: 'hidden',
  },
  thumbnailBg: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedThumbnail: {
    borderColor: '#d1cfcf',
    borderWidth: 1,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
});

export default ProductImages;