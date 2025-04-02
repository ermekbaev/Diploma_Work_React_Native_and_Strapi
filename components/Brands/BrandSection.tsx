import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

import ProductCard from '@/components/Products/ProductCard';
import { BrandWithProducts } from '@/utils/productHelpers';
import { getProductBackgroundColor } from '@/utils/colorHalpers';
import { useAppTheme } from '@/hooks/useAppTheme';

interface BrandSectionProps {
  brand: BrandWithProducts;
  maxProducts?: number;
  colors?: any;
  isDark?: boolean;
}

const BrandSection: React.FC<BrandSectionProps> = ({ 
  brand, 
  maxProducts = 5,
  colors: propColors,
  isDark: propIsDark
}) => {
  const router = useRouter();
  
  // Получаем значения темы из контекста, если они не переданы через пропсы
  const { theme, colors: themeColors } = useAppTheme();
  const isDark = propIsDark !== undefined ? propIsDark : theme === 'dark';
  const colors = propColors || themeColors;
  
  // Обработчик нажатия "See All"
  const handleSeeAll = () => {
    router.push(`../brands/${brand.slug}`);
  };
  
  // Ограничиваем количество отображаемых товаров
  const productsToShow = brand.products.slice(0, maxProducts);
  
  return (
    <View style={styles.productSection}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {brand.name}
        </Text>
        <TouchableOpacity onPress={handleSeeAll}>
          <Text style={[styles.seeAllText, { color: colors.placeholder }]}>
            See All
          </Text>
        </TouchableOpacity>
      </View>

      {productsToShow.length > 0 ? (
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={productsToShow}
          keyExtractor={(item) => item.slug}
          renderItem={({ item }) => {
            const backgroundColor = getProductBackgroundColor({
              slug: item.slug,
              Name: item.Name,
              brandName: item.brandName,
              imageUrl: item.imageUrl,
            });

            return (
              <ProductCard
                product={item}
                isDark={isDark}
                colors={colors}
              />
            );
          }}
          contentContainerStyle={styles.productList}
        />
      ) : (
        <Text style={[styles.emptyBrandText, { color: colors.placeholder }]}>
          No products available for this brand
        </Text>
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
  },
  seeAllText: {
    fontSize: 14,
  },
  productList: {
    paddingRight: 16,
  },
  emptyBrandText: {
    fontSize: 14,
    textAlign: 'center',
    marginVertical: 10,
  },
});

export default BrandSection;