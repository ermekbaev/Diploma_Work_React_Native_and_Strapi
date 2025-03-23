import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';

interface SearchResultItemProps {
  item: {
    slug: string;
    Name: string;
    brandName: string;
    Price: number;
    imageUrl: string;
    genders: string[];
  };
  onPress: (slug: string) => void;
}

const SearchResultItem: React.FC<SearchResultItemProps> = ({ item, onPress }) => {
  // Определение приоритетного гендера для отображения
  const getPriorityGender = (genders: string[]): string => {
    if (!genders || genders.length === 0) return 'Универсальные';
    
    const unisex = genders.find(g => 
      g.toLowerCase() === 'унисекс' || 
      g.toLowerCase() === 'unisex');
    if (unisex) return unisex;
    
    const male = genders.find(g => 
      g.toLowerCase() === 'мужской' || 
      g.toLowerCase() === 'men' || 
      g.toLowerCase() === 'male');
    if (male) return male;
    
    const female = genders.find(g => 
      g.toLowerCase() === 'женский' || 
      g.toLowerCase() === 'women' || 
      g.toLowerCase() === 'female');
    if (female) return female;
    
    const nonKids = genders.filter(g => 
      !g.toLowerCase().includes('детский') && 
      !g.toLowerCase().includes('kids') && 
      !g.toLowerCase().includes('child'));
    
    return nonKids.length > 0 ? nonKids[0] : 'Универсальные';
  };

  const displayGender = getPriorityGender(item.genders);
  

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={() => onPress(item.slug)}
    >
      <Image 
        source={{ uri: item.imageUrl }} 
        style={styles.image}
        defaultSource={require('../../assets/images/bell_icon.png')}
        resizeMode="cover"
      />
      <View style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={1}>{item.Name}</Text>
        <View style={styles.metaContainer}>
          <Text style={styles.brand}>{item.brandName}</Text>
          <Text style={styles.category}>{displayGender}</Text>
        </View>
        <Text style={styles.price}>${item.Price.toFixed(2)}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: '#F8F8F8',
  },
  infoContainer: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  brand: {
    fontSize: 14,
    color: '#666666',
  },
  category: {
    fontSize: 14,
    color: '#666666',
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
});

export default SearchResultItem;