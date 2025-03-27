import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Text,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SearchProps {
  onSearch: (query: string) => void;
  onFilter: () => void;
  placeholder?: string;
  loading?: boolean;
  searchResults?: any[];
  renderResultItem?: (item: any) => React.ReactElement;
}

const SearchComponent: React.FC<SearchProps> = ({
  onSearch,
  onFilter,
  placeholder = "Поиск товаров",
  loading = false,
  searchResults = [],
  renderResultItem
}) => {
  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
    
  const handleSearch = (text: string) => {
    setQuery(text);
    if (text.length > 2) {
      onSearch(text);
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  };
  
  const handleClear = () => {
    setQuery('');
    setShowResults(false);
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search-outline" size={20} color="#A39FAF" style={styles.searchIcon} />
          <TextInput
            placeholder={placeholder}
            placeholderTextColor="#A39FAF"
            style={styles.searchInput}
            value={query}
            onChangeText={handleSearch}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={handleClear}>
              <Ionicons name="close-circle" size={20} color="#A39FAF" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.filterButton} onPress={onFilter}>
          <Ionicons name="options-outline" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      
      {loading && <ActivityIndicator style={styles.loader} color="#000000" />}
      
      {showResults && searchResults.length > 0 && renderResultItem && (
        <View style={styles.resultsContainer}>
          <FlatList
            data={searchResults}
            keyExtractor={(item, index) => `search-result-${index}`}
            renderItem={(listItemData) => renderResultItem && renderResultItem(listItemData)}
            showsVerticalScrollIndicator={true}
            style={styles.resultsList}
          />
        </View>
      )}
      
      {showResults && searchResults.length === 0 && !loading && (
        <View style={styles.noResultsContainer}>
          <Text style={styles.noResultsText}>Ничего не найдено</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    zIndex: 1000, 
    position: 'relative'
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  searchInputContainer: {
    flex: 1,
    height: 45,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    color: '#000000',
  },
  filterButton: {
    width: 45,
    height: 45,
    backgroundColor: '#000000',
    borderRadius: 12,
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
 resultsContainer: {
  position: 'absolute',
  top: 53,
  left: 0,
  right: 0,
  backgroundColor: '#FFFFFF',
  borderRadius: 12,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 5, 
  maxHeight: 300,
  zIndex: 9999, 
},
  resultsList: {
    padding: 10,
  },
  noResultsContainer: {
    position: 'absolute',
    top: 53,
    left: 0,
    right: 0,
    padding: 15,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 9999,
  },
  noResultsText: {
    fontSize: 14,
    color: '#666666',
  },
  loader: {
    marginVertical: 10,
  }
});

export default SearchComponent;