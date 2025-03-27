import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

import ProductCard from '@/components/Products/ProductCard';
import { BrandWithProducts } from '@/utils/productHelpers';

interface BrandSectionProps {
  brand: BrandWithProducts;
  maxProducts?: number;
}

const BrandSection: React.FC<BrandSectionProps> = ({ 
  brand, 
  maxProducts = 5 
}) => {
  const router = useRouter();
  
  // Обработчик нажатия "See All"
  const handleSeeAll = () => {
    router.push(`../brands/${brand.slug}`);
  };
  
  // Ограничиваем количество отображаемых товаров
  const productsToShow = brand.products.slice(0, maxProducts);
  
  return (
    <View style={styles.productSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{brand.name}</Text>
        <TouchableOpacity onPress={handleSeeAll}>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>

      {productsToShow.length > 0 ? (
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={productsToShow}
          keyExtractor={(item) => item.slug}
          renderItem={({ item }) => <ProductCard product={item} />}
          contentContainerStyle={styles.productList}
        />
      ) : (
        <Text style={styles.emptyBrandText}>No products available for this brand</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  productSection: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  seeAllText: {
    fontSize: 14,
    color: '#666666',
  },
  productList: {
    paddingRight: 16,
  },
  emptyBrandText: {
    color: '#666666',
    fontSize: 14,
    textAlign: 'center',
    marginVertical: 10,
  },
});

export default BrandSection;