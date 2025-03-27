import React from 'react';
import { View, Text, Image, StyleSheet, FlatList, Dimensions, TouchableOpacity } from 'react-native';

const { width } = Dimensions.get('window');

interface PromoItem {
  id: string;
  title: string;
  subtitle: string;
  color: string;
  image: string;
  action?: () => void;
}

interface PromoSliderProps {
  items: PromoItem[];
  onItemPress?: (item: PromoItem) => void;
}

const PromoSlider: React.FC<PromoSliderProps> = ({ items, onItemPress }) => {
  // Обработчик нажатия на кнопку
  const handleShopNow = (item: PromoItem) => {
    if (item.action) {
      item.action();
    } else if (onItemPress) {
      onItemPress(item);
    }
  };
  
  // Рендеринг элемента промо-слайдера
  const renderPromoSlide = ({ item }: { item: PromoItem }) => (
    <View style={[styles.promoSlide, { backgroundColor: item.color }]}>
      <View style={styles.promoContent}>
        <Text style={styles.promoTitle}>{item.title}</Text>
        <Text style={styles.promoSubtitle}>{item.subtitle}</Text>
        <TouchableOpacity 
          style={styles.shopNowButton}
          onPress={() => handleShopNow(item)}
        >
          <Text style={styles.shopNowText}>Shop Now</Text>
        </TouchableOpacity>
      </View>
      <Image 
        source={{ uri: item.image }} 
        style={styles.promoImage} 
        resizeMode="contain"
      />
    </View>
  );
  
  return (
    <View style={styles.promoSliderContainer}>
      <FlatList
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToInterval={width - 32}
        decelerationRate="fast"
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderPromoSlide}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  promoSliderContainer: {
    marginBottom: 20,
  },
  promoSlide: {
    width: width - 32,
    height: 160,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  promoContent: {
    flex: 1,
    justifyContent: 'center',
  },
  promoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  promoSubtitle: {
    fontSize: 14,
    color: '#333333',
    marginBottom: 16,
  },
  shopNowButton: {
    backgroundColor: '#000000',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  shopNowText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  promoImage: {
    width: 120,
    height: 120,
    transform: [{ rotate: '-15deg' }],
  },
});

export default PromoSlider;